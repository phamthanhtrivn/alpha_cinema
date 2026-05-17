package com.movieticket.ai.service;

import com.movieticket.ai.dto.response.ChatClearResponse;
import com.movieticket.ai.dto.response.ChatHistoryMessage;
import com.movieticket.ai.model.ChatConversation;
import com.movieticket.ai.model.ChatMessage;
import com.movieticket.ai.model.ChatRole;
import com.movieticket.ai.repository.ChatConversationRepository;
import com.movieticket.ai.repository.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.MessageType;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatMemoryService {
    private final ChatMemory chatMemory;
    private final ChatConversationRepository conversationRepository;
    private final ChatMessageRepository messageRepository;

    public String resolveConversationId(String conversationId) {
        if (conversationId != null && !conversationId.isBlank()) {
            return conversationId;
        }

        return UUID.randomUUID().toString();
    }

    public List<ChatHistoryMessage> getRecentMessages(String conversationId, int limit) {
        List<Message> messages = chatMemory.get(conversationId);
        int startIndex = Math.max(0, messages.size() - limit);

        return messages.subList(startIndex, messages.size())
                .stream()
                .map(this::toChatHistoryMessage)
                .toList();
    }

    public List<ChatHistoryMessage> getConversationMessages(String conversationId) {
        if (conversationId == null || conversationId.isBlank()) {
            return List.of();
        }

        try {
            return chatMemory.get(conversationId)
                    .stream()
                    .map(this::toChatHistoryMessage)
                    .toList();
        } catch (Exception ex) {
            log.warn("Failed to load chat history from ChatMemory. conversationId={}, error={}", conversationId, ex.getMessage());
            return List.of();
        }
    }

    public int countMessages(String conversationId) {
        return chatMemory.get(conversationId).size();
    }

    public void append(String conversationId, ChatRole role, String content) {
        if (content == null || content.isBlank()) {
            return;
        }

        if (role == ChatRole.USER) {
            chatMemory.add(conversationId, new UserMessage(content.trim()));
            return;
        }

        chatMemory.add(conversationId, new AssistantMessage(content.trim()));
    }

    public void ensureExchangeRecorded(String conversationId, String question, String answer) {
        if (conversationId == null || conversationId.isBlank()) {
            return;
        }

        List<Message> messages = chatMemory.get(conversationId);
        if (hasLatestExchange(messages, question, answer)) {
            return;
        }

        append(conversationId, ChatRole.USER, question);
        append(conversationId, ChatRole.ASSISTANT, answer);
    }

    @Transactional
    public ChatClearResponse archiveAndClear(String conversationId, String customerId, String customerName) {
        List<Message> messages = chatMemory.get(conversationId);
        log.info(
                "Archiving chat conversation. conversationId={}, memoryMessageCount={}, customerId={}",
                conversationId,
                messages.size(),
                normalizeCustomerId(customerId)
        );

        if (messages.isEmpty()) {
            clearMemory(conversationId);
            log.info("No messages found in ChatMemory. Cleared memory only. conversationId={}", conversationId);
            return ChatClearResponse.builder()
                    .conversationId(conversationId)
                    .archivedMessageCount(0)
                    .build();
        }

        if (conversationRepository.existsById(conversationId)) {
            long archivedMessageCount = messageRepository.countByConversationId(conversationId);
            clearMemory(conversationId);
            log.info(
                    "Conversation was already archived. Cleared memory only. conversationId={}, archivedMessageCount={}",
                    conversationId,
                    archivedMessageCount
            );

            return ChatClearResponse.builder()
                    .conversationId(conversationId)
                    .archivedMessageCount(Math.toIntExact(archivedMessageCount))
                    .build();
        }

        String normalizedCustomerId = normalizeCustomerId(customerId);
        List<ChatMessage> chatMessages = toChatMessages(conversationId, messages);
        ChatConversation conversation = new ChatConversation(
                conversationId,
                normalizedCustomerId,
                normalizeCustomerName(normalizedCustomerId, customerName),
                chatMessages.size()
        );
        conversationRepository.save(conversation);
        messageRepository.saveAll(chatMessages);
        clearMemoryAfterCommit(conversationId);
        log.info(
                "Archived chat conversation successfully. conversationId={}, archivedMessageCount={}",
                conversationId,
                chatMessages.size()
        );

        return ChatClearResponse.builder()
                .conversationId(conversationId)
                .archivedMessageCount(chatMessages.size())
                .build();
    }

    @Transactional
    public boolean archiveConversationIfNecessary(
            String conversationId,
            String customerId,
            String customerName,
            int maxMessages
    ) {
        if (conversationId == null || conversationId.isBlank() || countMessages(conversationId) < maxMessages) {
            return false;
        }

        archiveAndClear(conversationId, customerId, customerName);
        return true;
    }

    public void clearMemory(String conversationId) {
        if (conversationId != null && !conversationId.isBlank()) {
            chatMemory.clear(conversationId);
        }
    }

    private void clearMemoryAfterCommit(String conversationId) {
        if (!TransactionSynchronizationManager.isSynchronizationActive()) {
            clearMemory(conversationId);
            return;
        }

        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                clearMemory(conversationId);
            }
        });
    }

    private ChatHistoryMessage toChatHistoryMessage(Message message) {
        ChatHistoryMessage chatHistoryMessage = new ChatHistoryMessage();
        chatHistoryMessage.setRole(toRoleText(message.getMessageType()));
        chatHistoryMessage.setContent(message.getText());
        return chatHistoryMessage;
    }

    private List<ChatMessage> toChatMessages(String conversationId, List<Message> messages) {
        Instant baseCreatedAt = Instant.now();

        return IntStream.range(0, messages.size())
                .mapToObj(index -> new IndexedMessage(index, messages.get(index)))
                .filter(indexedMessage -> toChatRole(indexedMessage.message().getMessageType()) != null)
                .filter(indexedMessage -> indexedMessage.message().getText() != null && !indexedMessage.message().getText().isBlank())
                .map(indexedMessage -> new ChatMessage(
                        conversationId,
                        toChatRole(indexedMessage.message().getMessageType()),
                        indexedMessage.message().getText().trim(),
                        baseCreatedAt.plusMillis(indexedMessage.index())
                ))
                .toList();
    }

    private ChatRole toChatRole(MessageType messageType) {
        if (MessageType.USER.equals(messageType)) {
            return ChatRole.USER;
        }

        if (MessageType.ASSISTANT.equals(messageType)) {
            return ChatRole.ASSISTANT;
        }

        return null;
    }

    private String toRoleText(MessageType messageType) {
        if (MessageType.USER.equals(messageType)) {
            return "user";
        }

        return "assistant";
    }

    private String normalizeCustomerId(String customerId) {
        if (customerId == null || customerId.isBlank() || customerId.startsWith("guest:")) {
            return null;
        }

        return customerId;
    }

    private String normalizeCustomerName(String customerId, String customerName) {
        if (customerId == null) {
            return "Khách vãng lai";
        }

        if (customerName == null || customerName.isBlank()) {
            return "Khách hàng";
        }

        return customerName.trim();
    }

    private boolean hasLatestExchange(List<Message> messages, String question, String answer) {
        if (messages == null || messages.size() < 2) {
            return false;
        }

        Message userMessage = messages.get(messages.size() - 2);
        Message assistantMessage = messages.get(messages.size() - 1);

        return MessageType.USER.equals(userMessage.getMessageType())
                && MessageType.ASSISTANT.equals(assistantMessage.getMessageType())
                && hasSameText(userMessage, question)
                && hasSameText(assistantMessage, answer);
    }

    private boolean hasSameText(Message message, String expectedText) {
        String messageText = message.getText();
        return messageText != null
                && expectedText != null
                && messageText.trim().equals(expectedText.trim());
    }

    private record IndexedMessage(int index, Message message) {
    }
}

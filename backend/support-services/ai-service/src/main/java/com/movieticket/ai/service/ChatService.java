package com.movieticket.ai.service;

import com.movieticket.ai.dto.ChatHistoryMessage;
import com.movieticket.ai.dto.ChatRequest;
import com.movieticket.ai.dto.ChatResponse;
import com.movieticket.ai.dto.CitationResponse;
import com.movieticket.ai.model.ChatRole;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.document.Document;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
public class ChatService {
    private static final int MAX_POLICY_CONTEXTS = 5;
    private static final int MAX_CONTEXT_MESSAGES = 15;
    private static final int LONG_CONVERSATION_WARNING_MESSAGES = 24;

    private final ChatClient chatClient;
    private final ChatMemory chatMemory;
    private final KnowledgeService knowledgeService;
    private final ChatMemoryService chatMemoryService;

    public ChatResponse answerCustomerQuestion(ChatRequest request) {
        String conversationId = chatMemoryService.resolveConversationId(request.getConversationId());
        if (hasConversationId(request) && chatMemoryService.archiveConversationIfNecessary(
                conversationId,
                request.getCustomerId(),
                request.getCustomerName(),
                LONG_CONVERSATION_WARNING_MESSAGES
        )) {
            conversationId = chatMemoryService.resolveConversationId(null);
        }

        List<ChatHistoryMessage> conversationMessages = resolveConversationMessages(conversationId, request);
        String searchQuery = buildSearchQuery(request.getQuestion(), conversationMessages);
        List<Document> policyDocuments = knowledgeService.searchPolicyDocuments(searchQuery, MAX_POLICY_CONTEXTS);

        if (policyDocuments.isEmpty()) {
            String fallbackAnswer = "Mình chưa tìm thấy thông tin phù hợp trong các chính sách hiện có. Bạn có thể hỏi lại cụ thể hơn về đặt vé, thanh toán, hoàn vé, mã QR, điểm thành viên hoặc bảo mật tài khoản nhé.";
            chatMemoryService.append(conversationId, ChatRole.USER, request.getQuestion());
            chatMemoryService.append(conversationId, ChatRole.ASSISTANT, fallbackAnswer);
            int nextMessageCount = chatMemoryService.countMessages(conversationId);

            return ChatResponse.builder()
                    .conversationId(conversationId)
                    .answer(fallbackAnswer)
                    .citations(List.of())
                    .shouldStartNewConversation(shouldSuggestNewConversation(nextMessageCount))
                    .conversationMessageCount(nextMessageCount)
                    .build();
        }

        String finalConversationId = conversationId;
        String answer = chatClient.prompt()
                .system("""
                        Bạn là trợ lý chăm sóc khách hàng của Alpha Cinema.
                        Chỉ trả lời dựa trên CONTEXT là các chính sách nội bộ được cung cấp.
                        Dùng các tin nhắn trước đó do ChatMemoryAdvisor cung cấp để hiểu ngữ cảnh, đại từ và câu hỏi nối tiếp của khách.
                        Không xem lịch sử trò chuyện là nguồn chính sách; chính sách phải đến từ CONTEXT.
                        Trả lời bằng tiếng Việt, thân thiện, rõ ràng, ngắn gọn.
                        Khi câu trả lời có nhiều điều kiện hoặc bước thực hiện, hãy dùng gạch đầu dòng hoặc đánh số.
                        Nếu CONTEXT không có thông tin để kết luận, hãy nói rằng bạn chưa có đủ thông tin trong chính sách hiện tại.
                        Không tự bịa điều khoản, số tiền, thời hạn hoặc quy trình ngoài CONTEXT.

                        CONTEXT:
                        %s
                        """.formatted(buildPolicyContext(policyDocuments)))
                .advisors(advisorSpec -> advisorSpec
                        .advisors(MessageChatMemoryAdvisor.builder(chatMemory).build())
                        .param(ChatMemory.CONVERSATION_ID, finalConversationId)
                )
                .user(request.getQuestion())
                .call()
                .content();

        chatMemoryService.ensureExchangeRecorded(conversationId, request.getQuestion(), answer);
        int nextMessageCount = chatMemoryService.countMessages(conversationId);

        return ChatResponse.builder()
                .conversationId(conversationId)
                .answer(answer)
                .citations(buildCitations(policyDocuments))
                .shouldStartNewConversation(shouldSuggestNewConversation(nextMessageCount))
                .conversationMessageCount(nextMessageCount)
                .build();
    }

    private boolean shouldSuggestNewConversation(int messageCount) {
        return messageCount >= LONG_CONVERSATION_WARNING_MESSAGES;
    }

    private boolean hasConversationId(ChatRequest request) {
        return request.getConversationId() != null && !request.getConversationId().isBlank();
    }

    private List<ChatHistoryMessage> resolveConversationMessages(String conversationId, ChatRequest request) {
        return chatMemoryService.getRecentMessages(conversationId, MAX_CONTEXT_MESSAGES);
    }

    private String buildSearchQuery(String question, List<ChatHistoryMessage> messages) {
        List<ChatHistoryMessage> safeMessages = safeMessages(messages);
        String recentContext = safeMessages.stream()
                .filter(Objects::nonNull)
                .filter(message -> message.getContent() != null && !message.getContent().isBlank())
                .skip(Math.max(0, safeMessages.size() - 6))
                .map(ChatHistoryMessage::getContent)
                .reduce("", (left, right) -> left + "\n" + right);

        if (recentContext.isBlank()) {
            return question;
        }

        return recentContext + "\n" + question;
    }

    private List<ChatHistoryMessage> safeMessages(List<ChatHistoryMessage> messages) {
        return messages == null ? List.of() : messages;
    }

    private String buildPolicyContext(List<Document> documents) {
        return IntStream.range(0, documents.size())
                .mapToObj(index -> {
                    Document document = documents.get(index);
                    Map<String, Object> metadata = document.getMetadata();
                    return """
                            [Nguồn %d: %s | Chủ đề: %s]
                            %s
                            """.formatted(
                            index + 1,
                            metadata.getOrDefault("source", "unknown"),
                            metadata.getOrDefault("topic", "general"),
                            document.getText()
                    );
                })
                .reduce("", (left, right) -> left + "\n" + right);
    }

    private List<CitationResponse> buildCitations(List<Document> documents) {
        return documents.stream()
                .map(document -> {
                    Map<String, Object> metadata = document.getMetadata();
                    return CitationResponse.builder()
                            .source(String.valueOf(metadata.getOrDefault("source", "unknown")))
                            .topic(String.valueOf(metadata.getOrDefault("topic", "general")))
                            .chunkIndex(toInteger(metadata.get("chunkIndex")))
                            .preview(toPreview(document.getText()))
                            .build();
                })
                .toList();
    }

    private Integer toInteger(Object value) {
        if (value instanceof Number number) {
            return number.intValue();
        }

        if (value instanceof String text) {
            try {
                return Integer.parseInt(text);
            } catch (NumberFormatException ignored) {
                return null;
            }
        }

        return null;
    }

    private String toPreview(String text) {
        String normalizedText = text.replaceAll("\\s+", " ").trim();
        if (normalizedText.length() <= 220) {
            return normalizedText;
        }

        return normalizedText.substring(0, 220) + "...";
    }
}

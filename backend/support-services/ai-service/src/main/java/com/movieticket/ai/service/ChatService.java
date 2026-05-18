package com.movieticket.ai.service;

import com.movieticket.ai.common.ImageFetchUtil;
import com.movieticket.ai.dto.ChatHistoryMessage;
import com.movieticket.ai.dto.ChatRequest;
import com.movieticket.ai.dto.ChatResponse;
import com.movieticket.ai.dto.CitationResponse;
import com.movieticket.ai.tool.AiCustomerContext;
import com.movieticket.ai.tool.AlphaCinemaTool;
import com.movieticket.ai.tool.AlphaCustomerTool;
import com.movieticket.ai.tool.AlphaMovieTool;
import com.movieticket.ai.tool.AlphaTicketTool;
import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.document.Document;
import org.springframework.stereotype.Service;
import org.springframework.util.MimeTypeUtils;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.IntStream;
import org.springframework.ai.content.Media;
import org.springframework.core.io.Resource;

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
    private final AlphaMovieTool alphaMovieTool;
    private final AlphaCinemaTool alphaCinemaTool;
    private final AlphaCustomerTool alphaCustomerTool;
    private final AlphaTicketTool alphaTicketTool;
     private final ImageFetchUtil imageFetchUtil;

    public Flux<String> streamChat(String message) {
        return chatClient.prompt()
                .user(message)
                .stream()
                .content();
    }

     public String describeImage(String message, String imageUrl) {
        Resource imageResource = imageFetchUtil.fetchImageAsResource(imageUrl);
        if (imageResource == null) {
            return "Không thể tải hình ảnh từ URL cung cấp.";
        }

        UserMessage userMessage = UserMessage.builder()
                .text(message)
                .media(new Media(MimeTypeUtils.IMAGE_JPEG, imageResource))
                .build();

        return chatClient.prompt()
                .messages(userMessage)
                .call()
                .content();
    }



    public ChatResponse answerCustomerQuestion(ChatRequest request) {
        String conversationId = chatMemoryService.resolveConversationId(request.getConversationId());
        if (hasConversationId(request) && chatMemoryService.archiveConversationIfNecessary(
                conversationId,
                request.getCustomerId(),
                request.getCustomerName(),
                LONG_CONVERSATION_WARNING_MESSAGES)) {
            conversationId = chatMemoryService.resolveConversationId(null);
        }

        List<ChatHistoryMessage> conversationMessages = resolveConversationMessages(conversationId);
        String searchQuery = buildSearchQuery(request.getQuestion(), conversationMessages);
        List<Document> policyDocuments = knowledgeService.searchPolicyDocuments(searchQuery, MAX_POLICY_CONTEXTS);

        String finalConversationId = conversationId;
        AiCustomerContext.setCustomerId(request.getCustomerId());
        String answer;
        try {
            answer = chatClient.prompt()
                    .system(buildSystemPrompt(policyDocuments, request))
                    .advisors(advisorSpec -> advisorSpec
                            .advisors(MessageChatMemoryAdvisor.builder(chatMemory).build())
                            .param(ChatMemory.CONVERSATION_ID, finalConversationId))
                    .tools(alphaMovieTool, alphaCinemaTool, alphaCustomerTool, alphaTicketTool)
                    .user(request.getQuestion())
                    .call()
                    .content();
        } finally {
            AiCustomerContext.clear();
        }

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

    private List<ChatHistoryMessage> resolveConversationMessages(String conversationId) {
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

    private String buildSystemPrompt(List<Document> policyDocuments, ChatRequest request) {
        String policyContext = policyDocuments.isEmpty()
                ? "Khong co policy context phu hop tu Vector DB cho cau hoi hien tai."
                : buildPolicyContext(policyDocuments);
        String customerState = request.getCustomerId() == null || request.getCustomerId().isBlank()
                ? "ANONYMOUS"
                : "AUTHENTICATED";

        return """
                Ban la AI chatbot ho tro khach hang cua he thong Alpha Cinema.

                Ban co hai nguon thong tin:
                1. Vector DB/RAG: dung cho chinh sach, quy dinh, FAQ, huong dan, thong tin it thay doi.
                2. Tools realtime: dung cho du lieu hien tai tu he thong nhu phim dang chieu, suat chieu, ghe trong, rap/chi nhanh, gia ve, diem thanh vien, hang thanh vien, don hang va trang thai thanh toan.

                Quy tac bat buoc:
                - Neu nguoi dung hoi du lieu hien tai, phai goi tool phu hop.
                - Khong tu bia phim, suat chieu, gio chieu, ghe trong, gia ve, diem thanh vien hoac don hang.
                - Neu tool tra ve rong, hay noi ro la hien chua tim thay du lieu phu hop.
                - Neu service loi hoac timeout, hay xin loi ngan gon va noi he thong dang chua lay duoc du lieu realtime.
                - Voi cau hoi chinh sach, quy dinh, FAQ, hay uu tien du lieu tu Vector DB/RAG trong CONTEXT.
                - Voi cau hoi tiep noi nhu "suat do", "rap do", "phim do", hay dua vao chat memory de hieu ngu canh truoc do.
                - Khi tra loi suat chieu, uu tien trinh bay: ten phim, rap, dinh dang, loai dich thuat, phong neu co, gio chieu, so ghe con trong, gia thap nhat neu co.
                - Khi tra loi thong tin phim, neu nguoi dung hoi mo ta/noi dung/dien vien/dao dien/thoi luong/trailer/the loai/phan loai tuoi, phai goi getMovieDetail neu chua co du thong tin chi tiet trong lich su.
                - Khi tra loi ve ghe trong, chi dung du lieu tool tra ve, khong doan.
                - Khi tra loi ve gia ve hoac khuyen mai, phai goi tool phu hop va chi dung du lieu tool tra ve.
                - Khong tiet lo du lieu ca nhan cua khach hang khac.
                - Khi khach hoi chi tiet mot don hang cu the nhu phim nao, suat chieu nao, ghe nao, combo/san pham nao, QR, tong tien, giam gia diem hoac ma khuyen mai cua don do, phai goi getOrderDetail neu khach da dang nhap va co ma don.
                - Neu thieu thong tin can thiet de goi tool, hay hoi lai ngan gon dung phan con thieu, vi du thieu ngay, thieu rap hoac thieu ten phim.
                - Trang thai khach hang hien tai: %s. CustomerId duoc dua vao tool tu request context noi bo. Khong hoi, khong nhan, khong lap lai customerId trong cau tra loi. Neu trang thai la ANONYMOUS va nguoi dung hoi diem, hang thanh vien hoac don hang, hay yeu cau dang nhap.
                - Don hang va thong tin nguoi dung chi duoc tra cuu cho chinh khach hang dang dang nhap. Khong chap nhan customerId/order cua nguoi khac tu loi nhan.
                - Ngay hien tai cua he thong la %s. Khi nguoi dung noi "hom nay", "ngay mai", "toi nay", hay chuyen thanh ngay ISO yyyy-MM-dd khi goi tool.

                Toi uu toc do:
                - Khong goi qua nhieu tool neu mot tool da du tra loi.
                - Voi cau hoi "hom nay co phim gi", chi goi getNowShowingMovies.
                - Voi cau hoi tim phim theo ten/the loai/do tuoi/quoc gia/nam/format, goi searchMovies.
                - Voi cau hoi chi tiet ve mot phim, goi getMovieDetail. Neu nguoi dung chua noi ro phim nao, hoi lai ten phim.
                - Voi cau hoi phim con chieu ngay nao hoac co ngay nao de xem, goi getAvailableShowDates.
                - Voi cau hoi goi y/recommend phim nen xem, goi recommendMovies; neu nguoi dung noi ngay/rap/gio thi truyen vao tool de uu tien phim co suat phu hop.
                - Voi cau hoi khuyen mai/ma giam gia/voucher/coupon hien tai, goi getActivePromotions.
                - Voi cau hoi danh sach/lich su don hang gan day, goi getRecentOrders. Voi cau hoi trang thai mot don hang, goi getOrderStatus. Voi cau hoi can day du thong tin ben trong mot don hang, goi getOrderDetail. Neu nguoi dung hoi chi tiet don gan nhat nhung chua dua ma don, goi getRecentOrders truoc roi dung orderId gan nhat de goi getOrderDetail.
                - Voi cau hoi "toi nay rap X co suat phim Y khong", goi searchShowtimes.
                - Voi cau hoi theo khoang ngay, theo tuan, theo thang nhu "thang 5 co suat chieu gi", goi searchShowtimesByDateRange. Neu nguoi dung chi noi thang, dung nam hien tai %s va ngay dau/cuoi thang.
                - Chi goi getAvailableSeats sau khi da co showScheduleId hoac khi nguoi dung hoi cu the ve ghe cua mot suat.
                - Voi recent orders, mac dinh limit = 5.
                - Voi cau hoi gia ve/bang gia chung, goi getTicketPrices. Neu nguoi dung dua ngay/gio suat chieu cu the va noi ten loai ghe nhu VIP/ghe thuong/ghe doi, goi determineTicketPrices de ticket-service tu xac dinh dayType. Neu da biet seatTypeId/projectionType/showTime, co the goi determineTicketPrice.
                - Khong tu doan HOLIDAY. HOLIDAY chi dung khi ticket-service xac dinh ngay do co trong bang Holiday dang active. Quy tac dayType: thu 2-6 la WEEKDAY; thu 7/chu nhat truoc 17:00 la WEEKEND_BEFORE_17; thu 7/chu nhat tu 17:00 tro di la WEEKEND_AFTER_17.

                CONTEXT:
                %s
                """
                .formatted(customerState, LocalDate.now(), LocalDate.now().getYear(), policyContext);
    }

    private String buildPolicyContext(List<Document> documents) {
        return IntStream.range(0, documents.size())
                .mapToObj(index -> {
                    Document document = documents.get(index);
                    Map<String, Object> metadata = document.getMetadata();
                    return """
                            [Nguon %d: %s | Chu de: %s]
                            %s
                            """.formatted(
                            index + 1,
                            metadata.getOrDefault("source", "unknown"),
                            metadata.getOrDefault("topic", "general"),
                            document.getText());
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

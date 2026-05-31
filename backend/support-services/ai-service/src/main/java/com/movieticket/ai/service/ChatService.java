package com.movieticket.ai.service;

import com.movieticket.ai.dto.response.*;
import com.movieticket.ai.enums.ChatRole;
import com.movieticket.ai.repository.ChatMessageRepository;
import com.movieticket.ai.tool.AiCustomerContext;
import com.movieticket.ai.tool.AiChatActionContext;
import com.movieticket.ai.tool.AlphaCinemaTool;
import com.movieticket.ai.tool.AlphaCustomerTool;
import com.movieticket.ai.tool.AlphaMovieTool;
import com.movieticket.ai.tool.AlphaProductTool;
import com.movieticket.ai.tool.AlphaTicketTool;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.document.Document;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDate;
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

    private final ChatMessageRepository chatMessageRepository;
    private final ChatClient chatClient;
    private final ChatMemory chatMemory;
    private final KnowledgeService knowledgeService;
    private final ChatMemoryService chatMemoryService;
    private final AlphaMovieTool alphaMovieTool;
    private final AlphaProductTool alphaProductTool;
    private final AlphaCinemaTool alphaCinemaTool;
    private final AlphaCustomerTool alphaCustomerTool;
    private final AlphaTicketTool alphaTicketTool;

    public Flux<ServerSentEvent<ChatStreamEvent>> streamCustomerQuestion(ChatRequest request) {
        return Flux.defer(() -> {
            ChatPromptContext context = prepareChatPromptContext(request);
            StringBuilder answerBuilder = new StringBuilder();

            Flux<ServerSentEvent<ChatStreamEvent>> metadata = Flux.just(
                    toServerSentEvent("meta", ChatStreamEvent.meta(context.conversationId(), context.citations()))
            );

            Flux<ServerSentEvent<ChatStreamEvent>> answerStream = createChatRequest(context, request)
                    .stream()
                    .content()
                    .filter(Objects::nonNull)
                    .doOnSubscribe(subscription -> {
                        AiCustomerContext.setCustomerId(request.getCustomerId());
                        AiChatActionContext.initialize();
                    })
                    .doOnNext(answerBuilder::append)
                    .map(delta -> toServerSentEvent("delta", ChatStreamEvent.delta(delta)))
                    .concatWith(Mono.fromSupplier(() -> {
                        String answer = answerBuilder.toString();
                        chatMemoryService.ensureExchangeRecorded(context.conversationId(), request.getQuestion(), answer);
                        int nextMessageCount = chatMemoryService.countMessages(context.conversationId());
                        return toServerSentEvent(
                                "done",
                                ChatStreamEvent.done(
                                        shouldSuggestNewConversation(nextMessageCount),
                                        nextMessageCount,
                                        AiChatActionContext.getActions()
                                )
                        );
                    }));

            return Flux.concat(metadata, answerStream)
                    .onErrorResume(error -> Flux.just(toServerSentEvent(
                            "error",
                            ChatStreamEvent.error("Minh dang khong ket noi duoc he thong. Ban thu lai sau it phut nhe.")
                    )))
                    .doFinally(signalType -> {
                        AiCustomerContext.clear();
                        AiChatActionContext.clear();
                    });
        });
    }

    private ChatPromptContext prepareChatPromptContext(ChatRequest request) {
        String conversationId = chatMemoryService.resolveConversationId(request.getConversationId());
        if (hasConversationId(request) && chatMemoryService.archiveConversationIfNecessary(
                conversationId,
                request.getCustomerId(),
                request.getCustomerName(),
                LONG_CONVERSATION_WARNING_MESSAGES
        )) {
            conversationId = chatMemoryService.resolveConversationId(null);
        }

        List<ChatHistoryMessage> conversationMessages = resolveConversationMessages(conversationId);
        String searchQuery = buildSearchQuery(request.getQuestion(), conversationMessages);
        List<Document> policyDocuments = knowledgeService.searchPolicyDocuments(searchQuery, MAX_POLICY_CONTEXTS);

        return new ChatPromptContext(
                conversationId,
                buildSystemPrompt(policyDocuments, request),
                buildCitations(policyDocuments)
        );
    }

    private ChatClient.ChatClientRequestSpec createChatRequest(ChatPromptContext context, ChatRequest request) {
        return chatClient.prompt()
                .system(context.systemPrompt())
                .advisors(advisorSpec -> advisorSpec
                        .advisors(MessageChatMemoryAdvisor.builder(chatMemory).build())
                        .param(ChatMemory.CONVERSATION_ID, context.conversationId())
                )
                .tools(alphaMovieTool, alphaCinemaTool, alphaCustomerTool, alphaTicketTool, alphaProductTool)
                .user(request.getQuestion());
    }

    private ServerSentEvent<ChatStreamEvent> toServerSentEvent(String event, ChatStreamEvent data) {
        return ServerSentEvent.builder(data)
                .event(event)
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
                ? "Không có policy context phù hợp từ Vector DB cho câu hỏi hiện tại."
                : buildPolicyContext(policyDocuments);

        String customerState = request.getCustomerId() == null || request.getCustomerId().isBlank()
                ? "ANONYMOUS"
                : "AUTHENTICATED";

        return """
            Bạn là AI chatbot hỗ trợ khách hàng của hệ thống Alpha Cinema.

            Bạn có hai nguồn thông tin:
            1. Vector DB/RAG: dùng cho chính sách, quy định, FAQ, hướng dẫn và các thông tin ít thay đổi.
            2. Tools realtime: dùng cho dữ liệu hiện tại từ hệ thống như phim đang chiếu, suất chiếu, ghế trống, rạp/chi nhánh, giá vé, điểm thành viên, hạng thành viên, đơn hàng và trạng thái thanh toán.

            Quy tắc bắt buộc:
            - Nếu người dùng hỏi dữ liệu hiện tại, phải gọi tool phù hợp.
            - Không tự bịa phim, suất chiếu, giờ chiếu, ghế trống, giá vé, điểm thành viên hoặc đơn hàng.
            - Nếu tool trả về rỗng, hãy nói rõ là hiện chưa tìm thấy dữ liệu phù hợp.
            - Nếu service lỗi hoặc timeout, hãy xin lỗi ngắn gọn và nói hệ thống đang chưa lấy được dữ liệu realtime.
            - Với câu hỏi chính sách, quy định, FAQ, hãy ưu tiên dữ liệu từ Vector DB/RAG trong CONTEXT.
            - Với câu hỏi tiếp nối như "suất đó", "rạp đó", "phim đó", hãy dựa vào chat memory để hiểu ngữ cảnh trước đó.
            - Khi trả lời suất chiếu, ưu tiên trình bày: tên phim, rạp, định dạng, loại dịch thuật, phòng nếu có, giờ chiếu, số ghế còn trống, giá thấp nhất nếu có.
            - Khi trả lời thông tin phim, nếu người dùng hỏi mô tả/nội dung/diễn viên/đạo diễn/thời lượng/trailer/thể loại/phân loại tuổi, phải gọi getMovieDetail nếu chưa có đủ thông tin chi tiết trong lịch sử.
            - Khi trả lời về ghế trống, chỉ dùng dữ liệu tool trả về, không đoán.
            - Khi trả lời về giá vé hoặc khuyến mãi, phải gọi tool phù hợp và chỉ dùng dữ liệu tool trả về.
            - Không tiết lộ dữ liệu cá nhân của khách hàng khác.
            - Khi khách hỏi chi tiết một đơn hàng cụ thể như phim nào, suất chiếu nào, ghế nào, combo/sản phẩm nào, QR, tổng tiền, giảm giá điểm hoặc mã khuyến mãi của đơn đó, phải gọi getOrderDetail nếu khách đã đăng nhập và có mã đơn.
            - Nếu thiếu thông tin cần thiết để gọi tool, hãy hỏi lại ngắn gọn đúng phần còn thiếu, ví dụ thiếu ngày, thiếu rạp hoặc thiếu tên phim.
            - Trạng thái khách hàng hiện tại: %s. CustomerId được đưa vào tool từ request context nội bộ. Không hỏi, không nhận, không lặp lại customerId trong câu trả lời. Nếu trạng thái là ANONYMOUS và người dùng hỏi điểm, hạng thành viên hoặc đơn hàng, hãy yêu cầu đăng nhập.
            - Đơn hàng và thông tin người dùng chỉ được tra cứu cho chính khách hàng đang đăng nhập. Không chấp nhận customerId/order của người khác từ lời nhắn.
            - Ngày hiện tại của hệ thống là %s. Khi người dùng nói "hôm nay", "ngày mai", "tối nay", hãy chuyển thành ngày ISO yyyy-MM-dd khi gọi tool.

            Tối ưu tốc độ:
            - Không gọi quá nhiều tool nếu một tool đã đủ để trả lời.
            - Với câu hỏi "hôm nay có phim gì", chỉ gọi getNowShowingMovies.
            - Với câu hỏi tìm phim theo tên/thể loại/độ tuổi/quốc gia/năm/format, gọi searchMovies.
            - Với câu hỏi chi tiết về một phim, gọi getMovieDetail. Nếu người dùng chưa nói rõ phim nào, hỏi lại tên phim.
            - Với câu hỏi phim còn chiếu ngày nào hoặc có ngày nào để xem, gọi getAvailableShowDates.
            - Với câu hỏi gợi ý/recommend phim nên xem, gọi recommendMovies; nếu người dùng nói ngày/rạp/giờ thì truyền vào tool để ưu tiên phim có suất phù hợp.
            - Với câu hỏi khuyến mãi/mã giảm giá/voucher/coupon hiện tại, gọi getActivePromotions.
            - Với câu hỏi danh sách/lịch sử đơn hàng gần đây, gọi getRecentOrders. Với câu hỏi trạng thái một đơn hàng, gọi getOrderStatus. Với câu hỏi cần đầy đủ thông tin bên trong một đơn hàng, gọi getOrderDetail. Nếu người dùng hỏi chi tiết đơn gần nhất nhưng chưa đưa mã đơn, gọi getRecentOrders trước rồi dùng orderId gần nhất để gọi getOrderDetail.
            - Với câu hỏi "tối nay rạp X có suất phim Y không", gọi searchShowtimes.
            - Với câu hỏi theo khoảng ngày, theo tuần, theo tháng như "tháng 5 có suất chiếu gì", gọi searchShowtimesByDateRange. Nếu người dùng chỉ nói tháng, dùng năm hiện tại %s và ngày đầu/cuối tháng.
            - Chỉ gọi getAvailableSeats sau khi đã có showScheduleId hoặc khi người dùng hỏi cụ thể về ghế của một suất.
            - Với recent orders, mặc định limit = 5.
            - Với câu hỏi giá vé/bảng giá chung, gọi getTicketPrices. Nếu người dùng hỏi một suất chiếu/ngày giờ cụ thể có những giá nào cho những loại ghế nào, gọi getShowtimeTicketPrices với showTime và projectionType của suất đó. Nếu người dùng đưa ngày/giờ suất chiếu cụ thể và nói tên loại ghế như VIP/ghế thường/ghế đôi, gọi determineTicketPrices để ticket-service tự xác định dayType. Nếu đã biết seatTypeId/projectionType/showTime, có thể gọi determineTicketPrice.
            - Không tự đoán HOLIDAY. HOLIDAY chỉ dùng khi ticket-service xác định ngày đó có trong bảng Holiday đang active. Quy tắc dayType: thứ 2-6 là WEEKDAY; thứ 7/chủ nhật trước 17:00 là WEEKEND_BEFORE_17; thứ 7/chủ nhật từ 17:00 trở đi là WEEKEND_AFTER_17.

            - Với câu hỏi gợi ý/recommend phim nên xem, gọi recommendMovies. Truyền genres là danh sách thể loại; dùng genreMatchMode = ANY khi khách nói "hoặc", dùng ALL khi khách nói "và" hoặc "pha".
            - Nếu câu hỏi recommendation có rạp hoặc khoảng giờ nhưng chưa có ngày, hỏi lại ngày trước khi gọi recommendMovies.
            - Nếu recommendMovies trả needsClarification = true, hỏi lại ngắn gọn đúng thông tin còn thiếu. Nếu upcomingFallback = true, nói rõ đây là phim sắp chiếu. Nếu genreMatchRelaxed = true, nói rõ kết quả chỉ khớp một phần sở thích.
            - Không tự sinh URL. CTA xem lịch chiếu và chọn ghế do giao diện tạo từ action của tool.
            - Voi cau hoi ve san pham, bap nuoc hoac combo dang ban, goi getProducts va chi dung du lieu tool tra ve.
            - Voi cau hoi chi tiet mot phim, goi getMovieDetail. Giao dien se tu them nut xem lich chieu va chon ghe neu co suat phu hop; khong tu tao URL trong cau tra loi.
            - Khi tool tra ve phim hoac suat chieu, giao dien se tu them nut xem lich chieu hoac chon ghe tu du lieu tool; khong tu tao URL trong cau tra loi.

            CONTEXT:
            %s
            """.formatted(customerState, LocalDate.now(), LocalDate.now().getYear(), policyContext);
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

    public List<PopularQuestionResponse> getPopularQuestions() {
        return chatMessageRepository.findPopularQuestions(ChatRole.USER, PageRequest.of(0, 3));
    }

    private record ChatPromptContext(
            String conversationId,
            String systemPrompt,
            List<CitationResponse> citations
    ) {
    }
}

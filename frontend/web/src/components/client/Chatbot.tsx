import { useEffect, useRef, useState } from "react";
import { Bot, Loader2, MessageCircle, Send, Trash2, X } from "lucide-react";
import { useSelector } from "react-redux";
import {
  aiChatService,
  type AiCitation,
} from "../../services/ai-chat.service";
import { selectAuth } from "../../store/slices/authSlice";

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
  citations?: AiCitation[];
  isTyping?: boolean;
};

const fallbackStarterQuestions = [
  "Đặt vé như thế nào?",
  "Thanh toán online có những phương thức nào?",
  "Vé QR dùng như thế nào?",
];

const initialMessages: ChatMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    content:
      "Chào bạn, mình có thể hỗ trợ các câu hỏi về chính sách đặt vé, thanh toán, hoàn vé, QR, khuyến mãi và điểm thành viên của Alpha Cinema.",
  },
];

const CHAT_CONVERSATION_STORAGE_KEY = "alpha-ai-conversation-id";

export default function Chatbot() {
  const { user } = useSelector(selectAuth);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [conversationId, setConversationId] = useState<string | null>(() =>
    localStorage.getItem(CHAT_CONVERSATION_STORAGE_KEY),
  );
  const [question, setQuestion] = useState("");
  const [starterQuestions, setStarterQuestions] = useState<string[]>(
    fallbackStarterQuestions,
  );
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [shouldSuggestNewConversation, setShouldSuggestNewConversation] =
    useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const typingIntervalRef = useRef<number | null>(null);
  const isConversationLocked = shouldSuggestNewConversation;

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isOpen, messages]);

  useEffect(() => {
    let isMounted = true;

    const loadStarterQuestions = async () => {
      try {
        const popularQuestions = await aiChatService.getStarterQuestions();
        const nextStarterQuestions = popularQuestions
          .map((popularQuestion) => popularQuestion.question?.trim())
          .filter((popularQuestion): popularQuestion is string => Boolean(popularQuestion))
          .slice(0, 3);

        if (isMounted && nextStarterQuestions.length > 0) {
          setStarterQuestions(nextStarterQuestions);
        }
      } catch {
        if (isMounted) {
          setStarterQuestions(fallbackStarterQuestions);
        }
      }
    };

    void loadStarterQuestions();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) {
        window.clearInterval(typingIntervalRef.current);
      }
    };
  }, []);

  const askQuestion = async (nextQuestion: string) => {
    const normalizedQuestion = nextQuestion.trim();
    if (!normalizedQuestion || isSending || isTyping || isConversationLocked) {
      return;
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: normalizedQuestion,
    };

    setMessages((currentMessages) => [...currentMessages, userMessage]);
    setQuestion("");
    setIsSending(true);

    try {
      const customerId = resolveCustomerId();
      const response = await aiChatService.askQuestion(
        normalizedQuestion,
        conversationId,
        customerId,
        resolveCustomerName(customerId),
      );
      const assistantMessageId = crypto.randomUUID();

      setActiveConversationId(response.conversationId);
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: assistantMessageId,
          role: "assistant",
          content: "",
          citations: response.citations,
          isTyping: true,
        },
      ]);
      setIsSending(false);
      await typeAssistantAnswer(assistantMessageId, response.answer);
      setShouldSuggestNewConversation(response.shouldStartNewConversation);
      if (response.shouldStartNewConversation) {
        setQuestion("");
      }
    } catch {
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "Mình đang không kết nối được hệ thống. Bạn thử lại sau ít phút nhé.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const clearConversation = async () => {
    if (isSending || isTyping) {
      return;
    }

    const activeConversationId = conversationId;
    const hasMessagesToArchive = messages.some((message) => message.id !== "welcome");

    if (!activeConversationId) {
      resetConversationUi();
      return;
    }

    try {
      const customerId = resolveCustomerId();
      const clearResponse = await aiChatService.clearConversation(
        activeConversationId,
        customerId,
        resolveCustomerName(customerId),
      );

      if (hasMessagesToArchive && clearResponse.archivedMessageCount === 0) {
        setMessages((currentMessages) => [
          ...currentMessages,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content:
              "Mình chưa tìm thấy nội dung cuộc trò chuyện trong bộ nhớ tạm của server nên chưa lưu xuống database. Bạn kiểm tra lại ai-service có vừa restart không nhé.",
          },
        ]);
        return;
      }

      resetConversationUi();
    } catch {
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "Mình đã mở cuộc trò chuyện mới trên giao diện, nhưng chưa lưu được cuộc trò chuyện cũ. Bạn thử lại sau nhé.",
        },
      ]);
    }
  };

  const resetConversationUi = () => {
    setMessages(initialMessages);
    setConversationId(null);
    setShouldSuggestNewConversation(false);
    setQuestion("");
    localStorage.removeItem(CHAT_CONVERSATION_STORAGE_KEY);
  };

  const typeAssistantAnswer = (messageId: string, answer: string) => {
    setIsTyping(true);

    return new Promise<void>((resolve) => {
      let currentIndex = 0;

      typingIntervalRef.current = window.setInterval(() => {
        currentIndex += 1;
        const nextContent = answer.slice(0, currentIndex);

        setMessages((currentMessages) =>
          currentMessages.map((message) =>
            message.id === messageId
              ? {
                  ...message,
                  content: nextContent,
                  isTyping: currentIndex < answer.length,
                }
              : message,
          ),
        );

        if (currentIndex >= answer.length) {
          if (typingIntervalRef.current) {
            window.clearInterval(typingIntervalRef.current);
            typingIntervalRef.current = null;
          }

          setIsTyping(false);
          resolve();
        }
      }, 14);
    });
  };

  const setActiveConversationId = (nextConversationId: string) => {
    if (!nextConversationId) {
      return;
    }

    setConversationId(nextConversationId);
    localStorage.setItem(CHAT_CONVERSATION_STORAGE_KEY, nextConversationId);
  };

  const resolveCustomerId = () => {
    const candidate =
      user?.id ?? undefined;

    if (candidate) {
      return String(candidate);
    }

    return undefined;
  };

  const resolveCustomerName = (customerId?: string) => {
    if (!customerId) {
      return "Khách vãng lai";
    }

    const candidate =
      user?.fullName ?? undefined;

    if (candidate) {
      return String(candidate);
    }

    return "Khách hàng";
  };

  const renderMessageContent = (
    content: string,
    isAssistant: boolean,
    showCaret?: boolean,
  ) => {
    const lines = content.split("\n").filter((line) => line.trim().length > 0);

    if (lines.length === 0) {
      return (
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 animate-pulse rounded-full bg-slate-400" />
          <span className="h-2 w-2 animate-pulse rounded-full bg-slate-400 [animation-delay:120ms]" />
          <span className="h-2 w-2 animate-pulse rounded-full bg-slate-400 [animation-delay:240ms]" />
        </span>
      );
    }

    return (
      <div className="space-y-2">
        {lines.map((line, index) => {
          const trimmedLine = line.trim();
          const bulletMatch = trimmedLine.match(/^[-*•]\s+(.+)/);
          const numberMatch = trimmedLine.match(/^(\d+)[.)]\s+(.+)/);
          const key = `${trimmedLine}-${index}`;

          if (bulletMatch) {
            return (
              <div key={key} className="flex gap-2">
                <span
                  className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${
                    isAssistant ? "bg-alpha-orange" : "bg-white"
                  }`}
                />
                <span>{bulletMatch[1]}</span>
              </div>
            );
          }

          if (numberMatch) {
            return (
              <div key={key} className="flex gap-2">
                <span
                  className={`flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                    isAssistant
                      ? "bg-alpha-blue text-white"
                      : "bg-white text-alpha-blue"
                  }`}
                >
                  {numberMatch[1]}
                </span>
                <span>{numberMatch[2]}</span>
              </div>
            );
          }

          return (
            <p key={key}>
              {trimmedLine}
              {showCaret && index === lines.length - 1 && (
                <span className="ml-0.5 inline-block h-4 w-1 translate-y-0.5 animate-pulse rounded-full bg-alpha-orange" />
              )}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fixed bottom-5 right-5 z-100 flex flex-col items-end">
      {isOpen && (
        <section className="mb-4 flex h-[min(640px,calc(100vh-120px))] w-[calc(100vw-40px)] max-w-[390px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <header className="flex items-center justify-between border-b border-slate-100 bg-slate-950 px-4 py-3 text-white">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-alpha-orange">
                <Bot size={21} />
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-sm font-bold">Alpha AI</h2>
                <p className="truncate text-xs text-slate-300">
                  Hệ thống hỗ trợ khách hàng
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => void clearConversation()}
                disabled={isSending || isTyping}
                className="rounded-full p-2 text-slate-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                aria-label="Xóa và lưu cuộc trò chuyện"
                title="Xóa và lưu cuộc trò chuyện"
              >
                <Trash2 size={17} />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 text-slate-300 transition hover:bg-white/10 hover:text-white cursor-pointer"
                aria-label="Đóng chatbot"
              >
                <X size={18} />
              </button>
            </div>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 px-4 py-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                    message.role === "user"
                      ? "rounded-br-md bg-alpha-blue text-white"
                      : "rounded-bl-md border border-slate-100 bg-white text-slate-800"
                  }`}
                >
                  {renderMessageContent(
                    message.content,
                    message.role === "assistant",
                    message.isTyping,
                  )}
                </div>
              </div>
            ))}

            {isSending && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-slate-100 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
                  <Loader2 size={16} className="animate-spin" />
                  Đang tra cứu thông tin
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-slate-100 bg-white p-3">
            {shouldSuggestNewConversation && (
              <div className="mb-3 rounded-xl border border-orange-200 bg-orange-50 p-3 text-sm text-slate-700">
                <p className="font-semibold text-slate-900">
                  Cuộc trò chuyện này đã khá dài.
                </p>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  Bạn nên tạo cuộc trò chuyện mới để Alpha AI trả lời tập trung
                  và chính xác hơn.
                </p>
                <button
                  type="button"
                  onClick={() => void clearConversation()}
                  disabled={isSending || isTyping}
                  className="mt-3 rounded-lg bg-alpha-orange px-3 py-2 text-xs font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-300 cursor-pointer"
                >
                  Tạo cuộc trò chuyện mới
                </button>
              </div>
            )}

            <div className="mb-3 flex gap-2 overflow-x-auto">
              {starterQuestions.map((starterQuestion) => (
                <button
                  key={starterQuestion}
                  type="button"
                  onClick={() => askQuestion(starterQuestion)}
                  disabled={isSending || isTyping || isConversationLocked}
                  className="shrink-0 rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-alpha-orange hover:text-alpha-orange disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {starterQuestion}
                </button>
              ))}
            </div>

            <form
              className="flex items-end gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                void askQuestion(question);
              }}
            >
              <textarea
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                onKeyDown={(event) => {
                  if (isConversationLocked) {
                    event.preventDefault();
                    return;
                  }

                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void askQuestion(question);
                  }
                }}
                placeholder="Nhập câu hỏi cho Alpha AI..."
                disabled={isConversationLocked}
                className="max-h-28 min-h-11 flex-1 resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-alpha-blue focus:ring-2 focus:ring-alpha-blue/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
              />
              <button
                type="submit"
                disabled={!question.trim() || isSending || isTyping || isConversationLocked}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-alpha-orange text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                aria-label="Gửi câu hỏi"
              >
                {isSending ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </form>
          </div>
        </section>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-alpha-orange text-white shadow-2xl shadow-orange-500/30 transition hover:-translate-y-0.5 hover:bg-orange-600 cursor-pointer"
        aria-label="Mở chatbot hỗ trợ"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={25} />}
      </button>
    </div>
  );
}

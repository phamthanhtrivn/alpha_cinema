import { useEffect, useMemo, useRef, useState } from "react";
import { Armchair, Bot, CalendarDays, Loader2, MessageCircle, Send, Trash2, X } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  aiChatService,
  type AiChatAction,
  type AiChatStreamDone,
  type AiCitation,
} from "../../services/ai-chat.service";
import { selectAuth } from "../../store/slices/authSlice";
import { toast } from "react-toastify";

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
  citations?: AiCitation[];
  actions?: AiChatAction[];
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
      "Chào bạn, mình có thể hỗ trợ đặt vé, thanh toán, hoàn vé, QR, khuyến mãi, điểm thành viên, giá vé, lịch chiếu, ghế trống, chi nhánh và tra cứu đơn hàng tại Alpha Cinema.",
  },
];

const CHAT_CONVERSATION_STORAGE_KEY = "alpha-ai-conversation-id";
const CHAT_LOCK_STORAGE_KEY = "alpha-ai-should-start-new-conversation";
const STREAM_TYPE_INTERVAL_MS = 10;

const getChatStorageKeys = (scope: string) => ({
  conversationId: `${CHAT_CONVERSATION_STORAGE_KEY}:${scope}`,
  lock: `${CHAT_LOCK_STORAGE_KEY}:${scope}`,
});

const loadStoredConversationId = (storageKey: string) => {
  const scopedConversationId = localStorage.getItem(storageKey);
  if (scopedConversationId) {
    return scopedConversationId;
  }

  const legacyConversationId = localStorage.getItem(
    CHAT_CONVERSATION_STORAGE_KEY,
  );
  if (legacyConversationId) {
    localStorage.setItem(storageKey, legacyConversationId);
    localStorage.removeItem(CHAT_CONVERSATION_STORAGE_KEY);
  }

  return legacyConversationId;
};

export default function Chatbot() {
  const { user, isAuthenticated } = useSelector(selectAuth);
  const navigate = useNavigate();
  const storageScope = user?.id ? `customer:${String(user.id)}` : "guest";
  const storageKeys = useMemo(
    () => getChatStorageKeys(storageScope),
    [storageScope],
  );
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [conversationId, setConversationId] = useState<string | null>(() =>
    loadStoredConversationId(storageKeys.conversationId),
  );
  const [question, setQuestion] = useState("");
  const [starterQuestions, setStarterQuestions] = useState<string[]>(
    fallbackStarterQuestions,
  );
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [shouldSuggestNewConversation, setShouldSuggestNewConversation] =
    useState(() => localStorage.getItem(storageKeys.lock) === "true");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const typingIntervalRef = useRef<number | null>(null);
  const streamAbortControllerRef = useRef<AbortController | null>(null);
  const streamTextBufferRef = useRef("");
  const pendingStreamDoneRef = useRef<AiChatStreamDone | null>(null);
  const isConversationLocked = shouldSuggestNewConversation;
  const isBusy = isSending || isTyping || isStreaming || isClearing;

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isOpen, messages]);

  useEffect(() => {
    let isMounted = true;
    const storedConversationId = loadStoredConversationId(
      storageKeys.conversationId,
    );

    setConversationId(storedConversationId);
    setMessages(initialMessages);
    setShouldSuggestNewConversation(
      localStorage.getItem(storageKeys.lock) === "true",
    );
    setQuestion("");

    if (!storedConversationId) {
      return () => {
        isMounted = false;
      };
    }

    const loadConversationHistory = async () => {
      try {
        const history =
          await aiChatService.getConversationHistory(storedConversationId);
        if (!isMounted) {
          return;
        }

        const restoredMessages: ChatMessage[] = history.map(
          (message, index) => ({
            id: `${storedConversationId}-${index}`,
            role: message.role,
            content: message.content,
          }),
        );

        setMessages(
          restoredMessages.length > 0
            ? [initialMessages[0], ...restoredMessages]
            : initialMessages,
        );
      } catch {
        if (isMounted) {
          setMessages(initialMessages);
        }
      }
    };

    void loadConversationHistory();

    return () => {
      isMounted = false;
    };
  }, [storageKeys.conversationId, storageKeys.lock]);

  useEffect(() => {
    localStorage.setItem(
      storageKeys.lock,
      String(shouldSuggestNewConversation),
    );
  }, [shouldSuggestNewConversation, storageKeys.lock]);

  useEffect(() => {
    let isMounted = true;

    const loadStarterQuestions = async () => {
      try {
        const popularQuestions = await aiChatService.getStarterQuestions();
        const nextStarterQuestions = popularQuestions
          .map((popularQuestion) => popularQuestion.question?.trim())
          .filter((popularQuestion): popularQuestion is string =>
            Boolean(popularQuestion),
          )
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
      clearBufferedTypingInterval();
      streamAbortControllerRef.current?.abort();
    };
  }, []);

  const clearBufferedTypingInterval = () => {
    if (typingIntervalRef.current) {
      window.clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
  };

  const resetStreamBuffer = () => {
    clearBufferedTypingInterval();
    streamTextBufferRef.current = "";
    pendingStreamDoneRef.current = null;
  };

  const completeBufferedStream = (assistantMessageId: string) => {
    const doneEvent = pendingStreamDoneRef.current;

    resetStreamBuffer();
    setMessages((currentMessages) =>
      currentMessages.map((message) =>
        message.id === assistantMessageId
          ? {
              ...message,
              isTyping: false,
              actions: doneEvent?.actions ?? message.actions,
            }
          : message,
      ),
    );

    if (doneEvent) {
      setShouldSuggestNewConversation(doneEvent.shouldStartNewConversation);
      if (doneEvent.shouldStartNewConversation) {
        setQuestion("");
      }
    }

    setIsSending(false);
    setIsStreaming(false);
    setIsTyping(false);
    streamAbortControllerRef.current = null;
  };

  const startBufferedTyping = (assistantMessageId: string) => {
    setIsTyping(true);

    if (typingIntervalRef.current) {
      return;
    }

    typingIntervalRef.current = window.setInterval(() => {
      const nextBuffer = streamTextBufferRef.current;

      if (!nextBuffer) {
        if (pendingStreamDoneRef.current) {
          completeBufferedStream(assistantMessageId);
        }
        return;
      }

      const nextCharacter = nextBuffer.slice(0, 1);
      streamTextBufferRef.current = nextBuffer.slice(1);
      setIsSending(false);
      setMessages((currentMessages) =>
        currentMessages.map((message) =>
          message.id === assistantMessageId
            ? {
                ...message,
                content: `${message.content}${nextCharacter}`,
                isTyping: true,
              }
            : message,
        ),
      );
    }, STREAM_TYPE_INTERVAL_MS);
  };

  const askQuestion = async (nextQuestion: string) => {
    const normalizedQuestion = nextQuestion.trim();
    if (!normalizedQuestion || isBusy || isConversationLocked) {
      return;
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: normalizedQuestion,
    };
    const assistantMessageId = crypto.randomUUID();
    const controller = new AbortController();

    resetStreamBuffer();
    streamAbortControllerRef.current = controller;
    setMessages((currentMessages) => [
      ...currentMessages,
      userMessage,
      {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        citations: [],
        isTyping: true,
      },
    ]);
    setQuestion("");
    setIsSending(true);
    setIsStreaming(true);
    setIsTyping(true);
    setStreamError(null);

    try {
      const customerId = resolveCustomerId();
      await aiChatService.askQuestionStream(
        normalizedQuestion,
        conversationId,
        customerId,
        resolveCustomerName(customerId),
        {
          onMeta: (event) => {
            setActiveConversationId(event.conversationId);
            setMessages((currentMessages) =>
              currentMessages.map((message) =>
                message.id === assistantMessageId
                  ? { ...message, citations: event.citations }
                  : message,
              ),
            );
          },
          onDelta: (delta) => {
            streamTextBufferRef.current += delta;
            startBufferedTyping(assistantMessageId);
          },
          onDone: (event) => {
            pendingStreamDoneRef.current = event;
            startBufferedTyping(assistantMessageId);
          },
          onError: (message) => {
            resetStreamBuffer();
            setStreamError(message);
            setIsSending(false);
            setIsStreaming(false);
            setIsTyping(false);
            streamAbortControllerRef.current = null;
            setMessages((currentMessages) =>
              currentMessages.map((currentMessage) =>
                currentMessage.id === assistantMessageId
                  ? {
                      ...currentMessage,
                      content: message,
                      isTyping: false,
                    }
                  : currentMessage,
              ),
            );
          },
        },
        controller.signal,
      );
    } catch (error) {
      console.log(error);
      toast.error(
        "Đã có lỗi xảy ra khi kết nối đến Alpha AI. Vui lòng thử lại sau.",
      );
      resetStreamBuffer();
      setStreamError(
        "Mình đang không kết nối được Alpha AI. Bạn thử lại sau ít phút nhé.",
      );
      setIsSending(false);
      setIsStreaming(false);
    } finally {
      if (
        !typingIntervalRef.current &&
        !streamTextBufferRef.current &&
        !pendingStreamDoneRef.current
      ) {
        setIsSending(false);
        setIsStreaming(false);
        setIsTyping(false);
        streamAbortControllerRef.current = null;
        setMessages((currentMessages) =>
          currentMessages.map((message) =>
            message.id === assistantMessageId
              ? {
                  ...message,
                  isTyping: false,
                }
              : message,
          ),
        );
      }
    }
  };

  const clearConversation = async () => {
    if (isClearing) {
      return;
    }

    streamAbortControllerRef.current?.abort();
    streamAbortControllerRef.current = null;
    resetStreamBuffer();
    setIsClearing(true);
    setIsSending(false);
    setIsStreaming(false);
    setIsTyping(false);
    setStreamError(null);

    const activeConversationId = conversationId;
    const hasMessagesToArchive = messages.some(
      (message) => message.id !== "welcome",
    );

    if (!activeConversationId) {
      resetConversationUi();
      setIsClearing(false);
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
    } finally {
      setIsClearing(false);
    }
  };

  const resetConversationUi = () => {
    resetStreamBuffer();
    setMessages(initialMessages);
    setConversationId(null);
    setShouldSuggestNewConversation(false);
    setQuestion("");
    setStreamError(null);
    localStorage.removeItem(storageKeys.conversationId);
    localStorage.removeItem(storageKeys.lock);
  };

  const setActiveConversationId = (nextConversationId: string) => {
    if (!nextConversationId) {
      return;
    }

    setConversationId(nextConversationId);
    localStorage.setItem(storageKeys.conversationId, nextConversationId);
  };

  const resolveCustomerId = () => {
    const candidate = user?.id ?? undefined;

    if (candidate) {
      return String(candidate);
    }

    return undefined;
  };

  const resolveCustomerName = (customerId?: string) => {
    if (!customerId) {
      return "Khách vãng lai";
    }

    const candidate = user?.fullName ?? undefined;

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
        <span className="inline-flex items-center gap-2 text-slate-500">
          <span>Alpha AI đang trả lời</span>
          <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400" />
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400 [animation-delay:120ms]" />
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400 [animation-delay:240ms]" />
          </span>
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

  const handleChatAction = (action: AiChatAction) => {
    setIsOpen(false);

    if (action.type === "SELECT_SHOWTIME_SEATS" && !isAuthenticated) {
      const target = new URL(action.url, window.location.origin);
      navigate("/login", {
        state: {
          from: {
            pathname: target.pathname,
            search: target.search,
            hash: target.hash,
          },
        },
      });
      return;
    }

    navigate(action.url);
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
                disabled={isClearing}
                className="rounded-full p-2 text-slate-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                aria-label="Xóa và lưu cuộc trò chuyện"
                title="Xóa và lưu cuộc trò chuyện"
              >
                {isClearing ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <Trash2 size={17} />
                )}
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
                  {message.role === "assistant" &&
                    !message.isTyping &&
                    message.actions &&
                    message.actions.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                        {message.actions.map((action) => (
                          <button
                            key={`${message.id}-${action.url}`}
                            type="button"
                            title={action.description}
                            onClick={() => handleChatAction(action)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-alpha-blue/20 bg-alpha-blue/5 px-2.5 py-2 text-xs font-semibold text-alpha-blue transition hover:border-alpha-blue hover:bg-alpha-blue hover:text-white cursor-pointer"
                          >
                            {action.type === "SELECT_SHOWTIME_SEATS" ? (
                              <Armchair size={14} />
                            ) : (
                              <CalendarDays size={14} />
                            )}
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                </div>
              </div>
            ))}

            {isSending && !isStreaming && (
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
                  disabled={isClearing}
                  className="mt-3 rounded-lg bg-alpha-orange px-3 py-2 text-xs font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-300 cursor-pointer"
                >
                  {isClearing ? "Đang tạo..." : "Tạo cuộc trò chuyện mới"}
                </button>
              </div>
            )}

            {streamError && (
              <div className="mb-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                {streamError}
              </div>
            )}

            <div className="mb-3 flex gap-2 overflow-x-auto">
              {starterQuestions.map((starterQuestion) => (
                <button
                  key={starterQuestion}
                  type="button"
                  onClick={() => askQuestion(starterQuestion)}
                  disabled={isBusy || isConversationLocked}
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
                disabled={isConversationLocked || isBusy}
                className="max-h-28 min-h-11 flex-1 resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-alpha-blue focus:ring-2 focus:ring-alpha-blue/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
              />
              <button
                type="submit"
                disabled={!question.trim() || isBusy || isConversationLocked}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-alpha-orange text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                aria-label="Gửi câu hỏi"
              >
                {isBusy ? (
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

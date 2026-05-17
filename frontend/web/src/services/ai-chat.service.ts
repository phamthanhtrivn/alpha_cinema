import { store } from "@/store";
import { apiClient } from "./api";

export type AiCitation = {
  source: string;
  topic: string;
  chunkIndex: number | null;
  preview: string;
};

export type AiChatResponse = {
  conversationId: string;
  answer: string;
  citations: AiCitation[];
  shouldStartNewConversation: boolean;
  conversationMessageCount: number;
};

export type AiChatHistoryMessage = {
  role: "assistant" | "user";
  content: string;
};

export type PopularAiQuestion = {
  question: string;
  count: number;
};

export type AiChatClearResponse = {
  conversationId: string;
  archivedMessageCount: number;
};

export type AiChatStreamMeta = {
  conversationId: string;
  citations: AiCitation[];
};

export type AiChatStreamDone = {
  shouldStartNewConversation: boolean;
  conversationMessageCount: number;
};

export type AiChatStreamCallbacks = {
  onMeta?: (event: AiChatStreamMeta) => void;
  onDelta?: (delta: string) => void;
  onDone?: (event: AiChatStreamDone) => void;
  onError?: (message: string) => void;
};

type AiChatStreamPayload = Partial<AiChatStreamMeta & AiChatStreamDone> & {
  type?: "meta" | "delta" | "done" | "error";
  delta?: string;
  message?: string;
};

const parseSseBlock = (block: string) => {
  const lines = block.split(/\r?\n/);
  let event = "message";
  const dataLines: string[] = [];

  lines.forEach((line) => {
    if (line.startsWith("event:")) {
      event = line.slice("event:".length).trim();
      return;
    }

    if (line.startsWith("data:")) {
      dataLines.push(line.slice("data:".length).trimStart());
    }
  });

  return {
    event,
    data: dataLines.join("\n"),
  };
};

const dispatchStreamEvent = (
  eventName: string,
  payload: AiChatStreamPayload,
  callbacks: AiChatStreamCallbacks,
) => {
  const eventType = payload.type ?? eventName;

  if (eventType === "meta" && payload.conversationId) {
    callbacks.onMeta?.({
      conversationId: payload.conversationId,
      citations: payload.citations ?? [],
    });
    return;
  }

  if (eventType === "delta") {
    callbacks.onDelta?.(payload.delta ?? "");
    return;
  }

  if (eventType === "done") {
    callbacks.onDone?.({
      shouldStartNewConversation: Boolean(payload.shouldStartNewConversation),
      conversationMessageCount: payload.conversationMessageCount ?? 0,
    });
    return;
  }

  if (eventType === "error") {
    callbacks.onError?.(
      payload.message ??
        "Mình đang không kết nối được hệ thống. Bạn thử lại sau ít phút nhé.",
    );
  }
};

export const aiChatService = {
  askQuestionStream: async (
    question: string,
    conversationId: string | null | undefined,
    customerId: string | undefined,
    customerName: string | undefined,
    callbacks: AiChatStreamCallbacks,
    signal?: AbortSignal,
  ): Promise<void> => {
    const accessToken = store.getState().auth.accessToken;
    const headers: Record<string, string> = {
      Accept: "text/event-stream",
      "Content-Type": "application/json",
    };

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_API_URL}/ai/chat`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          question,
          conversationId,
          customerId,
          customerName,
        }),
        signal,
      },
    );

    if (!response.ok) {
      throw new Error("AI_STREAM_REQUEST_FAILED");
    }

    if (!response.body) {
      throw new Error("AI_STREAM_UNSUPPORTED");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const blocks = buffer.split(/\r?\n\r?\n/);
        buffer = blocks.pop() ?? "";

        blocks.forEach((block) => {
          const normalizedBlock = block.trim();
          if (!normalizedBlock) {
            return;
          }

          const { event, data } = parseSseBlock(normalizedBlock);
          if (!data) {
            return;
          }

          dispatchStreamEvent(event, JSON.parse(data), callbacks);
        });
      }

      buffer += decoder.decode();
      const trailingBlock = buffer.trim();
      if (trailingBlock) {
        const { event, data } = parseSseBlock(trailingBlock);
        if (data) {
          dispatchStreamEvent(event, JSON.parse(data), callbacks);
        }
      }
    } finally {
      reader.releaseLock();
    }
  },
  clearConversation: async (
    conversationId: string,
    customerId?: string,
    customerName?: string,
  ): Promise<AiChatClearResponse> => {
    const response = await apiClient.post("/ai/chat/clear", {
      conversationId,
      customerId,
      customerName,
    });
    return response.data.data;
  },
  getConversationHistory: async (
    conversationId: string,
  ): Promise<AiChatHistoryMessage[]> => {
    const response = await apiClient.get("/ai/chat/history", {
      params: { conversationId },
    });
    return response.data.data;
  },
  getStarterQuestions: async (): Promise<PopularAiQuestion[]> => {
    const response = await apiClient.get("/ai/chat/starter-questions");
    return response.data.data;
  },
  getPopularQuestions: async (limit: number = 3): Promise<PopularAiQuestion[]> => {
    const response = await apiClient.get("/ai/analytics/popular-questions", {
      params: { limit },
    });
    return response.data.data;
  },
};

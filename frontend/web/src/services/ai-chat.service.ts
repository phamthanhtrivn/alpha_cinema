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

export const aiChatService = {
  askQuestion: async (
    question: string,
    conversationId?: string | null,
    customerId?: string,
    customerName?: string,
  ): Promise<AiChatResponse> => {
    const response = await apiClient.post("/ai/chat", {
      question,
      conversationId,
      customerId,
      customerName,
    });
    return response.data.data;
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

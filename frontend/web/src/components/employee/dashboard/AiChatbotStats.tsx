import { Bot, ExternalLink, MessageSquareText, WandSparkles } from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { AiChatbotAnalytics } from "@/types/dashboard";
import { formatDateTime, formatNumber, formatPercent } from "../../../utils/dashboardFormat";

interface AiChatbotStatsProps {
  data?: AiChatbotAnalytics;
  isLoading?: boolean;
  detailPath?: string;
}

export function AiChatbotStats({ data, isLoading, detailPath }: AiChatbotStatsProps) {
  if (isLoading) return <Skeleton className="h-[360px] rounded-lg" />;

  if (!data) {
    return (
      <Card className="border-dashed border-slate-200">
        <CardContent className="p-6 text-sm text-slate-500">
          Chưa có dữ liệu AI chatbot.
        </CardContent>
      </Card>
    );
  }

  const maxQuestionCount = Math.max(
    ...data.popularQuestions.map((question) => question.count),
    1,
  );

  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
              <Bot size={19} className="text-violet-600" />
              AI chatbot
            </CardTitle>
            <CardDescription>
              Lượt chat, câu hỏi phổ biến và hội thoại gần đây
            </CardDescription>
          </div>
          {detailPath && (
            <Button asChild variant="outline" size="sm">
              <Link to={detailPath}>
                <ExternalLink size={14} />
                Chi tiết
              </Link>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-md border border-slate-100 bg-violet-50 p-3">
            <div className="flex items-center gap-2 text-xs font-bold text-violet-700">
              <MessageSquareText size={14} />
              Tổng lượt chat
            </div>
            <div className="mt-1 text-2xl font-black text-slate-900">
              {formatNumber(data.totalChats)}
            </div>
          </div>
          <div className="rounded-md border border-slate-100 bg-emerald-50 p-3">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
              <WandSparkles size={14} />
              Phản hồi thành công
            </div>
            <div className="mt-1 text-2xl font-black text-slate-900">
              {formatPercent(data.successRate)}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-sm font-black text-slate-800">
            Câu hỏi phổ biến
          </div>
          {data.popularQuestions.map((item) => (
            <div key={item.question}>
              <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                <span className="truncate font-semibold text-slate-700">
                  {item.question}
                </span>
                <span className="font-bold text-slate-500">
                  {formatNumber(item.count)}
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-violet-500"
                  style={{ width: `${(item.count / maxQuestionCount) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <div className="text-sm font-black text-slate-800">
            Conversation gần đây
          </div>
          {data.recentConversations.map((conversation) => (
            <div
              key={conversation.id}
              className="flex items-center justify-between gap-3 rounded-md border border-slate-100 bg-slate-50 p-3"
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-bold text-slate-800">
                  {conversation.topic}
                </div>
                <div className="text-xs text-slate-500">
                  {conversation.userName} · {formatDateTime(conversation.createdAt)}
                </div>
              </div>
              <Badge
                variant="outline"
                className={
                  conversation.status === "RESOLVED"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-amber-200 bg-amber-50 text-amber-700"
                }
              >
                {conversation.status === "RESOLVED" ? "Đã xử lý" : "Chuyển hỗ trợ"}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

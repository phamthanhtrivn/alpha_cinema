import {
  Bot,
  ExternalLink,
  MessageCircle,
  MessageSquareText,
  Sparkles,
  Users,
  WandSparkles,
} from "lucide-react";
import type { ReactNode } from "react";
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

const safePercent = (value: number, total: number) =>
  total <= 0 ? 0 : Math.round((value * 1000) / total) / 10;

export function AiChatbotStats({ data, isLoading, detailPath }: AiChatbotStatsProps) {
  if (isLoading) return <Skeleton className="h-[680px] rounded-lg" />;

  if (!data) {
    return (
      <Card className="border-dashed border-slate-200">
        <CardContent className="p-6 text-sm text-slate-500">
          Chưa có dữ liệu AI chatbot. Hãy đảm bảo rằng bạn đã tích hợp chatbot và có đủ dữ liệu để hiển thị thống kê.
        </CardContent>
      </Card>
    );
  }

  const maxQuestionCount = Math.max(
    ...data.popularQuestions.map((question) => question.count),
    1,
  );
  const maxTrendValue = Math.max(
    ...data.questionTrend.map((point) => point.questions),
    1,
  );
  const totalAudience = Math.max(data.guestConversations + data.memberConversations, 1);
  const memberPercent = safePercent(data.memberConversations, totalAudience);
  const guestPercent = safePercent(data.guestConversations, totalAudience);

  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
              <Bot size={19} className="text-violet-600" />
              AI chatbot
            </CardTitle>
            <CardDescription>
              Câu hỏi khách hàng hay hỏi, xu hướng chat và hiệu quả trả lời
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
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <MetricCard
            icon={<MessageCircle size={15} />}
            label="Hội thoại"
            value={formatNumber(data.totalConversations)}
            className="bg-violet-50 text-violet-700"
          />
          <MetricCard
            icon={<MessageSquareText size={15} />}
            label="Câu hỏi"
            value={formatNumber(data.totalUserQuestions)}
            className="bg-sky-50 text-sky-700"
          />
          <MetricCard
            icon={<WandSparkles size={15} />}
            label="Trả lời"
            value={formatNumber(data.totalAssistantAnswers)}
            className="bg-emerald-50 text-emerald-700"
          />
          <MetricCard
            icon={<Sparkles size={15} />}
            label="Tỷ lệ phản hồi thành công"
            value={formatPercent(data.successRate)}
            className="bg-amber-50 text-amber-700"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="text-sm font-black text-slate-800">
                Xu hướng câu hỏi
              </div>
              <div className="text-xs font-semibold text-slate-500">
                TB {formatNumber(data.averageMessagesPerConversation)} tin / hội thoại
              </div>
            </div>
            <div className="flex h-56 items-end gap-2">
              {data.questionTrend.length ? (
                data.questionTrend.map((point) => {
                  const height = Math.max((point.questions / maxTrendValue) * 100, 8);
                  return (
                    <div key={point.label} className="flex h-full flex-1 flex-col justify-end gap-2">
                      <div className="flex min-h-0 flex-1 items-end">
                        <div className="relative h-full w-full overflow-hidden rounded-t-md bg-violet-100">
                          <div
                            className="absolute bottom-0 left-0 right-0 rounded-t-md bg-violet-500"
                            style={{ height: `${height}%` }}
                            title={`${point.label}: ${formatNumber(point.questions)} cau hoi`}
                          />
                        </div>
                      </div>
                      <div className="truncate text-center text-xs font-bold text-slate-500">
                        {point.label}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-slate-500">
                  Chưa có câu hỏi trong khoảng thời gian này.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-slate-100 bg-white p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-black text-slate-800">
              <Users size={16} className="text-sky-600" />
              Khách dùng AI
            </div>
            <div className="space-y-4">
              <AudienceBar
                label="Thành viên"
                value={data.memberConversations}
                percent={memberPercent}
                className="bg-sky-500"
              />
              <AudienceBar
                label="Khach vãng lai"
                value={data.guestConversations}
                percent={guestPercent}
                className="bg-slate-500"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-lg border border-slate-100 bg-white p-4">
            <div className="mb-3 text-sm font-black text-slate-800">
              Câu hỏi được hỏi nhiều nhất
            </div>
            <div className="space-y-3">
              {data.popularQuestions.length ? (
                data.popularQuestions.map((item, index) => (
                  <div key={item.question}>
                    <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                      <span className="min-w-0 truncate font-semibold text-slate-700">
                        {index + 1}. {item.question}
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
                ))
              ) : (
                <EmptyLine text="Chưa có câu hỏi phổ biến." />
              )}
            </div>
          </div>

          <div className="rounded-lg border border-slate-100 bg-white p-4">
            <div className="mb-3 text-sm font-black text-slate-800">
              Câu hỏi gần đây
            </div>
            <div className="space-y-2">
              {data.recentQuestions.length ? (
                data.recentQuestions.map((question) => (
                  <div
                    key={`${question.id}-${question.conversationId}`}
                    className="rounded-md bg-slate-50 p-3"
                  >
                    <div className="line-clamp-2 text-sm font-semibold text-slate-800">
                      {question.question}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {formatDateTime(question.createdAt)}
                    </div>
                  </div>
                ))
              ) : (
                <EmptyLine text="Chưa có câu hỏi gần đây." />
              )}
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-100 bg-white p-4">
          <div className="mb-3 text-sm font-black text-slate-800">
            Hội thoại gần đây
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            {data.recentConversations.length ? (
              data.recentConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className="flex items-center justify-between gap-3 rounded-md border border-slate-100 bg-slate-50 p-3"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-bold text-slate-800">
                      {conversation.customerName || "Guest"}
                    </div>
                    <div className="text-xs text-slate-500">
                      {formatNumber(conversation.messageCount)} tin nhan · {formatDateTime(conversation.archivedAt)}
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      conversation.guest
                        ? "border-slate-200 bg-white text-slate-600"
                        : "border-sky-200 bg-sky-50 text-sky-700"
                    }
                  >
                    {conversation.guest ? "Guest" : "Member"}
                  </Badge>
                </div>
              ))
            ) : (
              <EmptyLine text="Chưa có hội thoại đã lưu." />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MetricCard({
  icon,
  label,
  value,
  className,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  className: string;
}) {
  return (
    <div className="rounded-md border border-slate-100 bg-white p-3">
      <div className={`inline-flex items-center gap-2 rounded-md px-2 py-1 text-xs font-bold ${className}`}>
        {icon}
        {label}
      </div>
      <div className="mt-2 text-xl font-black text-slate-900">{value}</div>
    </div>
  );
}

function AudienceBar({
  label,
  value,
  percent,
  className,
}: {
  label: string;
  value: number;
  percent: number;
  className: string;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-bold text-slate-700">{label}</span>
        <span className="font-bold text-slate-500">
          {formatNumber(value)} · {formatPercent(percent)}
        </span>
      </div>
      <div className="h-2 rounded-full bg-slate-100">
        <div className={`h-2 rounded-full ${className}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function EmptyLine({ text }: { text: string }) {
  return (
    <div className="rounded-md border border-dashed border-slate-200 p-4 text-sm font-semibold text-slate-500">
      {text}
    </div>
  );
}

import React from "react";
import { Bell, Ticket, Star, Info, CheckCircle2, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NotificationItemProps {
  notification: any;
  onRead: (id: string, url?: string) => void;
  onDelete: (id: string) => void;
}

const getNotificationIcon = (type: string) => {
  switch (type?.toUpperCase()) {
    case "BOOKING":
    case "TICKET":
      return <Ticket size={20} className="text-blue-500" />;
    case "REVIEW":
    case "RATING":
      return <Star size={20} className="text-alpha-orange" />;
    case "SUCCESS":
      return <CheckCircle2 size={20} className="text-green-500" />;
    case "WARNING":
    case "ALERT":
      return <AlertCircle size={20} className="text-red-500" />;
    default:
      return <Bell size={20} className="text-slate-400" />;
  }
};

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onRead, onDelete }) => {
  return (
    <div
      className={`relative p-4 border rounded-md transition-all cursor-pointer flex items-start gap-4 ${!notification.read
        ? "bg-blue-50/50 border-alpha-blue/20 shadow-sm"
        : "bg-white border-slate-100 hover:border-slate-200"
        }`}
      onClick={() => onRead(notification.id, notification.url)}
    >
      <Button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(notification.id);
        }}
        className="absolute top-0 right-0 text-slate-300 hover:text-red-500  transition-all opacity-0 md:opacity-100"
        title="Xóa thông báo"
      >
        <X size={14} />
      </Button>

      <div className={`mt-1 p-2 rounded-full shrink-0 flex items-center justify-center h-fit ${!notification.read ? "bg-white" : "bg-slate-50"
        }`}>
        {getNotificationIcon(notification.type)}
      </div>

      <div className="flex-1 min-w-0 pr-6">
        <div className="flex items-center gap-2 mb-1">
          <h4 className={`text-[15px] leading-snug ${!notification.read ? "font-bold text-slate-800" : "font-semibold text-slate-700"}`}>
            {notification.title}
          </h4>
          {!notification.read && (
            <span className="w-2 h-2 rounded-full bg-alpha-blue shrink-0" />
          )}
        </div>
        <p className={`text-sm leading-relaxed ${!notification.read ? "text-slate-700" : "text-slate-500"}`}>
          {notification.content}
        </p>
        <div className="text-[11px] text-slate-400 mt-3 font-medium uppercase tracking-wide">
          {new Date(notification.createdAt).toLocaleString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;

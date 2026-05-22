import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { Client } from "@stomp/stompjs";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { selectAuth } from "@/store/slices/authSlice";

const getWebSocketUrl = (): string => {
  const apiUrl = import.meta.env.VITE_BACKEND_API_URL;
  if (!apiUrl) return "ws://localhost:8080/ws";

  // Thay thế http/https bằng ws/wss
  let wsUrl = apiUrl.replace(/^http/, "ws");

  // Loại bỏ hậu tố /api nếu có để kết nối trực tiếp đến endpoint /ws
  if (wsUrl.endsWith("/api")) {
    wsUrl = wsUrl.substring(0, wsUrl.length - 4);
  }

  return `${wsUrl}/ws`;
};

const NotificationWebSocketListener: React.FC = () => {
  const { user, isAuthenticated } = useSelector(selectAuth);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Chỉ kích hoạt kết nối nếu người dùng đã đăng nhập và là CUSTOMER
    const userId = user?.id || user?.userId;
    if (!isAuthenticated || !userId) {
      return;
    }

    const brokerURL = getWebSocketUrl();
    console.log(`[WebSocket] Đang khởi tạo kết nối tới: ${brokerURL} cho user: ${userId}`);

    const stompClient = new Client({
      brokerURL,
      connectHeaders: {
        userId: String(userId),
      },
      reconnectDelay: 5000, // Tự động kết nối lại sau 5 giây nếu đứt mạng
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => {
        // Chỉ log ở môi trường development nếu cần thiết
        if (import.meta.env.DEV) {
          console.log("[WebSocket Debug]", str);
        }
      },
    });

    stompClient.onConnect = (frame) => {
      console.log("[WebSocket] Kết nối thành công!", frame);

      // Đăng ký nhận thông báo theo đích danh User ID để tránh lỗi định tuyến ngầm của Spring Boot
      stompClient.subscribe(`/topic/notifications/${userId}`, (message) => {
        try {
          const notification = JSON.parse(message.body);
          console.log("[WebSocket] Nhận thông báo mới:", notification);

          toast.info(
            <div className="flex flex-col gap-1 pr-2">
              <span className="font-bold text-sm text-slate-800">
                {notification.title || "Thông báo mới"}
              </span>
              <span className="text-xs text-slate-600 leading-relaxed">
                {notification.content}
              </span>
            </div>,
          );

          queryClient.invalidateQueries({ queryKey: ["movie-reviews"] });

        } catch (error) {
          console.error("[WebSocket] Lỗi xử lý tin nhắn thông báo:", error);
        }
      });
    };

    stompClient.onStompError = (frame) => {
      console.error("[WebSocket Stomp Error]", frame.headers["message"]);
      console.error("[WebSocket Stomp Details]", frame.body);
    };

    stompClient.onDisconnect = () => {
      console.log("[WebSocket] Đã ngắt kết nối.");
    };

    // Kích hoạt phiên kết nối
    stompClient.activate();

    // Hủy kết nối khi component bị unmount hoặc user thay đổi (đăng xuất)
    return () => {
      console.log("[WebSocket] Đang dọn dẹp kết nối...");
      stompClient.deactivate();
    };
  }, [user, isAuthenticated, queryClient]);

  // Component chạy ngầm không cần hiển thị giao diện trực tiếp
  return null;
};

export default NotificationWebSocketListener;

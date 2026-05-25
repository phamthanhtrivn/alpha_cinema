import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Client } from "@stomp/stompjs";
import type { StompSubscription } from "@stomp/stompjs";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { selectAuth } from "@/store/slices/authSlice";
import type { AppDispatch } from "@/store";
import {
  applySeatLockEvent,
  selectWatchedSeatLockShowScheduleIds,
} from "@/store/slices/seatLockSlice";
import type { SeatLockEvent } from "@/services/seat-lock-websocket.service";

const getWebSocketUrl = (): string => {
  const apiUrl = import.meta.env.VITE_BACKEND_API_URL;
  if (!apiUrl) return "ws://localhost:8080/ws";

  let wsUrl = apiUrl.replace(/^http/, "ws");
  if (wsUrl.endsWith("/api")) {
    wsUrl = wsUrl.substring(0, wsUrl.length - 4);
  }

  return `${wsUrl}/ws`;
};

const NotificationWebSocketListener: React.FC = () => {
  const { user, isAuthenticated } = useSelector(selectAuth);
  const watchedShowScheduleIds = useSelector(selectWatchedSeatLockShowScheduleIds);
  const dispatch = useDispatch<AppDispatch>();
  const queryClient = useQueryClient();
  const stompClientRef = useRef<Client | null>(null);
  const seatLockSubscriptionsRef = useRef<Record<string, StompSubscription>>({});
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  useEffect(() => {
    const userId = user?.id || user?.userId;
    if (!isAuthenticated || !userId) {
      return;
    }

    const stompClient = new Client({
      brokerURL: getWebSocketUrl(),
      connectHeaders: {
        userId: String(userId),
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (message) => {
        if (import.meta.env.DEV) {
          console.log("[WebSocket Debug]", message);
        }
      },
    });

    stompClient.onConnect = () => {
      setIsSocketConnected(true);

      stompClient.subscribe(`/topic/notifications/${userId}`, (message) => {
        try {
          const notification = JSON.parse(message.body);

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

          queryClient.invalidateQueries({ queryKey: ["notifications"] });
          queryClient.invalidateQueries({ queryKey: ["movie-reviews"] });
        } catch (error) {
          console.error("[WebSocket] Không thể xử lý thông báo:", error);
        }
      });
    };

    stompClient.onStompError = (frame) => {
      console.error("[WebSocket Stomp Error]", frame.headers["message"]);
      console.error("[WebSocket Stomp Details]", frame.body);
    };

    const markDisconnected = () => {
      setIsSocketConnected(false);
      seatLockSubscriptionsRef.current = {};
    };

    stompClient.onDisconnect = markDisconnected;
    stompClient.onWebSocketClose = markDisconnected;

    stompClientRef.current = stompClient;
    stompClient.activate();

    return () => {
      Object.values(seatLockSubscriptionsRef.current).forEach((subscription) => {
        subscription.unsubscribe();
      });
      seatLockSubscriptionsRef.current = {};
      stompClientRef.current = null;
      setIsSocketConnected(false);
      void stompClient.deactivate();
    };
  }, [user?.id, user?.userId, isAuthenticated, queryClient]);

  useEffect(() => {
    const stompClient = stompClientRef.current;
    if (!isSocketConnected || !stompClient?.connected) {
      return;
    }

    const watchedIds = new Set(watchedShowScheduleIds.filter(Boolean));
    const currentSubscriptions = seatLockSubscriptionsRef.current;

    Object.entries(currentSubscriptions).forEach(
      ([showScheduleId, subscription]) => {
        if (!watchedIds.has(showScheduleId)) {
          subscription.unsubscribe();
          delete currentSubscriptions[showScheduleId];
        }
      },
    );

    watchedIds.forEach((showScheduleId) => {
      if (currentSubscriptions[showScheduleId]) {
        return;
      }

      currentSubscriptions[showScheduleId] = stompClient.subscribe(
        `/topic/seat-locks/${showScheduleId}`,
        (message) => {
          try {
            const event = JSON.parse(message.body) as SeatLockEvent;
            if (event.showScheduleId !== showScheduleId) {
              return;
            }
            dispatch(applySeatLockEvent(event));
          } catch (error) {
            console.error("[SeatLock WebSocket] Không thể xử lý sự kiện ghế:", error);
          }
        },
      );

      if (import.meta.env.DEV) {
        console.log(
          `[SeatLock WebSocket] Subscribed /topic/seat-locks/${showScheduleId}`,
        );
      }
    });
  }, [dispatch, isSocketConnected, watchedShowScheduleIds]);

  return null;
};

export default NotificationWebSocketListener;

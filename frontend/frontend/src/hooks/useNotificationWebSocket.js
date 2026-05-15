import { useState, useEffect, useRef, useCallback } from "react";
import toast from "react-hot-toast";

/**
 * useNotificationWebSocket
 * Connects to the user-specific notification WebSocket.
 * Safe against React 19 StrictMode double-invoke via a destroyed flag.
 */
export default function useNotificationWebSocket() {
  const [unreadCount,        setUnreadCount]        = useState(0);
  const [latestNotification, setLatestNotification] = useState(null);
  const [isConnected,        setIsConnected]        = useState(false);

  const wsRef          = useRef(null);
  const reconnectTimer = useRef(null);
  const destroyedRef   = useRef(false);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const token = localStorage.getItem("jwt");
      if (!token) return;
      const res = await fetch("http://localhost:8000/api/notifications/unread-count/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.unread_count ?? 0);
      }
    } catch (_) {}
  }, []);

  const cleanup = useCallback(() => {
    destroyedRef.current = true;
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
    if (wsRef.current) {
      wsRef.current.onopen    = null;
      wsRef.current.onmessage = null;
      wsRef.current.onclose   = null;
      wsRef.current.onerror   = null;
      wsRef.current.close(1000);
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const connect = useCallback(() => {
    if (destroyedRef.current) return;

    const token = localStorage.getItem("jwt");
    if (!token) return; // not logged in — skip silently

    // Close stale socket
    if (wsRef.current) {
      wsRef.current.onopen    = null;
      wsRef.current.onmessage = null;
      wsRef.current.onclose   = null;
      wsRef.current.onerror   = null;
      wsRef.current.close(1000);
      wsRef.current = null;
    }

    let ws;
    try {
      ws = new WebSocket(`ws://localhost:8000/ws/notifications/?token=${token}`);
    } catch (e) {
      console.error("[NotifWS] Failed to create socket:", e);
      return;
    }

    ws.onopen = () => {
      if (destroyedRef.current) { ws.close(1000); return; }
      setIsConnected(true);
      fetchUnreadCount();
      console.log("[NotifWS] Connected");
    };

    ws.onmessage = (event) => {
      if (destroyedRef.current) return;
      try {
        const data = JSON.parse(event.data);
        if (data.type === "notification") {
          setLatestNotification(data.data);
          setUnreadCount(prev => prev + 1);
          toast(data.data.title || "New notification", {
            icon: "🔔",
            style: { borderRadius: "12px", background: "#1a1a1a", color: "#fff" },
          });
        }
      } catch (_) {}
    };

    ws.onclose = (e) => {
      if (destroyedRef.current) return;
      setIsConnected(false);
      // 4001 = auth rejected by server — don't retry
      if (e.code !== 1000 && e.code !== 1001 && e.code !== 4001) {
        reconnectTimer.current = setTimeout(() => {
          if (!destroyedRef.current) connect();
        }, 5000);
      }
    };

    ws.onerror = () => {
      // onclose fires right after — suppress noise
    };

    wsRef.current = ws;
  }, [fetchUnreadCount]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    destroyedRef.current = false;
    connect();
    return cleanup;
  }, [connect, cleanup]);

  return { unreadCount, setUnreadCount, latestNotification, isConnected };
}

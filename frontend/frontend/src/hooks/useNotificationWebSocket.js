import { useState, useEffect, useRef, useCallback } from 'react';
import { apiUrl, wsUrl } from '../config';
import { showAppToast } from '../utils/notify';

export default function useNotificationWebSocket() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [latestNotification, setLatestNotification] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const wsRef = useRef(null);
  const reconnectTimer = useRef(null);
  const destroyedRef = useRef(false);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const token = localStorage.getItem('jwt');
      if (!token) {
        setUnreadCount(0);
        return;
      }
      const res = await fetch(apiUrl('/notifications/unread-count/'), {
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
      wsRef.current.onopen = null;
      wsRef.current.onmessage = null;
      wsRef.current.onclose = null;
      wsRef.current.onerror = null;
      wsRef.current.close(1000);
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const connect = useCallback(() => {
    if (destroyedRef.current) return;

    const token = localStorage.getItem('jwt');
    if (!token) return;

    if (wsRef.current) {
      wsRef.current.onopen = null;
      wsRef.current.onmessage = null;
      wsRef.current.onclose = null;
      wsRef.current.onerror = null;
      wsRef.current.close(1000);
      wsRef.current = null;
    }

    let ws;
    try {
      ws = new WebSocket(`${wsUrl('/ws/notifications/')}?token=${token}`);
    } catch {
      return;
    }

    ws.onopen = () => {
      if (destroyedRef.current) {
        ws.close(1000);
        return;
      }
      setIsConnected(true);
      refreshUnreadCount();
    };

    ws.onmessage = (event) => {
      if (destroyedRef.current) return;
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'notification' && data.data) {
          const n = data.data;
          setLatestNotification(n);
          setUnreadCount((prev) => prev + 1);

          const variant =
            n.metadata?.action === 'reversal'
              ? 'reversal'
              : n.metadata?.variant || 'default';

          showAppToast(n.title || n.message || 'New notification', variant);
        }
      } catch (_) {}
    };

    ws.onclose = (e) => {
      if (destroyedRef.current) return;
      setIsConnected(false);
      if (e.code !== 1000 && e.code !== 1001 && e.code !== 4001) {
        reconnectTimer.current = setTimeout(() => {
          if (!destroyedRef.current) connect();
        }, 5000);
      }
    };

    ws.onerror = () => {};

    wsRef.current = ws;
  }, [refreshUnreadCount]);

  useEffect(() => {
    destroyedRef.current = false;
    connect();

    const onStorage = (e) => {
      if (e.key === 'jwt') {
        cleanup();
        destroyedRef.current = false;
        connect();
      }
    };
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener('storage', onStorage);
      cleanup();
    };
  }, [connect, cleanup]);

  return {
    unreadCount,
    setUnreadCount,
    latestNotification,
    isConnected,
    refreshUnreadCount,
  };
}

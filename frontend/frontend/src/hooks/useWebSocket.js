import { useState, useEffect, useRef, useCallback } from "react";
import { wsUrl } from "../config";

/**
 * Custom hook for managing WebSocket connections to chat groups.
 * Handles connection, reconnection, message sending, and cleanup.
 */
export default function useWebSocket(groupId) {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [events, setEvents] = useState([]);
  const wsRef = useRef(null);
  const reconnectTimeout = useRef(null);

  const connect = useCallback(() => {
    if (!groupId) return;

    const token = localStorage.getItem("jwt");
    if (!token) return;

    // Close existing connection
    if (wsRef.current) {
      wsRef.current.close();
    }

    const socket = new WebSocket(`${wsUrl(`/ws/chat/${groupId}/`)}?token=${token}`);

    socket.onopen = () => {
      setIsConnected(true);
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "message") {
        setMessages((prev) => [
          ...prev,
          {
            id: data.id,
            content: data.message,
            sender_name: data.sender,
            sender: data.sender_id,
            timestamp: data.timestamp,
          },
        ]);
      } else if (data.type === "user_event") {
        setEvents((prev) => [...prev, data]);
      }
    };

    socket.onclose = (e) => {
      setIsConnected(false);
      if (e.code !== 1000) {
        reconnectTimeout.current = setTimeout(() => connect(), 3000);
      }
    };

    socket.onerror = () => {};

    wsRef.current = socket;
  }, [groupId]);

  // Connect when groupId changes
  useEffect(() => {
    setMessages([]);
    setEvents([]);
    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close(1000); // Normal closure
      }
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
    };
  }, [groupId, connect]);

  // Send a message
  const sendMessage = useCallback((message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ message }));
    }
  }, []);

  return { messages, setMessages, sendMessage, isConnected, events };
}

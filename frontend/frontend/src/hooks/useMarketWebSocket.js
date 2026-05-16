import { useState, useEffect, useRef, useCallback } from "react";
import { wsUrl } from "../config";

/**
 * useMarketWebSocket
 * Connects to the market WebSocket (global or per-symbol).
 * Safe against React 19 StrictMode double-invoke via a destroyed flag.
 */
export default function useMarketWebSocket(symbol = null) {
  const [marketData, setMarketData]   = useState([]);
  const [stockData,  setStockData]    = useState(null);
  const [indexData,  setIndexData]    = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const wsRef              = useRef(null);
  const reconnectTimer     = useRef(null);
  const destroyedRef       = useRef(false); // set true when effect cleanup runs

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

    // Close any stale socket first
    if (wsRef.current) {
      wsRef.current.onopen    = null;
      wsRef.current.onmessage = null;
      wsRef.current.onclose   = null;
      wsRef.current.onerror   = null;
      wsRef.current.close(1000);
      wsRef.current = null;
    }

    const path = symbol ? `/ws/market/${symbol}/` : '/ws/market/';

    let ws;
    try {
      ws = new WebSocket(wsUrl(path));
    } catch {
      return;
    }

    ws.onopen = () => {
      if (destroyedRef.current) { ws.close(1000); return; }
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      if (destroyedRef.current) return;
      try {
        const data = JSON.parse(event.data);
        switch (data.type) {
          case 'market_update':
            setMarketData(data.data);
            break;
          case 'stock_update':
            setMarketData(prev =>
              prev.map(s => s.symbol === data.data.symbol ? { ...s, ...data.data } : s)
            );
            break;
          case 'price_update':
            setStockData(data.data);
            break;
          case 'index_update':
            setIndexData(data.data);
            break;
          default:
            break;
        }
      } catch (_) {}
    };

    ws.onclose = (e) => {
      if (destroyedRef.current) return;
      setIsConnected(false);
      // Auto-reconnect only on unexpected close
      if (e.code !== 1000 && e.code !== 1001) {
        reconnectTimer.current = setTimeout(() => {
          if (!destroyedRef.current) connect();
        }, 5000);
      }
    };

    ws.onerror = () => {
      // onclose fires right after, so just suppress the console noise
    };

    wsRef.current = ws;
  }, [symbol]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    destroyedRef.current = false;
    connect();
    return cleanup;
  }, [connect, cleanup]);

  return { marketData, stockData, indexData, isConnected };
}

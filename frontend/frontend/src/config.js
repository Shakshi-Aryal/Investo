/**
 * Central API / WebSocket configuration for deployment.
 * Override via Vite env: VITE_API_URL, VITE_WS_URL
 */
const API_ORIGIN = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
const WS_ORIGIN = import.meta.env.VITE_WS_URL || API_ORIGIN.replace(/^http/, 'ws');

export const API_BASE = `${API_ORIGIN.replace(/\/$/, '')}/api`;
export const WS_BASE = WS_ORIGIN.replace(/\/$/, '');

export function apiUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${p}`;
}

export function wsUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${WS_BASE}${p}`;
}

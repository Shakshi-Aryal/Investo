import React from 'react';
import toast from 'react-hot-toast';
import { apiUrl } from '../config';

const TOAST_BASE = {
  borderRadius: '14px',
  padding: '14px 18px',
  fontSize: '14px',
  fontWeight: 600,
  boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
  maxWidth: '360px',
};

export function showAppToast(message, variant = 'default') {
  const styles = {
    default: { ...TOAST_BASE, background: 'var(--card-bg)', color: 'var(--text-main)', border: '1px solid var(--card-border)' },
    success: { ...TOAST_BASE, background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' },
    reversal: { ...TOAST_BASE, background: 'rgba(59, 130, 246, 0.12)', color: 'var(--accent)', border: '1px solid var(--accent-glow)' },
    warning: { ...TOAST_BASE, background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' },
    error: { ...TOAST_BASE, background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' },
  };

  return toast(message, { style: styles[variant] || styles.default, duration: 4000 });
}

export function showReversalToast(message, onUndo) {
  return toast(
    (t) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ flex: 1 }}>{message}</span>
        {onUndo && (
          <button
            type="button"
            onClick={() => {
              toast.dismiss(t.id);
              onUndo();
            }}
            style={{
              background: 'var(--accent)',
              color: '#fff',
              border: 'none',
              padding: '6px 12px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Undo
          </button>
        )}
      </div>
    ),
    { duration: 5000, style: TOAST_BASE }
  );
}

/**
 * Persist notification server-side + return unread count (no page reload).
 */
export async function recordNotificationEvent({
  title,
  message,
  notificationType = 'system',
  metadata = {},
  sendEmail = false,
}) {
  const token = localStorage.getItem('jwt');
  if (!token) return null;

  try {
    const res = await fetch(apiUrl('/notifications/events/'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title,
        message,
        notification_type: notificationType,
        metadata,
        send_email: sendEmail,
      }),
    });
    if (res.ok) return await res.json();
  } catch (_) {}
  return null;
}

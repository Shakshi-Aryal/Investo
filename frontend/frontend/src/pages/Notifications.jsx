import React, { useState, useEffect, useCallback } from 'react';
import MainLayout from '../layouts/MainLayout';
import { useNotifications } from '../context/NotificationContext';
import toast from 'react-hot-toast';
import { apiUrl } from '../config';

const TYPE_ICONS = {
  alert: '🔔',
  reminder: '⏰',
  system: '⚙️',
  market: '📈',
  watchlist: '⭐',
};

const TYPE_COLORS = {
  alert: '#FF9800',
  reminder: '#2196F3',
  system: '#9C27B0',
  market: '#26a69a',
  watchlist: '#FFD700',
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | unread | alert | reminder | market
  const { setUnreadCount } = useNotifications();

  const getToken = () => localStorage.getItem('jwt');

  const fetchNotifications = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) { setLoading(false); return; }

      const params = new URLSearchParams({ limit: '50' });
      if (filter === 'unread') params.set('unread_only', 'true');

      const res = await fetch(`${apiUrl('/notifications/')}?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        let results = data.results || [];
        // Client-side filter by type
        if (filter !== 'all' && filter !== 'unread') {
          results = results.filter(n => n.notification_type === filter);
        }
        setNotifications(results);
        setUnreadCount(data.unread_count || 0);
      }
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [filter, setUnreadCount]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAllRead = async () => {
    try {
      const token = getToken();
      const res = await fetch(apiUrl('/notifications/mark-read/'), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ all: true }),
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
        toast.success('All notifications marked as read');
      }
    } catch (err) {
      toast.error('Failed to mark as read');
    }
  };

  const markOneRead = async (id) => {
    try {
      const token = getToken();
      const res = await fetch(apiUrl('/notifications/mark-read/'), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notification_id: id }),
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch {
      /* silent */
    }
  };

  const deleteNotif = async (id) => {
    try {
      const token = getToken();
      const res = await fetch(apiUrl(`/notifications/${id}/`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setNotifications(prev => prev.filter(n => n.id !== id));
        toast.success('Notification deleted');
      }
    } catch (err) {
      toast.error('Failed to delete notification');
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'unread', label: `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}` },
    { key: 'alert', label: '🔔 Alerts' },
    { key: 'reminder', label: '⏰ Reminders' },
    { key: 'market', label: '📈 Market' },
  ];

  return (
    <MainLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: '28px', fontWeight: '800' }}>
              Alert & Notification Center
            </h1>
            <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '14px' }}>
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              style={{
                padding: '10px 20px', borderRadius: '10px', fontWeight: '700', fontSize: '14px',
                cursor: 'pointer', border: '1px solid var(--card-border)',
                background: 'var(--input-bg)', color: 'inherit',
              }}
            >
              ✓ Mark all as read
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                padding: '8px 16px', borderRadius: '20px', fontWeight: '600', fontSize: '13px',
                cursor: 'pointer', border: '1px solid var(--card-border)',
                background: filter === f.key ? 'var(--accent)' : 'var(--input-bg)',
                color: filter === f.key ? 'white' : 'inherit',
                transition: 'all 0.2s',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Notification List */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '80px 20px',
            background: 'var(--card-bg)', border: '1px solid var(--card-border)',
            borderRadius: '16px',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔕</div>
            <h3 style={{ margin: '0 0 8px', color: 'var(--text-muted)' }}>No notifications</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>
              You're all caught up! Notifications will appear here.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {notifications.map(notif => (
              <div
                key={notif.id}
                onClick={() => !notif.is_read && markOneRead(notif.id)}
                style={{
                  background: 'var(--card-bg)',
                  border: `1px solid ${notif.is_read ? 'var(--card-border)' : 'var(--accent)'}`,
                  borderLeft: `4px solid ${TYPE_COLORS[notif.notification_type] || 'var(--accent)'}`,
                  borderRadius: '12px',
                  padding: '16px 20px',
                  cursor: notif.is_read ? 'default' : 'pointer',
                  opacity: notif.is_read ? 0.75 : 1,
                  transition: 'all 0.2s',
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
                    {/* Icon */}
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
                      background: `${TYPE_COLORS[notif.notification_type]}20`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '18px',
                    }}>
                      {TYPE_ICONS[notif.notification_type] || '📢'}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{
                          fontSize: '10px', fontWeight: '700', textTransform: 'uppercase',
                          color: TYPE_COLORS[notif.notification_type] || 'var(--accent)',
                          letterSpacing: '0.5px',
                        }}>
                          {notif.notification_type}
                        </span>
                        {!notif.is_read && (
                          <span style={{
                            width: '6px', height: '6px', borderRadius: '50%',
                            background: 'var(--accent)', display: 'inline-block',
                          }} />
                        )}
                      </div>
                      <h3 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: '700' }}>
                        {notif.title}
                      </h3>
                      <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                        {notif.message}
                      </p>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', display: 'block' }}>
                        {new Date(notif.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteNotif(notif.id); }}
                    style={{
                      background: 'none', border: 'none', color: 'var(--text-muted)',
                      cursor: 'pointer', fontSize: '18px', padding: '4px', lineHeight: 1,
                      flexShrink: 0,
                    }}
                    title="Delete notification"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}

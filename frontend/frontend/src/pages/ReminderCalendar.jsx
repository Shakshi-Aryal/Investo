import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import MainLayout from '../layouts/MainLayout';
import toast from 'react-hot-toast';
import { useNotifications } from '../context/NotificationContext';
import { apiUrl } from '../config';
import { showAppToast } from '../utils/notify';
import {
  Calendar as CalendarIcon,
  Clock,
  AlertCircle,
  CheckCircle,
  Trash2,
  Plus,
  X,
  Receipt,
  Repeat,
  BellRing,
} from 'lucide-react';

const API_BASE = apiUrl('/reminders');

const pageStyles = `
  .reminders-hub {
    display: flex;
    flex-direction: column;
    gap: 28px;
  }

  .reminders-bento {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 20px;
    align-items: start;
  }

  .bento-span-8 { grid-column: span 8; }
  .bento-span-4 { grid-column: span 4; }
  .bento-span-12 { grid-column: span 12; }
  .bento-span-4-eq { grid-column: span 4; }

  @media (max-width: 1024px) {
    .bento-span-8, .bento-span-4, .bento-span-4-eq { grid-column: span 12; }
  }

  .reminder-glass {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 24px;
    padding: 24px;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.04);
  }

  .stat-tile {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-height: 100px;
  }

  .stat-tile .stat-value {
    font-family: var(--font-heading);
    font-size: 32px;
    font-weight: 800;
    letter-spacing: -0.02em;
    line-height: 1;
  }

  .category-panel {
    display: flex;
    flex-direction: column;
    gap: 14px;
    min-height: 280px;
  }

  .category-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .category-header h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    font-family: var(--font-heading);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .reminder-card {
    background: var(--input-bg);
    border: 1px solid var(--card-border);
    border-radius: 16px;
    padding: 16px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
    transition: transform 0.2s, border-color 0.2s, opacity 0.2s;
  }

  .reminder-card:hover {
    border-color: var(--accent);
    transform: translateY(-2px);
  }

  .reminder-card.done {
    opacity: 0.55;
  }

  .reminder-card.done .reminder-title {
    text-decoration: line-through;
    color: var(--text-muted);
  }

  .reminder-title {
    margin: 0 0 6px;
    font-size: 15px;
    font-weight: 700;
    color: var(--text-main);
  }

  .reminder-meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: var(--text-muted);
  }

  .inline-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 8px;
    border-radius: 999px;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .inline-badge.urgent {
    background: rgba(239, 68, 68, 0.12);
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.25);
  }

  .inline-badge.paid {
    background: rgba(34, 197, 94, 0.12);
    color: #22c55e;
    border: 1px solid rgba(34, 197, 94, 0.25);
  }

  .inline-badge.pending {
    background: rgba(245, 158, 11, 0.12);
    color: #f59e0b;
    border: 1px solid rgba(245, 158, 11, 0.25);
  }

  .inline-badge.subscription {
    background: rgba(139, 92, 246, 0.12);
    color: #8b5cf6;
    border: 1px solid rgba(139, 92, 246, 0.25);
  }

  .card-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex-shrink: 0;
  }

  .action-chip {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    border: 1px solid var(--card-border);
    background: var(--card-bg);
    color: var(--text-muted);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }

  .action-chip:hover {
    color: var(--accent);
    border-color: var(--accent);
    background: var(--accent-dim);
  }

  .action-chip.danger:hover {
    color: var(--danger-color);
    border-color: var(--danger-color);
    background: var(--danger-bg);
  }

  .action-chip.success {
    background: var(--accent);
    border-color: var(--accent);
    color: white;
  }

  .empty-category {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 24px;
    border: 1px dashed var(--card-border);
    border-radius: 16px;
    color: var(--text-muted);
    font-size: 13px;
  }

  .react-calendar {
    width: 100% !important;
    background: transparent !important;
    border: none !important;
    font-family: inherit !important;
    color: inherit !important;
  }

  .react-calendar__navigation button {
    color: inherit !important;
    font-family: var(--font-heading) !important;
    font-weight: 700;
    border-radius: 12px;
  }

  .react-calendar__tile {
    border-radius: 10px !important;
  }

  .react-calendar__tile--active {
    background: var(--accent) !important;
    color: white !important;
  }
`;

const CATEGORIES = {
  bills: {
    key: 'bills',
    label: 'Scheduled Bills',
    icon: Receipt,
    color: 'var(--color-orange)',
    match: (r) => /bill|rent|utility|electric|water|tax/i.test(r.title),
  },
  subscriptions: {
    key: 'subscriptions',
    label: 'Subscriptions',
    icon: Repeat,
    color: 'var(--color-purple)',
    match: (r) => /netflix|spotify|subscription|premium|membership|monthly/i.test(r.title),
  },
  alerts: {
    key: 'alerts',
    label: 'Custom Alerts',
    icon: BellRing,
    color: 'var(--accent)',
    match: () => true,
  },
};

function inferCategory(reminder) {
  if (CATEGORIES.bills.match(reminder)) return 'bills';
  if (CATEGORIES.subscriptions.match(reminder)) return 'subscriptions';
  return 'alerts';
}

function getBadge(reminder) {
  if (reminder.is_completed) {
    return { label: 'Paid', className: 'paid', icon: CheckCircle };
  }
  const daysUntil = Math.ceil(
    (new Date(reminder.date) - new Date(new Date().toISOString().split('T')[0])) / 86400000
  );
  if (daysUntil <= 2) {
    return { label: 'Urgent', className: 'urgent', icon: AlertCircle };
  }
  if (inferCategory(reminder) === 'subscriptions') {
    return { label: 'Renewal', className: 'subscription', icon: Repeat };
  }
  return { label: 'Pending', className: 'pending', icon: Clock };
}

export default function ReminderCalendar() {
  const { notifyAction } = useNotifications();
  const [date, setDate] = useState(new Date());
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newReminder, setNewReminder] = useState({
    title: '',
    description: '',
    time: '09:00',
    category: 'bills',
  });

  const selectedDateStr = date.toISOString().split('T')[0];
  const getToken = () => localStorage.getItem('jwt');

  const fetchReminders = useCallback(async () => {
    try {
      const res = await fetch(API_BASE + '/', {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        const data = await res.json();
        setReminders(Array.isArray(data) ? data : []);
      }
    } catch {
      /* fetch failed silently */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  const dayReminders = useMemo(
    () => reminders.filter((r) => r.date === selectedDateStr),
    [reminders, selectedDateStr]
  );

  const grouped = useMemo(() => {
    const groups = { bills: [], subscriptions: [], alerts: [] };
    dayReminders.forEach((r) => {
      const cat = inferCategory(r);
      if (cat === 'bills') groups.bills.push(r);
      else if (cat === 'subscriptions') groups.subscriptions.push(r);
      else groups.alerts.push(r);
    });
    Object.keys(groups).forEach((k) => {
      groups[k].sort((a, b) => (a.time || '').localeCompare(b.time || ''));
    });
    return groups;
  }, [dayReminders]);

  const stats = useMemo(() => {
    const pending = dayReminders.filter((r) => !r.is_completed).length;
    const urgent = dayReminders.filter((r) => !r.is_completed && getBadge(r).className === 'urgent').length;
    const paid = dayReminders.filter((r) => r.is_completed).length;
    return { pending, urgent, paid, total: dayReminders.length };
  }, [dayReminders]);

  const handleAdd = async () => {
    if (!newReminder.title.trim()) {
      toast.error('Title is required');
      return;
    }

    const payload = {
      title: newReminder.title,
      description: newReminder.description,
      date: selectedDateStr,
      time: newReminder.time,
      is_completed: false,
    };

    try {
      const res = await fetch(API_BASE + '/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success('Reminder scheduled');
        fetchReminders();
        setShowAddModal(false);
        setNewReminder({ title: '', description: '', time: '09:00', category: 'bills' });
      } else {
        toast.error('Failed to add reminder');
      }
    } catch {
      toast.error('Network error');
    }
  };

  const toggleStatus = async (reminder) => {
    const prev = reminder.is_completed;
    const next = !prev;

    setReminders((list) =>
      list.map((r) => (r.id === reminder.id ? { ...r, is_completed: next } : r))
    );

    notifyAction({
      title: next ? 'Reminder completed' : 'Reminder reverted',
      message: next ? `"${reminder.title}" marked as paid.` : `"${reminder.title}" marked as pending.`,
      variant: 'reversal',
      metadata: { action: 'reversal', reminderId: reminder.id },
      onUndo: () => {
        setReminders((list) =>
          list.map((r) => (r.id === reminder.id ? { ...r, is_completed: prev } : r))
        );
      },
    });

    try {
      const res = await fetch(`${API_BASE}/${reminder.id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ ...reminder, is_completed: next }),
      });
      if (!res.ok) throw new Error('Failed');
    } catch {
      setReminders((list) =>
        list.map((r) => (r.id === reminder.id ? { ...r, is_completed: prev } : r))
      );
      toast.error('Update failed');
    }
  };

  const undoDelete = async (reminder) => {
    try {
      const res = await fetch(API_BASE + '/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          title: reminder.title,
          description: reminder.description,
          date: reminder.date,
          time: reminder.time,
          is_completed: reminder.is_completed,
        }),
      });
      if (res.ok) {
        showAppToast('Reminder restored', 'success');
        fetchReminders();
      }
    } catch {
      toast.error('Failed to restore');
    }
  };

  const handleDelete = async (reminder) => {
    setReminders((list) => list.filter((r) => r.id !== reminder.id));

    notifyAction({
      title: 'Transaction reversed',
      message: 'Reminder dismissed.',
      variant: 'reversal',
      metadata: { action: 'reversal', reminderId: reminder.id },
      onUndo: () => undoDelete(reminder),
    });

    try {
      const res = await fetch(`${API_BASE}/${reminder.id}/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error('Delete failed');
    } catch {
      fetchReminders();
    }
  };

  const isToday = selectedDateStr === new Date().toISOString().split('T')[0];
  const dateLabel = isToday
    ? 'Today'
    : date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

  const renderReminderCard = (r) => {
    const badge = getBadge(r);
    const BadgeIcon = badge.icon;

    return (
      <div key={r.id} className={`reminder-card ${r.is_completed ? 'done' : ''}`}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 className="reminder-title">{r.title}</h4>
          {r.description && (
            <p style={{ margin: '0 0 8px', fontSize: 12, color: 'var(--text-muted)' }}>{r.description}</p>
          )}
          <div className="reminder-meta">
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={12} /> {r.time?.slice?.(0, 5) || r.time}
            </span>
            <span className={`inline-badge ${badge.className}`}>
              <BadgeIcon size={10} /> {badge.label}
            </span>
          </div>
        </div>
        <div className="card-actions">
          <button
            type="button"
            className={`action-chip ${r.is_completed ? '' : 'success'}`}
            onClick={() => toggleStatus(r)}
            title={r.is_completed ? 'Mark pending' : 'Mark paid'}
          >
            <CheckCircle size={16} />
          </button>
          <button
            type="button"
            className="action-chip danger"
            onClick={() => handleDelete(r)}
            title="Dismiss"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    );
  };

  const renderCategoryPanel = (catKey) => {
    const cat = CATEGORIES[catKey];
    const Icon = cat.icon;
    const items = grouped[catKey];

    return (
      <div key={catKey} className="reminder-glass bento-span-4-eq category-panel">
        <div className="category-header">
          <h3>
            <Icon size={18} color={cat.color} />
            {cat.label}
          </h3>
          <span className="micro-badge micro-badge-accent">{items.length}</span>
        </div>
        {loading ? (
          <div className="empty-category">Loading…</div>
        ) : items.length === 0 ? (
          <div className="empty-category">Nothing scheduled in this category.</div>
        ) : (
          items.map(renderReminderCard)
        )}
      </div>
    );
  };

  return (
    <MainLayout>
      <style>{pageStyles}</style>
      <div className="reminders-hub animate-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ margin: '0 0 8px', fontSize: 36, fontFamily: 'var(--font-heading)', fontWeight: 800 }}>
              Financial <span style={{ color: 'var(--accent)' }}>Reminders Calendar</span>
            </h1>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 16 }}>
              Bills, subscriptions, and custom alerts — undo-safe, notification-ready.
            </p>
          </div>
          <button
            type="button"
            className="inv-btn-primary"
            onClick={() => setShowAddModal(true)}
            style={{ width: 'auto', padding: '12px 24px', borderRadius: 14 }}
          >
            <Plus size={18} /> New Reminder
          </button>
        </div>

        <div className="reminders-bento">
          <div className="reminder-glass bento-span-4 stat-tile">
            <span className="metric-label">Scheduled</span>
            <span className="stat-value" style={{ color: 'var(--accent)' }}>{stats.total}</span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>for {dateLabel}</span>
          </div>
          <div className="reminder-glass bento-span-4 stat-tile">
            <span className="metric-label">Urgent</span>
            <span className="stat-value" style={{ color: 'var(--danger-color)' }}>{stats.urgent}</span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>due within 48h</span>
          </div>
          <div className="reminder-glass bento-span-4 stat-tile">
            <span className="metric-label">Completed</span>
            <span className="stat-value" style={{ color: 'var(--success-color)' }}>{stats.paid}</span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{stats.pending} still pending</span>
          </div>

          {renderCategoryPanel('bills')}
          {renderCategoryPanel('subscriptions')}
          {renderCategoryPanel('alerts')}

          <div className="reminder-glass bento-span-8">
            <h2 style={{ margin: '0 0 20px', fontSize: 18, fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <CalendarIcon size={20} color="var(--accent)" />
              All tasks — {dateLabel}
            </h2>
            {!loading && dayReminders.length === 0 ? (
              <div className="empty-category" style={{ minHeight: 120 }}>
                <CheckCircle size={40} style={{ opacity: 0.25, marginBottom: 12 }} />
                <strong style={{ color: 'var(--text-main)' }}>All clear</strong>
                <p style={{ margin: '8px 0 0' }}>No reminders on this date.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {dayReminders
                  .sort((a, b) => (a.time || '').localeCompare(b.time || ''))
                  .map(renderReminderCard)}
              </div>
            )}
          </div>

          <div className="reminder-glass bento-span-4">
            <h3 style={{ margin: '0 0 16px', fontSize: 16, fontFamily: 'var(--font-heading)' }}>Calendar</h3>
            <Calendar
              onChange={setDate}
              value={date}
              tileContent={({ date: tileDate, view }) => {
                if (view !== 'month') return null;
                const dStr = tileDate.toISOString().split('T')[0];
                const hasPending = reminders.some((r) => r.date === dStr && !r.is_completed);
                if (!hasPending) return null;
                return (
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      background: 'var(--accent)',
                      borderRadius: '50%',
                      margin: '4px auto 0',
                    }}
                  />
                );
              }}
            />
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="reminder-glass modal-content" style={{ maxWidth: 440, textAlign: 'left' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ margin: 0, fontFamily: 'var(--font-heading)' }}>Schedule Reminder</h3>
              <button type="button" onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="pill-toggle-group" style={{ width: '100%', justifyContent: 'stretch' }}>
                {Object.entries(CATEGORIES).map(([key, cat]) => (
                  <button
                    key={key}
                    type="button"
                    className={`pill-toggle ${newReminder.category === key ? 'active' : ''}`}
                    style={{ flex: 1 }}
                    onClick={() => setNewReminder({ ...newReminder, category: key })}
                  >
                    {cat.label.split(' ')[0]}
                  </button>
                ))}
              </div>

              <div className="bento-form-group">
                <label>Title</label>
                <input
                  className="inv-input"
                  type="text"
                  value={newReminder.title}
                  onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                  placeholder={
                    newReminder.category === 'bills'
                      ? 'e.g. Electricity Bill'
                      : newReminder.category === 'subscriptions'
                        ? 'e.g. Netflix Subscription'
                        : 'e.g. Portfolio review alert'
                  }
                />
              </div>

              <div className="bento-form-group">
                <label>Notes (optional)</label>
                <textarea
                  className="inv-input"
                  rows={3}
                  value={newReminder.description}
                  onChange={(e) => setNewReminder({ ...newReminder, description: e.target.value })}
                  style={{ resize: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="bento-form-group">
                  <label>Date</label>
                  <input className="inv-input" type="text" value={selectedDateStr} disabled />
                </div>
                <div className="bento-form-group">
                  <label>Time</label>
                  <input
                    className="inv-input"
                    type="time"
                    value={newReminder.time}
                    onChange={(e) => setNewReminder({ ...newReminder, time: e.target.value })}
                  />
                </div>
              </div>

              <button type="button" className="inv-btn-primary" onClick={handleAdd}>
                Schedule Task
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

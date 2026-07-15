import React, { useState, useEffect, useRef, useCallback } from 'react';
import './NotificationBell.css';
import { API_URL } from '../../../config/api';

const ICONS = {
  gallery_created:  '🖼️',
  images_added:     '📸',
  new_video:        '🎬',
  comment_seen:     '👁️',
  request_response: '📩',
  profile_updated:  '👤',
  selection_confirmed: '✅',
  new_comment:      '💬',
  new_request:      '📋',
  new_review:       '⭐',
  default:          '🔔',
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Ahora';
  if (m < 60) return `Hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `Hace ${h}h`;
  const d = Math.floor(h / 24);
  return `Hace ${d}d`;
}

const NotificationBell = ({ role }) => {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const baseUrl = role === 'admin' ? `${API_URL}/admin` : `${API_URL}/user`;

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch(`${baseUrl}/notifications`, { credentials: 'include' });
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnread(data.unread || 0);
    } catch {}
  }, [baseUrl]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const markRead = async (id) => {
    await fetch(`${baseUrl}/notifications/${id}/read`, { method: 'POST', credentials: 'include' });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    setUnread(prev => Math.max(0, prev - 1));
  };

  const markAllRead = async () => {
    await fetch(`${baseUrl}/notifications/read-all`, { method: 'POST', credentials: 'include' });
    setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
    setUnread(0);
  };

  const handleItemClick = (notif) => {
    if (!notif.is_read) markRead(notif.id);
  };

  return (
    <div className="nb-wrap" ref={ref}>
      <button className="nb-btn" onClick={() => setOpen(v => !v)} aria-label="Notificaciones">
        <svg className="nb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unread > 0 && <span className="nb-badge">{unread > 99 ? '99+' : unread}</span>}
      </button>

      {open && (
        <div className="nb-dropdown">
          <div className="nb-dropdown-header">
            <span className="nb-dropdown-title">Notificaciones</span>
            {unread > 0 && (
              <button className="nb-mark-all" onClick={markAllRead}>Marcar todo leído</button>
            )}
          </div>

          <div className="nb-list">
            {notifications.length === 0 ? (
              <div className="nb-empty">
                <span>🔔</span>
                <p>Sin notificaciones</p>
              </div>
            ) : (
              notifications.map(notif => (
                <div
                  key={notif.id}
                  className={`nb-item${notif.is_read ? '' : ' nb-item--unread'}`}
                  onClick={() => handleItemClick(notif)}
                >
                  <span className="nb-item-icon">{ICONS[notif.type] || ICONS.default}</span>
                  <div className="nb-item-body">
                    <p className="nb-item-title">{notif.title}</p>
                    {notif.message && <p className="nb-item-msg">{notif.message}</p>}
                    <span className="nb-item-time">{timeAgo(notif.created_at)}</span>
                  </div>
                  {!notif.is_read && <span className="nb-dot" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;

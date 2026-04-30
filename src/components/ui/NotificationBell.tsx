'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Bell, X, CheckCheck, ExternalLink, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { markAllNotificationsAsRead, markNotificationAsRead } from '@/modules/notifications/actions';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

interface NotificationBellProps {
  userId: string;
  initialUnreadCount?: number;
  initialNotifications?: Notification[];
  /** Link to the full notifications page (e.g. /client/notifications) */
  notificationsPageHref?: string;
}

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}j`;
}

const TYPE_ICON: Record<string, string> = {
  appointment_accepted: '✅',
  appointment_cancelled: '❌',
  appointment_pending: '⏳',
  new_appointment: '📅',
  review_left: '⭐',
  default: '🔔',
};

export function NotificationBell({
  userId,
  initialUnreadCount = 0,
  initialNotifications = [],
  notificationsPageHref = '/client/notifications',
}: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [isPending, startTransition] = useTransition();
  const panelRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Supabase Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`realtime-notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotif = payload.new as Notification;
          setNotifications((prev) => [newNotif, ...prev]);
          setUnreadCount((prev) => prev + 1);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const updated = payload.new as Notification;
          setNotifications((prev) =>
            prev.map((n) => (n.id === updated.id ? updated : n))
          );
          // Recompute unread count from local state
          setNotifications((prev) => {
            setUnreadCount(prev.filter((n) => !n.is_read).length);
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  function handleMarkAllRead() {
    startTransition(async () => {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    });
  }

  function handleClickNotification(notif: Notification) {
    if (!notif.is_read) {
      startTransition(async () => {
        await markNotificationAsRead(notif.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      });
    }
    setOpen(false);
  }

  const displayCount = unreadCount > 99 ? '99+' : unreadCount;

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        id="notification-bell-btn"
        aria-label="Notifications"
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/30"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold min-w-[16px] h-4 px-0.5 rounded-full flex items-center justify-center shadow-md animate-pulse border border-white/50">
            {displayCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div
          className="absolute right-0 mt-3 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[100] overflow-hidden"
          style={{ animation: 'notifSlideIn 0.18s ease' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
            <div className="flex items-center gap-2.5">
              <Bell className="w-4 h-4 opacity-90" />
              <span className="font-bold text-sm tracking-wide">Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full border border-white/30">
                  {unreadCount} non lues
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  disabled={isPending}
                  title="Tout marquer comme lu"
                  className="flex items-center gap-1.5 text-white/80 hover:text-white text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  <CheckCheck className="w-4 h-4" />
                  Tout lire
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-[420px] overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                  <AlertCircle className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-sm font-semibold text-gray-400">Aucune notification</p>
                <p className="text-xs text-gray-300 mt-1">Vous êtes à jour !</p>
              </div>
            ) : (
              notifications.slice(0, 20).map((notif) => {
                const icon = TYPE_ICON[notif.type] ?? TYPE_ICON.default;
                const content = (
                  <div
                    key={notif.id}
                    onClick={() => handleClickNotification(notif)}
                    className={`flex items-start gap-3.5 px-5 py-4 cursor-pointer transition-all duration-150 hover:bg-indigo-50/50 ${
                      !notif.is_read ? 'bg-indigo-50/30 border-l-2 border-l-indigo-400' : 'bg-white'
                    }`}
                  >
                    {/* Icon */}
                    <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-lg border border-gray-100">
                      {icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-semibold text-gray-900 leading-tight ${!notif.is_read ? 'font-bold' : ''}`}>
                          {notif.title}
                        </p>
                        <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap flex-shrink-0 mt-0.5">
                          {timeAgo(notif.created_at)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>
                      {notif.link && (
                        <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] text-indigo-500 font-semibold">
                          <ExternalLink className="w-3 h-3" />
                          Voir les détails
                        </span>
                      )}
                    </div>

                    {/* Unread dot */}
                    {!notif.is_read && (
                      <div className="flex-shrink-0 w-2 h-2 rounded-full bg-indigo-500 mt-2" />
                    )}
                  </div>
                );

                return notif.link ? (
                  <Link href={notif.link} key={notif.id} onClick={() => handleClickNotification(notif)}>
                    {content}
                  </Link>
                ) : (
                  <div key={notif.id}>{content}</div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 px-5 py-3 bg-gray-50/50">
            <Link
              href={notificationsPageHref}
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Voir toutes les notifications
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes notifSlideIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)  scale(1); }
        }
      `}</style>
    </div>
  );
}

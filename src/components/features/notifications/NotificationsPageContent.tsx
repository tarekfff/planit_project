import { getNotificationsForUser } from '@/modules/notifications/queries';
import { markAllNotificationsAsRead } from '@/modules/notifications/actions';
import { CheckCheck, Bell, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const TYPE_ICON: Record<string, string> = {
  appointment_accepted: '✅',
  appointment_cancelled: '❌',
  appointment_pending: '⏳',
  new_appointment: '📅',
  review_left: '⭐',
  default: '🔔',
};

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `il y a ${diff}s`;
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
  if (diff < 172800) return 'hier';
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
}

interface NotificationsPageProps {
  backHref?: string;
  backLabel?: string;
}

export default async function NotificationsPageContent({
  backHref = '/client',
  backLabel = 'Retour au tableau de bord',
}: NotificationsPageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const notifications = await getNotificationsForUser();
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-white opacity-10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold">Notifications</h1>
              <p className="text-sm text-indigo-100 opacity-80">
                {unreadCount > 0
                  ? `${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}`
                  : 'Tout est à jour !'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href={backHref}
              className="text-sm font-semibold text-indigo-100 hover:text-white transition-colors"
            >
              ← {backLabel}
            </Link>
            {unreadCount > 0 && (
              <form action={markAllNotificationsAsRead as any}>
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all border border-white/30"
                >
                  <CheckCheck className="w-4 h-4" />
                  Tout marquer comme lu
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Notifications list */}
      {notifications.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100">
          <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-6">
            <Bell className="w-8 h-8 text-indigo-300" />
          </div>
          <h2 className="text-xl font-bold text-gray-700 mb-2">Aucune notification</h2>
          <p className="text-gray-400 text-sm">
            Vous serez averti ici lorsqu&apos;un événement important se produit.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
          {notifications.map((notif) => {
            const icon = TYPE_ICON[notif.type] ?? TYPE_ICON.default;
            const row = (
              <div
                key={notif.id}
                className={`flex items-start gap-4 px-6 py-5 transition-all hover:bg-gray-50 ${
                  !notif.is_read ? 'bg-indigo-50/40 border-l-4 border-indigo-400' : ''
                }`}
              >
                {/* Icon */}
                <div className="flex-shrink-0 w-11 h-11 rounded-2xl bg-gray-100 flex items-center justify-center text-xl shadow-sm">
                  {icon}
                </div>

                {/* Body */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className={`text-sm leading-snug text-gray-900 ${!notif.is_read ? 'font-bold' : 'font-semibold'}`}>
                      {notif.title}
                    </p>
                    <span className="flex-shrink-0 text-[11px] text-gray-400 font-medium">
                      {timeAgo(notif.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">{notif.message}</p>
                  {notif.link && (
                    <span className="inline-flex items-center gap-1.5 mt-1 text-xs font-semibold text-indigo-500">
                      <ExternalLink className="w-3 h-3" />
                      Voir les détails
                    </span>
                  )}
                </div>

                {/* Unread dot */}
                {!notif.is_read && (
                  <div className="flex-shrink-0 w-2.5 h-2.5 rounded-full bg-indigo-500 mt-2 shadow" />
                )}
              </div>
            );

            return notif.link ? (
              <Link href={notif.link} key={notif.id} className="block">
                {row}
              </Link>
            ) : (
              <div key={notif.id}>{row}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}

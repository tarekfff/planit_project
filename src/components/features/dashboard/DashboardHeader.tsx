import { createClient } from '@/lib/supabase/server';
import Image from 'next/image';
import { getNotificationsForUser, getUnreadNotificationCount } from '@/modules/notifications/queries';
import { NotificationBell } from '@/components/ui/NotificationBell';

interface DashboardHeaderProps {
  establishmentName?: string;
  avatarUrl?: string;
  /** Which notifications page to link to from the bell dropdown */
  notificationsPageHref?: string;
}

export async function DashboardHeader({
  establishmentName = 'Clinique Sophia',
  avatarUrl,
  notificationsPageHref = '/dashboard/manager/notifications',
}: DashboardHeaderProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const today = new Date();
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  const formattedDate = today.toLocaleDateString('fr-FR', options);
  const displayDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  // Pre-fetch notifications server-side so the bell renders with data on first load
  const [initialNotifications, initialUnreadCount] = user
    ? await Promise.all([getNotificationsForUser(), getUnreadNotificationCount()])
    : [[], 0];

  return (
    <header className="flex items-center justify-between px-8 py-4 bg-primary text-white shadow-sm">
      <div className="flex flex-col">
        <h1 className="text-lg font-bold">
          Salut, <span className="opacity-90">{establishmentName}</span>
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium opacity-90">{displayDate}</p>
        </div>

        {/* Real-time notification bell */}
        {user && (
          <NotificationBell
            userId={user.id}
            initialUnreadCount={initialUnreadCount}
            initialNotifications={initialNotifications}
            notificationsPageHref={notificationsPageHref}
          />
        )}

        <div className="w-10 h-10 rounded-full border-2 border-white/20 overflow-hidden bg-white/10 flex items-center justify-center">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt="Profile"
              width={40}
              height={40}
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
              <span className="text-xs font-bold text-white">CS</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

import { DashboardSidebar } from '@/components/layouts/DashboardSidebar';
import { getSidebarData } from '@/modules/establishments/queries';
import { getUnreadNotificationCount } from '@/modules/notifications/queries';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { establishment, profile } = await getSidebarData();
  const unreadCount = await getUnreadNotificationCount();

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <DashboardSidebar
        role={profile?.role}
        establishmentName={establishment?.name}
        category={establishment?.description}
        unreadNotificationCount={unreadCount}
      />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </main>
    </div>
  );
}

import { DashboardSidebar } from '@/components/layouts/DashboardSidebar';
import { getSidebarData } from '@/modules/establishments/queries';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { establishment } = await getSidebarData();

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <DashboardSidebar
        establishmentName={establishment?.name}
        category={establishment?.description}
      />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </main>
    </div>
  );
}

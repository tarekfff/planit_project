import { DashboardHeader } from '@/components/features/dashboard/DashboardHeader';
import { StatsCards } from '@/components/features/dashboard/StatsCards';
import { AppointmentsTable } from '@/components/features/dashboard/AppointmentsTable';
import { DashboardAnalytics } from '@/components/features/dashboard/DashboardAnalytics';
import { getManagerDashboardData } from '@/modules/dashboard/queries';
import { redirect } from 'next/navigation';

export default async function ManagerDashboardPage() {
  const data = await getManagerDashboardData();

  if (!data) {
    // If no data/establishment is found for this user, they might not be a valid manager or haven't finished setup
    redirect('/login');
  }

  const { establishment, metrics, recentAppointments, historyAppointments } = data;

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gray-50/30">
      <DashboardHeader establishmentName={establishment.name} avatarUrl={establishment.logo_url} />

      <div className="flex-1 p-8 space-y-10 max-w-7xl mx-auto w-full overflow-y-auto">
        {/* Top Section: Metrics & Alert */}
        <StatsCards metrics={metrics} />

        {/* Middle Section: Recent Appointments & Vertical Chart */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AppointmentsTable title="Rendez-vous" appointments={recentAppointments} />
          </div>

          {/* Daily Activity Vertical Bar Chart Placeholder */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-bold text-gray-900">Activité journalière</h3>
              <span className="text-[10px] text-gray-400 font-bold uppercase">Cette Semaine</span>
            </div>
            <div className="flex-1 flex items-end justify-between gap-2 px-2">
              {[
                { day: 'Sa', val: 70, color: 'bg-purple-500' },
                { day: 'Di', val: 55, color: 'bg-orange-400' },
                { day: 'Lu', val: 85, color: 'bg-indigo-500' },
                { day: 'Ma', val: 30, color: 'bg-cyan-400' },
                { day: 'Me', val: 0, color: 'bg-gray-100' },
                { day: 'Je', val: 75, color: 'bg-orange-400' },
                { day: 'Ve', val: 85, color: 'bg-purple-500' },
              ].map((d) => (
                <div key={d.day} className="flex flex-col items-center gap-2 flex-1">
                  <div
                    className={`w-full rounded-md ${d.color} transition-all duration-1000 origin-bottom`}
                    style={{ height: `${d.val}%` }}
                  />
                  <span className="text-[10px] font-bold text-gray-400 uppercase">{d.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Analytics Widgets */}
        <DashboardAnalytics />

        {/* History Table */}
        <AppointmentsTable
          title="Historique des RDV"
          appointments={historyAppointments}
          showDate={true}
        />
      </div>
    </div>
  );
}

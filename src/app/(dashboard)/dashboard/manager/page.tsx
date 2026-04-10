import { DashboardHeader } from '@/components/features/dashboard/DashboardHeader';
import { StatsCards } from '@/components/features/dashboard/StatsCards';
import { AppointmentsTable } from '@/components/features/dashboard/AppointmentsTable';
import { DashboardAnalytics } from '@/components/features/dashboard/DashboardAnalytics';
import { getEstablishmentForManager, getDashboardStats, getServiceTrends, getOccupancyRates } from '@/modules/establishments/queries';
import { getManagerDashboardAppointments } from '@/modules/appointments/queries';
import { redirect } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { logout } from "@/modules/auth/actions";
import { createClient } from '@/lib/supabase/server';
import { cn } from '@/lib/utils';

export default async function ManagerDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const establishment = await getEstablishmentForManager(user.id);

  if (!establishment) {
    // If no data/establishment is found for this user, they haven't finished setup
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-6 max-w-lg mx-auto text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Configuration requise</h1>
          <p className="text-muted-foreground text-lg">
            Votre compte est actif, mais aucun établissement n&apos;est associé à ce profil.
            Veuillez finaliser la configuration de votre établissement ou contacter le support.
          </p>
        </div>
        <form action={logout}>
          <Button type="submit" variant="destructive" size="lg" className="px-8 shadow-sm font-semibold tracking-wide">
            Se déconnecter
          </Button>
        </form>
      </div>
    );
  }

  // Parallel fetch for better performance
  const [
    { metrics: apptMetrics, recent, history, pendingItems, dailyActivity },
    estStats,
    serviceTrends,
    occupancyRates
  ] = await Promise.all([
    getManagerDashboardAppointments(establishment.id),
    getDashboardStats(establishment.id),
    getServiceTrends(establishment.id),
    getOccupancyRates(establishment.id)
  ]);

  const metrics = {
    ...apptMetrics,
    proCount: estStats.proCount,
    satisfaction: estStats.satisfaction
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gray-50/30">
      <DashboardHeader establishmentName={establishment.name} avatarUrl={establishment.logo_url} />

      <div className="flex-1 p-8 space-y-10 max-w-7xl mx-auto w-full overflow-y-auto">
        {/* Top Section: Metrics & Alert */}
        <StatsCards metrics={metrics} />

        {/* Middle Section: Recent Appointments & Vertical Chart */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AppointmentsTable title="Rendez-vous" appointments={recent} />
          </div>

          {/* Daily Activity Vertical Bar Chart Placeholder */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-bold text-gray-900">Activité journalière</h3>
              <span className="text-[10px] text-gray-400 font-bold uppercase">Cette Semaine</span>
            </div>
            <div className="flex-1 flex items-end justify-between gap-2 px-2">
              {dailyActivity.map((d) => (
                <div key={d.day} className="flex flex-col items-center gap-2 flex-1">
                  <div
                    className={cn(
                        "w-full rounded-md transition-all duration-1000 origin-bottom",
                        d.day === 'Lu' ? 'bg-indigo-500' : d.day === 'Di' ? 'bg-orange-400' : 'bg-purple-500'
                    )}
                    style={{ height: `${d.val}%` }}
                  />
                  <span className="text-[10px] font-bold text-gray-400 uppercase">{d.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Analytics Widgets */}
        <DashboardAnalytics 
            serviceTrends={serviceTrends}
            pendingItems={pendingItems}
            occupancyRates={occupancyRates}
            cancellations={[]} // Placeholder
        />

        {/* History Table */}
        <AppointmentsTable
          title="Historique des RDV"
          appointments={history}
          showDate={true}
        />
      </div>
    </div>
  );
}

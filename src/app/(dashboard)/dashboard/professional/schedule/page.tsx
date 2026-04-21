import { getProfessionalAppointments } from '@/modules/appointments/queries';
import CalendarView from '@/components/features/calendar/CalendarView';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Calendrier | Planit',
};

export default async function CalendarPage() {
  const data = await getProfessionalAppointments();

  if (!data.establishmentId) {
    redirect('/dashboard/professional');
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Mon Planning</h1>
        <p className="text-gray-500">Gérez vos rendez-vous et vos disponibilités.</p>
      </div>

      <CalendarView
        initialAppointments={data.appointments}
        professionals={data.professionals}
        services={data.services}
        establishmentId={data.establishmentId}
        workingHours={data.workingHours}
        currentProfessionalId={data.currentProfessionalId}
      />
    </div>
  );
}

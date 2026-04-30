import { getAppointmentsForClient } from '@/modules/appointments/queries';
import { Calendar, MapPin, Clock, CheckCircle, XCircle, AlertCircle, ArrowRight, Edit3 } from 'lucide-react';
import Link from 'next/link';
import { AppointmentActions } from '../AppointmentActions';

export const dynamic = 'force-dynamic';

export default async function ClientAppointmentsPage() {
  const appointments = await getAppointmentsForClient();
  const now = new Date();

  // Sort and separate appointments
  const upcoming = appointments.filter((apt: any) => new Date(apt.start_time) >= now && apt.status !== 'cancelled');
  const past = appointments.filter((apt: any) => new Date(apt.start_time) < now && apt.status !== 'cancelled');
  const cancelled = appointments.filter((apt: any) => apt.status === 'cancelled');

  const renderAppointmentCard = (apt: any) => {
    const start = new Date(apt.start_time);
    const end = new Date(apt.end_time);
    const isToday = start.toDateString() === now.toDateString();
    
    let statusConfig = { icon: <CheckCircle className="w-5 h-5"/>, color: 'text-green-600', bg: 'bg-green-50 border-green-200', label: 'Confirmé' };
    if (apt.status === 'pending') {
      statusConfig = { icon: <Clock className="w-5 h-5"/>, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200', label: 'En revue' };
    } else if (apt.status === 'cancelled') {
      statusConfig = { icon: <XCircle className="w-5 h-5"/>, color: 'text-red-600', bg: 'bg-red-50 border-red-200', label: 'Annulé' };
    }

    return (
      <div key={apt.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow relative overflow-hidden group">
        {isToday && apt.status !== 'cancelled' && (
          <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500 rounded-l-3xl"></div>
        )}
        
        <div className="flex-shrink-0 flex flex-col items-center justify-center bg-indigo-50 w-24 h-24 rounded-2xl border border-indigo-100 text-indigo-700">
           <span className="text-3xl font-black">{start.getDate()}</span>
           <span className="text-sm font-bold uppercase">{start.toLocaleDateString('fr-FR', { month: 'short' })}</span>
        </div>
        
        <div className="flex-1 space-y-2">
           <div className="flex justify-between items-start">
             <div>
               <h3 className="text-xl font-extrabold text-gray-900 group-hover:text-indigo-600 transition-colors">
                 {apt.service?.name || 'Service général'}
               </h3>
               <p className="text-gray-500 font-medium flex items-center gap-1.5 mt-1">
                 <Clock className="w-4 h-4"/> 
                 {start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - {end.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
               </p>
             </div>
             <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-bold text-sm ${statusConfig.bg} ${statusConfig.color}`}>
               {statusConfig.icon} {statusConfig.label}
             </div>
           </div>
           
           <div className="pt-3 flex flex-wrap items-center gap-4 text-sm font-medium">
             <div className="flex items-center gap-2">
               <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-400">
                 {apt.professional?.avatar_url ? <img src={apt.professional.avatar_url} className="w-full h-full object-cover rounded-full"/> : <span className="text-xs">Dr</span>}
               </div>
               <span className="text-gray-800">{apt.professional?.full_name || 'Professionnel'}</span>
             </div>
             <div className="w-px h-4 bg-gray-200"></div>
             <div className="flex items-center gap-1.5 text-gray-500">
               <MapPin className="w-4 h-4" />
               <span className="truncate max-w-[200px]">{apt.establishment?.name || 'Établissement'}</span>
             </div>
           </div>
        </div>

        {apt.status !== 'cancelled' && (
          <div className="flex flex-col justify-center border-l border-gray-100 pl-6 ml-auto">
             <AppointmentActions 
               appointmentId={apt.id} 
               establishmentId={apt.establishment_id} 
             />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Mes Rendez-vous</h1>
          <p className="text-gray-500 font-medium mt-1">Gérez vos réservations et consultez votre historique.</p>
        </div>
        <Link href="/search" className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-sm hover:bg-indigo-700 transition-colors">
           Nouveau RDV
        </Link>
      </div>

      <div className="space-y-8">
        {/* Upcoming */}
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-500" /> À venir
          </h2>
          {upcoming.length > 0 ? (
            <div className="space-y-4">
              {upcoming.map(renderAppointmentCard)}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-2xl p-8 text-center border border-dashed border-gray-200">
              <Calendar className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Aucun rendez-vous à venir.</p>
            </div>
          )}
        </section>

        {/* Past */}
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" /> Historique
          </h2>
          {past.length > 0 ? (
            <div className="space-y-4">
              {past.map(renderAppointmentCard)}
            </div>
          ) : (
            <p className="text-gray-500 font-medium ml-2">Aucun historique disponible.</p>
          )}
        </section>
        
        {/* Cancelled */}
        {cancelled.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" /> Annulés
            </h2>
            <div className="space-y-4 opacity-75">
              {cancelled.map(renderAppointmentCard)}
            </div>
          </section>
        )}
      </div>

    </div>
  );
}

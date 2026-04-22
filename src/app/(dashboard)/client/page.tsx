import { getClientDashboardData } from '@/modules/appointments/queries'
import { Calendar, MapPin, User, Activity, Search, Edit3, XCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ClientDashboardPage() {
  const { 
    profile, 
    upcomingAppointments, 
    pastAppointments, 
    thisMonthAppointmentsCount: thisMonthAppointments,
    featuredEstablishments
  } = await getClientDashboardData()
  
  const now = new Date()
  
  const nextAppointment = upcomingAppointments[0] || null;
  const recentAppointment = pastAppointments[pastAppointments.length - 1] || null;
  
  const firstFirstName = profile.full_name?.split(' ')[0] || 'Client';

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in zoom-in duration-500 pb-20">
      {/* HEADER HERO */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-4 max-w-xl">
          <div className="inline-block bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-medium border border-white/30 shadow-sm shadow-indigo-900/20">
            Accueil
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight drop-shadow-sm">
            🎉 Bienvenue sur Planit, {firstFirstName} !
          </h1>
          <p className="text-lg md:text-xl text-indigo-50 font-medium opacity-90 drop-shadow-sm">
            Nous sommes ravis de vous accueillir.
          </p>
          <div className="pt-4">
            <Link 
              href="/"
              className="inline-flex items-center gap-2 bg-white text-indigo-600 hover:bg-indigo-50 transition-colors px-5 md:px-6 py-3 rounded-xl font-semibold shadow-lg shadow-indigo-900/20 active:scale-95 duration-200"
            >
              <Search className="w-5 h-5 text-indigo-500" />
              ✨ Rechercher un professionnel
            </Link>
          </div>
        </div>
        
        {/* Decorative graphic (Optional but adds premium feel) */}
        <div className="hidden lg:block relative z-10">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-2xl shadow-2xl skew-y-3 transform hover:skew-y-0 transition-transform duration-500 cursor-pointer w-64">
            <div className="flex items-center gap-4 mb-5 opacity-90">
               <div className="w-12 h-12 bg-gradient-to-br from-white/30 to-white/10 rounded-full flex items-center justify-center border border-white/20 shadow-inner">
                 <Calendar className="text-white w-6 h-6"/>
               </div>
               <div>
                  <div className="h-3 w-24 bg-white/30 rounded mb-2 shadow-sm"></div>
                  <div className="h-2 w-16 bg-white/20 rounded shadow-sm"></div>
               </div>
            </div>
            <div className="h-2 w-full bg-white/30 rounded mb-2 border border-white/10 shadow-sm"></div>
            <div className="h-2 w-3/4 bg-white/20 rounded shadow-sm"></div>
            <div className="h-2 w-5/6 bg-white/10 rounded shadow-sm mt-3"></div>
          </div>
        </div>
      </div>

      {/* CONTENT GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Next Appointments Col */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex items-center gap-3 relative">
             <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-full"></div>
             <div className="p-2.5 bg-blue-100 dark:bg-blue-900/40 rounded-xl text-blue-600 shadow-sm">
                <Calendar className="w-6 h-6" />
             </div>
             <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">📅 PROCHAIN RENDEZ-VOUS</h2>
          </div>

          {upcomingAppointments.length > 0 ? (
            <div className="space-y-5">
               {upcomingAppointments.slice(0,3).map((apt: any) => {
                  const d = new Date(apt.start_time);
                  const isToday = d.toDateString() === now.toDateString();
                  
                  // Format Date
                  let dateLabel = '';
                  if (isToday) {
                    dateLabel = `AUJOURD'HUI - ${d.toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}`;
                  } else {
                    dateLabel = `${d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'})} - ${d.toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}`;
                  }

                  return (
                    <div key={apt.id} className="group relative bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1">
                       <div className={`absolute top-0 left-0 w-1.5 h-full ${isToday ? 'bg-orange-500' : 'bg-indigo-500'} rounded-l-2xl group-hover:w-2 transition-all`}></div>
                       
                       <div className="flex flex-col md:flex-row md:items-start justify-between gap-5 pl-2">
                          <div className="space-y-3.5 flex-1">
                            <span className={`inline-flex items-center text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm ${isToday ? 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 dark:from-orange-900/50 dark:to-amber-900/50 dark:text-orange-200' : 'bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-700 dark:from-indigo-900/50 dark:to-blue-900/50 dark:text-indigo-200'}`}>
                               {dateLabel}
                            </span>
                            
                            <div>
                               <h3 className="text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors drop-shadow-sm">
                                 {apt.establishment?.name || "Cabinet Inconnu"}
                               </h3>
                               <p className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 mt-1.5 font-medium">
                                 <MapPin className="w-4 h-4 text-gray-400" /> 
                                 {apt.establishment?.wilaya ? apt.establishment.wilaya : "Location non spécifiée"}
                               </p>
                            </div>

                            <div className="flex items-center gap-3 pt-2 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl w-max">
                               <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm">
                                  <User className="w-5 h-5 text-indigo-500" />
                               </div>
                               <div>
                                 <p className="font-bold text-gray-800 dark:text-gray-200 text-sm">Dr. {apt.professional?.full_name || "Non spécifié"}</p>
                                 <p className="text-xs text-gray-500 font-semibold">{apt.service?.name || "Service général"}</p>
                               </div>
                            </div>
                          </div>
                          
                          <div className="flex md:flex-col items-center flex-wrap gap-2 pt-4 md:pt-0 min-w-[160px]">
                             <button className="flex-1 w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-gray-700 dark:text-gray-200 hover:text-indigo-700 dark:hover:text-indigo-300 rounded-xl font-bold transition-all border border-gray-100 dark:border-gray-600 shadow-sm group">
                               Voir details <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                             </button>
                             <div className="flex w-full gap-2 mt-auto">
                                <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-xl text-sm font-bold transition-colors shadow-sm">
                                  <Edit3 className="w-4 h-4"/> Modifier
                                </button>
                                <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl text-sm font-bold transition-colors shadow-sm">
                                  <XCircle className="w-4 h-4"/> Annuler
                                </button>
                             </div>
                          </div>
                       </div>
                    </div>
                  )
               })}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-10 shadow-sm border border-gray-100 dark:border-gray-700/50 text-center">
               <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Calendar className="w-8 h-8 text-blue-400" />
               </div>
               <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Aucun rendez-vous à venir</h3>
               <p className="text-gray-500 font-medium">Vous n'avez aucun rendez-vous prévu pour le moment.</p>
               <button className="mt-6 px-6 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold rounded-xl transition-colors">
                  Rechercher un service
               </button>
            </div>
          )}
        </div>

        {/* Activity Col */}
        <div className="space-y-6">
           <div className="flex items-center gap-3 relative">
             <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-8 bg-purple-500 rounded-full"></div>
             <div className="p-2.5 bg-purple-100 dark:bg-purple-900/40 rounded-xl text-purple-600 shadow-sm">
                <Activity className="w-6 h-6" />
             </div>
             <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">📊 ACTIVITÉ RÉCENTE</h2>
           </div>

           <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-md border border-gray-100 dark:border-gray-700/50 hover:border-purple-200 dark:hover:border-purple-700/50 transition-colors">
               <ul className="space-y-7 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-gray-200 before:via-gray-100 before:to-transparent dark:before:from-gray-700 dark:before:via-gray-800">
                  
                  {/* Item 1: Last Appointment */}
                  <li className="relative flex items-start gap-5 z-10 bg-white dark:bg-gray-800 py-1">
                     <div className="mt-1 pb-1 w-6 h-6 rounded-full border-4 border-white dark:border-gray-800 bg-green-500 shadow-sm flex-shrink-0 z-10"></div>
                     <div className="flex-1 bg-gray-50 dark:bg-gray-900/50 rounded-xl p-3 border border-gray-100 dark:border-gray-700/50">
                        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Dernier rendez-vous</p>
                        {recentAppointment ? (
                          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex flex-wrap gap-1.5 items-center">
                            <span className="bg-white dark:bg-gray-700 px-2 py-0.5 rounded shadow-sm border border-gray-100 dark:border-gray-600">
                              {new Date(recentAppointment.start_time).toLocaleDateString('fr-FR')}
                            </span>
                            <span className="text-purple-600 dark:text-purple-400 font-bold">
                              - {recentAppointment.service?.name || "Service"}
                            </span>
                          </p>
                        ) : (
                          <p className="text-sm font-semibold text-gray-400 py-1">Aucune activité récente</p>
                        )}
                     </div>
                  </li>

                  {/* Item 2: Next Appointment */}
                  <li className="relative flex items-start gap-5 z-10 bg-white dark:bg-gray-800 py-1">
                     <div className="mt-1 w-6 h-6 rounded-full border-4 border-white dark:border-gray-800 bg-blue-500 shadow-sm flex-shrink-0 z-10"></div>
                     <div className="flex-1 bg-gray-50 dark:bg-gray-900/50 rounded-xl p-3 border border-gray-100 dark:border-gray-700/50">
                        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Prochain rendez-vous</p>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex flex-wrap gap-1.5 items-center">
                          {nextAppointment ? (
                            <>
                              <span className="bg-white dark:bg-gray-700 px-2 py-0.5 rounded shadow-sm border border-blue-100 dark:border-blue-900/30 text-blue-700 dark:text-blue-400">
                                {new Date(nextAppointment.start_time).toDateString() === now.toDateString() ? "Aujourd'hui" : new Date(nextAppointment.start_time).toLocaleDateString('fr-FR')}
                              </span>
                              <span className="text-gray-600 dark:text-gray-300 font-bold bg-white dark:bg-gray-700 px-2 py-0.5 rounded shadow-sm border border-gray-100 dark:border-gray-600">
                                {new Date(nextAppointment.start_time).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}
                              </span>
                            </>
                          ) : (
                            <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-500 font-medium">Aucun rendez-vous</span>
                          )}
                        </p>
                     </div>
                  </li>

                  {/* Item 3: Count this month */}
                  <li className="relative flex items-start gap-5 z-10 bg-white dark:bg-gray-800 py-1">
                     <div className="mt-1 w-6 h-6 rounded-full border-4 border-white dark:border-gray-800 bg-orange-500 shadow-sm flex-shrink-0 z-10"></div>
                     <div className="flex-1 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-3 border border-orange-100 dark:border-orange-800/30">
                        <div className="flex items-center gap-3">
                           <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-orange-500 to-red-600 drop-shadow-sm">
                             {thisMonthAppointments}
                           </div>
                           <p className="text-sm font-bold text-gray-700 dark:text-gray-200 leading-tight">rendez-vous<br/><span className="text-orange-600 dark:text-orange-400 text-xs uppercase tracking-wide">ce mois-ci</span></p>
                        </div>
                     </div>
                  </li>

               </ul>


           </div>
        </div>
      </div>

      {/* FEATURED ESTABLISHMENTS */}
      <div className="pt-8 space-y-6">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-3">
             <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl text-indigo-600">
                <MapPin className="w-6 h-6" />
             </div>
             <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">Découvrir les professionnels</h2>
           </div>
           <Link href="/search" className="text-sm font-bold text-indigo-600 hover:text-indigo-700">
             Tout voir &rarr;
           </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {featuredEstablishments && featuredEstablishments.length > 0 ? (
            featuredEstablishments.map((est: any) => (
              <div key={est.id} className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300 group cursor-pointer group">
                <div className="flex flex-col h-full">
                  <div className="flex items-start gap-4 mb-4">
                     <div className="w-14 h-14 bg-gray-50 dark:bg-gray-900 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner overflow-hidden border border-gray-100 dark:border-gray-700">
                        {est.logo_url ? (
                           <img src={est.logo_url} alt={est.name} className="w-full h-full object-cover" />
                        ) : (
                           <span className="text-xl">🏢</span>
                        )}
                     </div>
                     <div>
                       <h3 className="font-bold text-gray-900 dark:text-white leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2">
                         {est.name}
                       </h3>
                       <p className="text-xs text-gray-500 font-medium mt-1 flex items-center gap-1">
                         <MapPin className="w-3 h-3" /> {est.wilaya || 'Non spécifié'}
                       </p>
                     </div>
                  </div>
                  
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                      {est.description || 'Aucune description disponible.'}
                    </p>

                    {est.services && est.services.length > 0 && (
                      <div className="space-y-2 mt-auto">
                        <div className="flex flex-wrap gap-1.5">
                          {est.services.slice(0, 2).map((s: any) => (
                             <span key={s.id} className="inline-block bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold px-2 py-1 rounded border border-indigo-100 dark:border-indigo-800/30">
                               {s.name}
                             </span>
                          ))}
                          {est.services.length > 2 && (
                             <span className="inline-block bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-[10px] font-bold px-2 py-1 rounded border border-gray-200 dark:border-gray-700">
                               +{est.services.length - 2}
                             </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <button className="mt-5 w-full py-2.5 bg-gray-50 hover:bg-indigo-600 text-gray-700 hover:text-white dark:bg-gray-700/50 dark:text-gray-300 dark:hover:bg-indigo-600 text-sm font-bold rounded-xl transition-colors">
                     Voir le profil
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
              <span className="text-3xl mb-3 block opacity-50">🌍</span>
              <p className="text-gray-500 font-medium">Aucun établissement inscrit pour le moment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

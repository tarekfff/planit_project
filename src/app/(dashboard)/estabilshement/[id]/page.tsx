import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { MapPin, Star, Clock, User, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import BookingForm from './BookingForm';

export default async function EstablishmentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // 1. Fetch Establishment
  const { data: est, error } = await supabase
    .from('establishments')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (!est || error) {
    return notFound();
  }

  const establishment = est as any;

  // 2. Fetch Professionals
  const { data: professionals } = await supabase
    .from('professionals')
    .select('id, full_name, avatar_url, bio')
    .eq('establishment_id', id)
    .eq('is_active', true);

  // 3. Fetch Services
  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('establishment_id', id)
    .eq('is_active', true);


  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500 pb-20">
      
      <Link href="/search" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-bold transition-colors">
        <ArrowLeft className="w-5 h-5" /> Retour à la recherche
      </Link>
      
      {/* Establishment Banner */}
      <div className="relative h-64 md:h-80 w-full rounded-[2.5rem] overflow-hidden shadow-2xl group border-4 border-white dark:border-gray-800">
        {establishment.banner_url ? (
          <img 
            src={establishment.banner_url} 
            alt={`${establishment.name} banner`} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center relative overflow-hidden">
             {/* Decorative abstract elements for fallback banner */}
             <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
                <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
                <div className="absolute bottom-10 right-20 w-48 h-48 bg-white rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-indigo-200 rounded-full blur-[100px]"></div>
             </div>
             <div className="relative z-10 text-white/40 flex flex-col items-center gap-3">
                <Star className="w-16 h-16 opacity-30" />
                <span className="text-sm font-bold tracking-widest uppercase opacity-50">Bienvenue chez {establishment.name}</span>
             </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none"></div>
      </div>

      {/* Header Profile */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700/50 flex flex-col md:flex-row gap-8 items-start relative overflow-hidden -mt-20 mx-4 md:mx-8 z-20 backdrop-blur-sm bg-white/95 dark:bg-gray-800/95">
        <div className="w-32 h-32 bg-gray-50 dark:bg-gray-900 rounded-3xl flex items-center justify-center flex-shrink-0 shadow-xl border-4 border-white dark:border-gray-800 overflow-hidden z-10 transform -rotate-2 hover:rotate-0 transition-transform">
          {establishment.logo_url ? (
            <img src={establishment.logo_url} alt={establishment.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-5xl">🏬</span>
          )}
        </div>
        <div className="flex-1 z-10">
          <div className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-bold mb-4 shadow-sm border border-green-100">
            <Star className="w-4 h-4 fill-current" /> 4.9 (128 avis)
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">{establishment.name}</h1>
          <p className="flex items-center gap-2 text-gray-500 font-medium text-lg mb-4">
            <MapPin className="w-5 h-5 text-indigo-400" />
            {establishment.address || 'Adresse non spécifiée'}, {establishment.wilaya}
          </p>
          <p className="text-gray-600 leading-relaxed max-w-2xl text-lg">
            {establishment.description || "Aucune description fournie."}
          </p>
        </div>
        
        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 transform translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           {/* Services List */}
           <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
             <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
               <span className="p-2 bg-indigo-100 text-indigo-600 rounded-xl"><Star className="w-6 h-6"/></span>
               Services proposés
             </h2>
             {services && services.length > 0 ? (
               <div className="space-y-4">
                 {services.map(service => (
                   <div key={service.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-indigo-200 transition-colors">
                     <div>
                       <h3 className="font-bold text-gray-900 text-lg">{service.name}</h3>
                       <p className="text-gray-500 text-sm flex items-center gap-2 mt-1 font-medium">
                         <Clock className="w-4 h-4"/> {service.duration_minutes} min
                       </p>
                     </div>
                     <div className="font-black text-xl text-indigo-600">
                       {service.price} DZD
                     </div>
                   </div>
                 ))}
               </div>
             ) : (
               <p className="text-gray-500 text-center py-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200 font-medium">Aucun service disponible.</p>
             )}
           </div>

           {/* Professionals List */}
           <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
             <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
               <span className="p-2 bg-purple-100 text-purple-600 rounded-xl"><User className="w-6 h-6"/></span>
               Notre équipe
             </h2>
             {professionals && professionals.length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {professionals.map(prof => (
                   <div key={prof.id} className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow bg-gray-50">
                      <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center font-bold text-gray-400 text-xl overflow-hidden shadow-inner border border-gray-100">
                        {prof.avatar_url ? <img src={prof.avatar_url} className="w-full h-full object-cover"/> : prof.full_name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{prof.full_name}</h3>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">{prof.bio || 'Professionnel'}</p>
                      </div>
                   </div>
                 ))}
               </div>
             ) : (
               <p className="text-gray-500 text-center py-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200 font-medium">Aucun professionnel.</p>
             )}
           </div>
        </div>

        {/* Booking Form Side */}
        <div className="space-y-6">
           <BookingForm 
             establishmentId={id} 
             professionals={professionals || []} 
             services={services || []} 
             workingHours={establishment.working_hours || []}
           />
           
           {/* Working Hours Info */}
           <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-400"/> Horaires d'ouverture officiels
              </h3>
              <div className="space-y-2 text-sm">
                 {establishment.working_hours ? (
                   Array.isArray(establishment.working_hours) ? establishment.working_hours.map((wh: any, i: number) => (
                     <div key={i} className="flex justify-between py-1 border-b border-gray-50 last:border-0">
                       <span className="text-gray-600 font-medium capitalize">{wh.day}</span>
                        <span className="font-bold text-gray-900">{wh.closed ? 'Fermé' : (wh.time || (wh.open && wh.close ? `${wh.open} - ${wh.close}` : '-'))}</span>
                     </div>
                   )) : <p className="text-gray-500 text-center py-2 font-medium">Horaires disponibles sur place.</p>
                 ) : (
                   <p className="text-gray-500 text-center py-2 font-medium">Horaires non définis.</p>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

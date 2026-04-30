'use client';

import { useState } from 'react';
import { createClientAppointment } from '@/modules/appointments/actions';
import { Calendar as CalendarIcon, Clock, Send, CheckCircle } from 'lucide-react';
import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button 
      type="submit" 
      disabled={pending}
      className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl transition-all shadow-md shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-70"
    >
      {pending ? 'Réservation...' : <>Réserver maintenant <Send className="w-5 h-5" /></>}
    </button>
  );
}

export default function BookingForm({ establishmentId, professionals, services, workingHours = [] }: { establishmentId: string, professionals: any[], services: any[], workingHours?: any[] }) {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [serviceId, setServiceId] = useState('');

  const selectedService = services.find(s => s.id === serviceId);
  
  // -- Time Slots Logic --
  const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  // Use T00:00:00 to ensure date is parsed in local time, avoiding timezone shifts
  const selectedDateObj = date ? new Date(date + 'T00:00:00') : null;
  const dayOfWeek = selectedDateObj ? dayNames[selectedDateObj.getDay()] : null;
  const dayHours = workingHours?.find(wh => wh.day?.trim().toLowerCase() === dayOfWeek?.toLowerCase());
  
  let isClosed = false;
  let minTime = '';
  let maxTime = '';
  
  if (date && dayHours) {
    if (dayHours.closed || dayHours.time === 'Fermé' || !dayHours.time) {
      isClosed = true;
    } else {
      // Be flexible with dash characters and handle "9h00" format
      const cleanTimeStr = dayHours.time.replace(/h/g, ':');
      const timeStr = cleanTimeStr || (dayHours.open && dayHours.close ? `${dayHours.open} - ${dayHours.close}` : '');
      const parts = timeStr.split(/[-–—]/).map((s: string) => s.trim());
      if (parts.length === 2) {
        minTime = parts[0];
        maxTime = parts[1];
      } else {
        isClosed = true;
      }
    }
  } else if (date) {
    // If we have a date but no matching day in working_hours
    isClosed = true;
  }

  const timeSlots = [];
  if (date && !isClosed && minTime && maxTime && serviceId) {
     const parseTime = (t: string) => {
       const [h, m] = t.split(':').map(Number);
       return (h || 0) * 60 + (m || 0);
     };

     const startMin = parseTime(minTime);
     const endMin = parseTime(maxTime);
     const duration = selectedService?.duration_minutes || 30;
     
     let currentMin = startMin;
     const step = 30; // 30 mins intervals
     
     while (currentMin + duration <= endMin) {
        const slotH = Math.floor(currentMin / 60).toString().padStart(2, '0');
        const slotM = (currentMin % 60).toString().padStart(2, '0');
        timeSlots.push(`${slotH}:${slotM}`);
        currentMin += step;
     }
  }
  // -- End Time Slots Logic --

  async function action(formData: FormData) {
    if (!date || !time) {
       setError('Veuillez sélectionner une date et heure');
       return;
    }
    
    if (isClosed) {
       setError("L'établissement est fermé à cette date.");
       return;
    }
    
    const duration = selectedService?.duration_minutes || 30;
    const startObj = new Date(`${date}T${time}:00`);
    const endObj = new Date(startObj.getTime() + duration * 60000);
    
    formData.append('establishment_id', establishmentId);
    formData.append('start_time', startObj.toISOString());
    formData.append('end_time', endObj.toISOString());
    
    const res = await createClientAppointment(null, formData);
    if (res?.error) {
      setError(res.error);
    } else {
      setSuccess(true);
      setError('');
    }
  }

  if (success) {
    return (
      <div className="bg-green-50 rounded-3xl p-8 border border-green-100 text-center animate-in zoom-in duration-300 shadow-sm">
         <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
           <CheckCircle className="w-8 h-8" />
         </div>
         <h3 className="text-xl font-bold text-green-900 mb-2">Demande envoyée !</h3>
         <p className="text-green-700 font-medium text-sm">Votre rendez-vous est en attente de confirmation (statut: "en revue"). Vous pouvez le suivre dans votre espace client.</p>
         <button onClick={() => setSuccess(false)} className="mt-6 px-6 py-2 bg-white text-green-700 font-bold rounded-lg border border-green-200 shadow-sm hover:bg-green-50">
           Nouvelle réservation
         </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl shadow-indigo-100/50 border border-gray-100 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
      <h2 className="text-2xl font-black text-gray-900 mb-6 mt-2">Prendre rendez-vous</h2>
      
      {error && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-bold mb-4 border border-red-100">{error}</div>}

      <form action={action} className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">Service</label>
          <select 
            name="service_id" 
            className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all cursor-pointer"
            required
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
          >
            <option value="">Choisir un service</option>
            {services.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} {s.price ? `(${s.price} DZD)` : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">Professionnel</label>
          <select 
            name="professional_id" 
            className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all cursor-pointer"
            required
          >
            <option value="">Sélectionner</option>
            {professionals.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-1">
              <CalendarIcon className="w-4 h-4"/> Date
            </label>
            <input 
              type="date" 
              className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
              required
              value={date}
              onChange={e => {
                setDate(e.target.value);
                setTime(''); // Reset time when date changes
              }}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-1">
              <Clock className="w-4 h-4"/> Heure
            </label>
            {isClosed && date ? (
               <div className="w-full p-3.5 bg-red-50 text-red-600 border border-red-200 rounded-xl font-medium text-sm flex items-center justify-center h-[54px]">
                 Fermé ce jour
               </div>
            ) : (
              <select 
                name="time"
                className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all cursor-pointer disabled:opacity-50 disabled:bg-gray-100 h-[54px]"
                required
                value={time}
                onChange={e => setTime(e.target.value)}
                disabled={!date || !serviceId}
              >
                <option value="">
                  {(!date || !serviceId) 
                    ? "Choisir date et service" 
                    : (timeSlots.length === 0 ? "Aucun créneau disponible" : "Choisir une heure")}
                </option>
                {timeSlots.map(slot => (
                   <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">Note au professionnel (optionnel)</label>
          <textarea 
            name="client_notes" 
            rows={2}
            className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all resize-none"
            placeholder="Une demande particulière ?"
          ></textarea>
        </div>

        <div className="pt-2">
          <SubmitButton />
        </div>
        <p className="text-xs text-center text-gray-400 font-medium mt-3">
          Vous recevrez une notification lorsque le rendez-vous sera accepté par l'établissement.
        </p>
      </form>
    </div>
  );
}

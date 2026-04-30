'use client';

import { useState } from 'react';
import { Edit3, XCircle, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { cancelClientAppointment } from '@/modules/appointments/actions';
import { useRouter } from 'next/navigation';

interface AppointmentActionsProps {
  appointmentId: string;
  establishmentId: string;
}

export function AppointmentActions({ appointmentId, establishmentId }: AppointmentActionsProps) {
  const [isCancelling, setIsCancelling] = useState(false);
  const router = useRouter();

  const handleCancel = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) {
      return;
    }

    setIsCancelling(true);
    try {
      const result = await cancelClientAppointment(appointmentId);
      if (result.success) {
        alert('Rendez-vous annulé avec succès.');
        router.refresh();
      } else {
        alert(result.error || 'Une erreur est survenue lors de l\'annulation.');
      }
    } catch (error) {
      alert('Une erreur est survenue.');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="flex md:flex-col items-center flex-wrap gap-2 pt-4 md:pt-0 min-w-[160px]">
      <Link 
        href={`/client/appointments`}
        className="flex-1 w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-gray-700 dark:text-gray-200 hover:text-indigo-700 dark:hover:text-indigo-300 rounded-xl font-bold transition-all border border-gray-100 dark:border-gray-600 shadow-sm group"
      >
        Voir détails <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </Link>
      <div className="flex w-full gap-2 mt-auto">
        <Link 
          href={`/estabilshement/${establishmentId}`}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-xl text-sm font-bold transition-colors shadow-sm"
        >
          <Edit3 className="w-4 h-4"/> Modifier
        </Link>
        <button 
          onClick={handleCancel}
          disabled={isCancelling}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl text-sm font-bold transition-colors shadow-sm disabled:opacity-50"
        >
          {isCancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4"/>} 
          Annuler
        </button>
      </div>
    </div>
  );
}

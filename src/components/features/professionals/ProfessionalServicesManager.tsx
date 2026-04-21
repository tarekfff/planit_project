'use client';

import { useState, useTransition, useActionState } from 'react';
import { 
  addProfessionalSpecificService, 
  editProfessionalSpecificService, 
  deleteProfessionalSpecificService,
  saveProfessionalWorkingHours
} from '@/modules/professionals/actions';
import { Modal } from '@/components/ui/modal';

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

type Service = {
  id: string;
  name: string;
  duration_minutes: number;
};

type WorkingHoursItem = {
  day: string;
  time: string;
  closed: boolean;
};

export default function ProfessionalServicesManager({ 
  services: initialServices,
  workingHours: initialWorkingHours
}: { 
  services: Service[];
  workingHours: any;
}) {
  const [isPending, startTransition] = useTransition();
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Parse Initial Hours
  const defaultHours = DAYS.map(day => {
    // try to find if it exists
    const existing = Array.isArray(initialWorkingHours) 
      ? initialWorkingHours.find((h: any) => h.day === day)
      : null;
    
    if (existing) {
      if (existing.closed || existing.time === 'Fermé') {
        return { day, time: '', closed: true };
      }
      return { day, time: existing.time, closed: false };
    }
    return { day, time: '08:00-18:00', closed: false };
  });

  const [hours, setHours] = useState<WorkingHoursItem[]>(defaultHours);

  // --- Services State ---
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  
  const [addServState, addServAction, isAddingServ] = useActionState(addProfessionalSpecificService, { success: false });
  const [editServState, editServAction, isEditingServ] = useActionState(editProfessionalSpecificService, { success: false });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  if (addServState.success && isAddServiceOpen) {
    setIsAddServiceOpen(false);
    addServState.success = false;
    showToast('Service ajouté !');
  }
  if (editServState.success && editingService) {
    setEditingService(null);
    editServState.success = false;
    showToast('Service modifié !');
  }

  const handleDeleteService = (id: string) => {
    if (window.confirm("Voulez-vous vraiment supprimer ce service ?")) {
      startTransition(async () => {
        await deleteProfessionalSpecificService(id);
        showToast("Service supprimé");
      });
    }
  };

  const handleSaveHours = () => {
    startTransition(async () => {
      // Format back to what Calendar expects
      const formatted = hours.map(h => ({
        day: h.day,
        time: h.closed ? 'Fermé' : h.time,
        closed: h.closed
      }));
      const result = await saveProfessionalWorkingHours(formatted);
      if (result.success) {
        showToast('Horaires enregistrés avec succès !');
      } else {
        alert("Erreur lors de l'enregistrement des horaires.");
      }
    });
  };

  const toggleDayClosed = (index: number) => {
    const newHours = [...hours];
    newHours[index].closed = !newHours[index].closed;
    setHours(newHours);
  };

  const updateDayTime = (index: number, part: 'start' | 'end', val: string) => {
    const newHours = [...hours];
    let [start = '08:00', end = '18:00'] = newHours[index].time.split('-');
    if (part === 'start') start = val;
    if (part === 'end') end = val;
    newHours[index].time = `${start}-${end}`;
    setHours(newHours);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {toastMsg && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 bg-gray-900/95 backdrop-blur-md text-white text-[14px] font-semibold rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in">
           ✅ {toastMsg}
        </div>
      )}

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">Services & Horaires</h1>
        <p className="text-gray-500 mt-2">Gérez vos prestations et vos disponibilités.</p>
      </div>

      {/* SERVICES SECTION */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900">Vos Services</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100/80 bg-gray-50 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                <th className="py-4 px-6">Service</th>
                <th className="py-4 px-6">Durée</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {initialServices.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-gray-500 italic">
                    Aucun service trouvé. Ajoutez-en un !
                  </td>
                </tr>
              ) : (
                initialServices.map(service => (
                  <tr key={service.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 font-medium text-gray-800">{service.name}</td>
                    <td className="py-4 px-6 text-gray-600 font-medium">
                      <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm">
                        {service.duration_minutes} min
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-3">
                      <button onClick={() => setEditingService(service)} className="text-sm font-semibold text-purple-600 hover:text-purple-800 transition-colors">
                        Modifier
                      </button>
                      <button onClick={() => handleDeleteService(service.id)} className="text-sm font-semibold text-red-500 hover:text-red-700 transition-colors">
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-gray-50 border-t border-gray-100">
          <button 
            onClick={() => setIsAddServiceOpen(true)}
            className="px-5 py-2.5 bg-gray-900 border border-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-xl shadow-sm transition-all flex justify-center w-full sm:w-auto"
          >
            + Ajouter Un Service
          </button>
        </div>
      </div>

      {/* HORAIRES SECTION */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900">Vos Horaires</h2>
          <p className="text-sm text-gray-500 mt-1">Définissez vos heures d'ouverture standard.</p>
        </div>
        
        <div className="p-6 space-y-4">
          {/* Header Row */}
          <div className="hidden sm:grid grid-cols-[120px_1fr_1fr] gap-4 mb-2 px-4 text-sm font-semibold text-gray-500 uppercase">
            <div>Jour</div>
            <div>Heure début</div>
            <div>Heure fin</div>
          </div>

          <div className="space-y-3">
            {hours.map((h, i) => {
              const [start = '', end = ''] = h.closed ? ['', ''] : h.time.split('-');
              
              return (
                <div key={h.day} className={`p-4 sm:p-0 sm:px-4 sm:py-2 rounded-2xl sm:rounded-none sm:bg-transparent grid grid-cols-1 sm:grid-cols-[120px_1fr_1fr] items-center gap-4 transition-colors ${h.closed ? 'bg-gray-50 opacity-60 sm:opacity-100' : 'bg-white border border-gray-100 sm:border-none shadow-sm sm:shadow-none'}`}>
                  <div className="flex justify-between sm:block">
                    <span className={`font-semibold ${h.closed ? 'text-gray-400' : 'text-gray-900'}`}>{h.day}</span>
                    <button onClick={() => toggleDayClosed(i)} className="sm:hidden text-sm text-blue-600 font-medium">
                      {h.closed ? 'Ouvrir' : 'Marquer comme repos'}
                    </button>
                  </div>
                  
                  {h.closed ? (
                    <div className="col-span-1 sm:col-span-2 py-2">
                       <span className="inline-block px-3 py-1 bg-gray-200 text-gray-500 rounded-lg text-sm font-medium">Jour de Repos</span>
                    </div>
                  ) : (
                    <>
                      <input 
                        type="time" 
                        value={start}
                        onChange={(e) => updateDayTime(i, 'start', e.target.value)}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white transition-all text-gray-800 font-medium font-mono" 
                      />
                      <input 
                        type="time" 
                        value={end}
                        onChange={(e) => updateDayTime(i, 'end', e.target.value)}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white transition-all text-gray-800 font-medium font-mono" 
                      />
                    </>
                  )}
                  
                  {/* Desktop Repos Button Overlay */}
                  {!h.closed && (
                     <div className="hidden sm:flex absolute right-12 z-10">
                        <button onClick={() => toggleDayClosed(i)} className="text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors uppercase tracking-wider">
                          Repos
                        </button>
                     </div>
                  )}
                  {h.closed && (
                     <div className="hidden sm:flex absolute right-12 z-10">
                        <button onClick={() => toggleDayClosed(i)} className="text-xs font-semibold text-blue-500 hover:text-blue-700 transition-colors uppercase tracking-wider">
                          Ouvrir
                        </button>
                     </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-100 text-right">
          <button 
            onClick={handleSaveHours}
            disabled={isPending}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-sm transition-all disabled:opacity-50"
          >
            {isPending ? 'Enregistrement...' : 'Enregistrer les horaires'}
          </button>
        </div>
      </div>

      {/* --- MODALS --- */}
      <Modal isOpen={isAddServiceOpen} onClose={() => setIsAddServiceOpen(false)} title="Ajouter un service">
        <form action={addServAction} className="p-6 space-y-4">
          {addServState.error && <p className="text-red-500 text-sm">{addServState.error}</p>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom du service</label>
            <input required type="text" name="name" className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Durée (minutes)</label>
            <input required type="number" min="5" step="5" defaultValue={30} name="duration_minutes" className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 outline-none" />
          </div>
          <div className="pt-4 flex justify-end gap-3 text-sm">
            <button type="button" onClick={() => setIsAddServiceOpen(false)} className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl">Annuler</button>
            <button type="submit" disabled={isAddingServ} className="px-5 py-2.5 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700">Enregistrer</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!editingService} onClose={() => setEditingService(null)} title="Modifier le service">
        {editingService && (
          <form action={editServAction} className="p-6 space-y-4">
            <input type="hidden" name="id" value={editingService.id} />
             {editServState.error && <p className="text-red-500 text-sm">{editServState.error}</p>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom du service</label>
              <input required type="text" name="name" defaultValue={editingService.name} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Durée (minutes)</label>
              <input required type="number" min="5" step="5" defaultValue={editingService.duration_minutes} name="duration_minutes" className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 outline-none" />
            </div>
            <div className="pt-4 flex justify-end gap-3 text-sm">
              <button type="button" onClick={() => setEditingService(null)} className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl">Annuler</button>
              <button type="submit" disabled={isEditingServ} className="px-5 py-2.5 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700">Mettre à jour</button>
            </div>
          </form>
        )}
      </Modal>

    </div>
  );
}

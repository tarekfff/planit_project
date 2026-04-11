'use client';

import { useState, useEffect, useActionState } from 'react';
import { Modal } from '@/components/ui/modal';
import { createAppointment, updateAppointment, deleteAppointment } from '@/modules/appointments/actions';
import { useRouter } from 'next/navigation';
import type { AppointmentEvent, Professional, Service } from './CalendarView';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSlot: { start: Date; end: Date } | null;
  selectedAppointment: AppointmentEvent | null;
  professionals: Professional[];
  services: Service[];
}

const toLocalISOString = (date: Date) => {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const STATUS_OPTIONS = [
  { value: 'confirmed', label: 'Confirmé', color: 'bg-purple-100 text-purple-700' },
  { value: 'pending', label: 'En attente', color: 'bg-amber-100 text-amber-700' },
  { value: 'completed', label: 'Terminé', color: 'bg-green-100 text-green-700' },
  { value: 'no_show', label: 'Absent', color: 'bg-red-100 text-red-700' },
];

export default function EventModal({
  isOpen,
  onClose,
  selectedSlot,
  selectedAppointment,
  professionals,
  services,
}: EventModalProps) {
  const router = useRouter();
  const isEditing = !!selectedAppointment;

  // Form state
  const [professionalId, setProfessionalId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [clientName, setClientName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [clientNotes, setClientNotes] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [status, setStatus] = useState('confirmed');
  const [isDeleting, setIsDeleting] = useState(false);

  const [createState, createAction, isCreating] = useActionState(createAppointment, { success: false });
  const [updateState, updateAction, isUpdating] = useActionState(updateAppointment, { success: false });

  // Populate form when modal opens
  useEffect(() => {
    if (!isOpen) return;

    if (selectedAppointment) {
      setProfessionalId(selectedAppointment.professional_id);
      setServiceId(selectedAppointment.service_id || '');
      setClientName('');
      setStartTime(toLocalISOString(new Date(selectedAppointment.start_time)));
      setEndTime(toLocalISOString(new Date(selectedAppointment.end_time)));
      setClientNotes(selectedAppointment.client_notes || '');
      setInternalNotes(selectedAppointment.internal_notes || '');
      setStatus(selectedAppointment.status || 'confirmed');
    } else if (selectedSlot) {
      setProfessionalId(professionals[0]?.id || '');
      setServiceId('');
      setClientName('');
      setStartTime(toLocalISOString(selectedSlot.start));
      setEndTime(toLocalISOString(selectedSlot.end));
      setClientNotes('');
      setInternalNotes('');
      setStatus('confirmed');
    }
  }, [isOpen, selectedAppointment, selectedSlot, professionals]);

  // Close on success
  useEffect(() => {
    if (createState.success || updateState.success) {
      onClose();
      router.refresh();
    }
  }, [createState.success, updateState.success, onClose, router]);

  // Auto-fill end time when service is selected
  const handleServiceChange = (newServiceId: string) => {
    setServiceId(newServiceId);
    if (newServiceId && startTime) {
      const service = services.find(s => s.id === newServiceId);
      if (service) {
        const start = new Date(startTime);
        const end = new Date(start.getTime() + service.duration_minutes * 60000);
        setEndTime(toLocalISOString(end));
      }
    }
  };

  const handleDelete = async () => {
    if (!selectedAppointment) return;
    if (!confirm('Annuler ce rendez-vous ?')) return;
    
    setIsDeleting(true);
    const result = await deleteAppointment(selectedAppointment.id);
    setIsDeleting(false);
    
    if (result.success) {
      onClose();
      router.refresh();
    } else {
      alert(result.error || 'Erreur');
    }
  };

  const error = createState.error || updateState.error;
  const isSaving = isCreating || isUpdating;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title={isEditing ? 'Modifier le Rendez-vous' : 'Nouveau Rendez-vous'}
      description={isEditing ? 'Mettez à jour les détails du rendez-vous' : 'Remplissez les informations ci-dessous'}
      maxWidth="max-w-md"
    >
      <form action={isEditing ? updateAction : createAction} className="p-6 space-y-4 overflow-y-auto">
        {isEditing && <input type="hidden" name="id" value={selectedAppointment!.id} />}
        
        {error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium">{error}</div>
        )}

        {/* Professional */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Professionnel *</label>
          <select 
            required 
            name="professional_id" 
            value={professionalId} 
            onChange={e => setProfessionalId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none bg-white"
          >
            <option value="">-- Sélectionner --</option>
            {professionals.map(p => (
              <option key={p.id} value={p.id}>{p.full_name}</option>
            ))}
          </select>
        </div>

        {/* Service */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
          <select 
            name="service_id" 
            value={serviceId} 
            onChange={e => handleServiceChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none bg-white"
          >
            <option value="">-- Aucun --</option>
            {services.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.duration_minutes} min)</option>
            ))}
          </select>
        </div>

        {/* Client name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nom du client *</label>
          <input 
            required 
            type="text" 
            name="client_name"
            value={clientName} 
            onChange={e => setClientName(e.target.value)} 
            placeholder="Ex: Ahmed Benali" 
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none" 
          />
        </div>

        {/* Date/Time Hidden timezone-correct inputs */}
        <input type="hidden" name="start_time" value={startTime ? new Date(startTime).toISOString() : ''} />
        <input type="hidden" name="end_time" value={endTime ? new Date(endTime).toISOString() : ''} />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Début *</label>
            <input 
              required 
              type="datetime-local" 
              value={startTime} 
              onChange={e => setStartTime(e.target.value)} 
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none text-sm" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fin *</label>
            <input 
              required 
              type="datetime-local" 
              value={endTime} 
              onChange={e => setEndTime(e.target.value)} 
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none text-sm" 
            />
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map(opt => (
              <label key={opt.value} className="cursor-pointer">
                <input type="radio" name="status" value={opt.value} checked={status === opt.value} onChange={() => setStatus(opt.value)} className="sr-only peer" />
                <span className={`inline-block px-3 py-1.5 text-xs font-semibold rounded-full border-2 transition-all peer-checked:ring-2 peer-checked:ring-purple-400 peer-checked:ring-offset-1 ${opt.color}`}>
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes internes</label>
          <textarea 
            rows={2} 
            name="internal_notes"
            value={internalNotes} 
            onChange={e => setInternalNotes(e.target.value)} 
            placeholder="Notes visibles uniquement par l'équipe..." 
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none resize-none text-sm" 
          />
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-6 border-t border-gray-100">
          {isEditing ? (
            <button 
              type="button" 
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2 text-red-600 hover:bg-red-50 font-medium rounded-xl transition-colors disabled:opacity-50"
            >
              {isDeleting ? 'Annulation...' : 'Annuler le RDV'}
            </button>
          ) : (
            <div />
          )}
          
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="px-5 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors">
              Fermer
            </button>
            <button 
              type="submit" 
              disabled={isSaving}
              className="px-5 py-2 bg-purple-600 text-white font-medium hover:bg-purple-700 shadow-sm rounded-xl transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

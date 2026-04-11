'use client';

import { useState } from 'react';
import { Pencil, Loader2, X, Clock } from 'lucide-react';
import { updateEstablishmentHours } from '@/modules/establishments/actions';
import { Button } from '@/components/ui/button';

interface EditHoursModalProps {
    establishment: any;
}

const parseTimeString = (time: string) => {
    if (!time || time === 'Fermé') return { openTime: '08:00', closeTime: '17:00' };
    const cleanTime = time.replace(/h/gu, ':'); // "8:00 - 17:00"
    const parts = cleanTime.split('-').map(p => p.trim());
    
    const formatParts = (str: string) => {
        if (!str) return '00:00';
        const [h, m] = str.split(':');
        const hh = (h || '0').padStart(2, '0');
        const mm = (m || '00').padStart(2, '0');
        return `${hh}:${mm}`;
    };

    if (parts.length === 2) {
        return { openTime: formatParts(parts[0]), closeTime: formatParts(parts[1]) };
    }
    return { openTime: '08:00', closeTime: '17:00' };
};

export function EditHoursModal({ establishment }: EditHoursModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState('');

    const defaultHours = [
        { day: 'Samedi', time: '09:00 - 14:00', closed: false },
        { day: 'Dimanche', time: '08:00 - 17:00', closed: false },
        { day: 'Lundi', time: '08:00 - 17:00', closed: false },
        { day: 'Mardi', time: '08:00 - 17:00', closed: false },
        { day: 'Mercredi', time: '08:00 - 17:00', closed: false },
        { day: 'Jeudi', time: '08:00 - 17:00', closed: false },
        { day: 'Vendredi', time: 'Fermé', closed: true },
    ];

    const initialHours = establishment?.working_hours || defaultHours;
    
    const [hours, setHours] = useState(() => initialHours.map((h: any) => {
        const { openTime, closeTime } = parseTimeString(h.time);
        return { ...h, openTime, closeTime };
    }));

    const handleOpenTimeChange = (index: number, newTime: string) => {
        const newHours = [...hours];
        newHours[index].openTime = newTime;
        setHours(newHours);
    };

    const handleCloseTimeChange = (index: number, newTime: string) => {
        const newHours = [...hours];
        newHours[index].closeTime = newTime;
        setHours(newHours);
    };

    const handleClosedChange = (index: number, closed: boolean) => {
        const newHours = [...hours];
        newHours[index].closed = closed;
        setHours(newHours);
    };

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsPending(true);
        setError('');

        const formattedHours = hours.map((h: any) => ({
            day: h.day,
            time: h.closed ? 'Fermé' : `${h.openTime} - ${h.closeTime}`,
            closed: h.closed
        }));

        try {
            const formData = new FormData();
            formData.append('working_hours', JSON.stringify(formattedHours));

            const result = await updateEstablishmentHours(formData);
            if (result?.error) {
                setError(result.error);
            } else {
                setIsOpen(false);
            }
        } catch (err: any) {
            setError(err.message || 'Erreur');
        } finally {
            setIsPending(false);
        }
    }

    return (
        <>
            <Button
                onClick={() => setIsOpen(true)}
                variant="outline"
                className="bg-gray-100 border-none hover:bg-gray-200 text-gray-700 font-bold px-4 py-2 gap-2 rounded-xl"
            >
                <Pencil className="w-4 h-4" />
                Modifier les horaires
            </Button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-[550px] overflow-hidden animate-in zoom-in-95 max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-primary" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Horaires d'ouverture</h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
                            <div className="flex-1 overflow-y-auto p-6 space-y-3">
                                {error && (
                                    <div className="p-3 mb-2 text-sm text-red-600 bg-red-50 rounded-lg font-medium border border-red-100">
                                        {error}
                                    </div>
                                )}

                                {hours.map((schedule: any, index: number) => (
                                    <div key={schedule.day} className={`flex items-center gap-4 p-3.5 rounded-xl border transition-colors ${schedule.closed ? 'bg-gray-50/80 border-gray-100 opacity-75' : 'bg-white border-gray-200 hover:border-primary/30 shadow-sm'}`}>
                                        <div className="w-24 font-bold text-gray-700 text-sm">{schedule.day}</div>
                                        
                                        <div className="flex-1 flex items-center gap-2">
                                            <input
                                                type="time"
                                                value={schedule.openTime}
                                                onChange={(e) => handleOpenTimeChange(index, e.target.value)}
                                                disabled={schedule.closed}
                                                className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary/50 text-sm font-medium text-gray-700 disabled:opacity-50 transition-all outline-none"
                                            />
                                            <span className="text-gray-400 text-sm font-medium">à</span>
                                            <input
                                                type="time"
                                                value={schedule.closeTime}
                                                onChange={(e) => handleCloseTimeChange(index, e.target.value)}
                                                disabled={schedule.closed}
                                                className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary/50 text-sm font-medium text-gray-700 disabled:opacity-50 transition-all outline-none"
                                            />
                                        </div>

                                        <label className="flex items-center gap-2.5 text-sm font-medium text-gray-600 cursor-pointer ml-2">
                                            <input
                                                type="checkbox"
                                                checked={schedule.closed}
                                                onChange={(e) => handleClosedChange(index, e.target.checked)}
                                                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary focus:ring-offset-0 transition-colors"
                                            />
                                            Fermé
                                        </label>
                                    </div>
                                ))}
                            </div>

                            <div className="p-5 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50 flex-shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="px-6 py-2.5 gap-2 rounded-xl text-sm bg-primary text-white font-bold shadow-sm hover:shadow hover:-translate-y-0.5 hover:bg-primary/95 flex items-center disabled:opacity-50 disabled:hover:translate-y-0 transition-all"
                                >
                                    {isPending && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
                                    Enregistrer les horaires
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

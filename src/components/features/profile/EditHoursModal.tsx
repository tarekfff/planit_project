'use client';

import { useState } from 'react';
import { Pencil, Loader2, X } from 'lucide-react';
import { updateEstablishmentHours } from '@/modules/establishments/actions';
import { Button } from '@/components/ui/button';

interface EditHoursModalProps {
    establishment: any;
}

export function EditHoursModal({ establishment }: EditHoursModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState('');

    const defaultHours = [
        { day: 'Samedi', time: '9h00 - 14h00', closed: false },
        { day: 'Dimanche', time: '8h00 - 17h00', closed: false },
        { day: 'Lundi', time: '8h00 - 17h00', closed: false },
        { day: 'Mardi', time: '8h00 - 17h00', closed: false },
        { day: 'Mercredi', time: '8h00 - 17h00', closed: false },
        { day: 'Jeudi', time: '8h00 - 17h00', closed: false },
        { day: 'Vendredi', time: 'Fermé', closed: true },
    ];

    const initialHours = establishment?.working_hours || defaultHours;
    const [hours, setHours] = useState(initialHours);

    const handleTimeChange = (index: number, newTime: string) => {
        const newHours = [...hours];
        newHours[index].time = newTime;
        setHours(newHours);
    };

    const handleClosedChange = (index: number, closed: boolean) => {
        const newHours = [...hours];
        newHours[index].closed = closed;
        if (closed) newHours[index].time = 'Fermé';
        setHours(newHours);
    };

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsPending(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('working_hours', JSON.stringify(hours));

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
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
                            <h2 className="text-xl font-bold text-gray-900">Horaires d'ouverture</h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                {error && (
                                    <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
                                        {error}
                                    </div>
                                )}

                                {hours.map((schedule: any, index: number) => (
                                    <div key={schedule.day} className="flex items-center gap-4 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                                        <div className="w-24 font-bold text-gray-700 text-sm">{schedule.day}</div>
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                value={schedule.time}
                                                onChange={(e) => handleTimeChange(index, e.target.value)}
                                                disabled={schedule.closed}
                                                placeholder="ex: 8h00 - 17h00"
                                                className="w-full px-3 py-1.5 rounded-lg border focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                                            />
                                        </div>
                                        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={schedule.closed}
                                                onChange={(e) => handleClosedChange(index, e.target.checked)}
                                                className="rounded border-gray-300 text-primary focus:ring-primary"
                                            />
                                            Fermé
                                        </label>
                                    </div>
                                ))}
                            </div>

                            <div className="p-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50/50 flex-shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="px-6 py-2.5 gap-2 rounded-xl text-sm bg-primary text-white font-medium hover:bg-primary/90 flex items-center disabled:opacity-50"
                                >
                                    {isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                                    Enregistrer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

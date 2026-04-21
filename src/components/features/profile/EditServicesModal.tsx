'use client';

import { useState } from 'react';
import { Pencil, Loader2, X, Plus, Trash2 } from 'lucide-react';
import { addService, deleteService } from '@/modules/establishments/actions';
import { Button } from '@/components/ui/button';

interface EditServicesModalProps {
    services: any[];
}

export function EditServicesModal({ services }: EditServicesModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState('');

    async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsPending(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        try {
            const result = await addService(formData);
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

    async function handleDelete(id: string) {
        setIsPending(true);
        setError('');
        try {
            const result = await deleteService(id);
            if (result?.error) setError(result.error);
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
                Modifier les services
            </Button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
                            <h2 className="text-xl font-bold text-gray-900">Gérer les services</h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                            {error && (
                                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
                                    {error}
                                </div>
                            )}

                            {/* Add New Service Form */}
                            <form onSubmit={handleAdd} className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100 space-y-4">
                                <h3 className="font-bold text-gray-800">Ajouter un service</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-1.5 md:col-span-2">
                                        <label className="text-xs font-bold text-gray-600">Nom du service</label>
                                        <input
                                            name="name"
                                            required
                                            placeholder="Ex: Consultation..."
                                            className="w-full px-3 py-2 rounded-xl border focus:ring-2 focus:ring-primary/20 font-medium text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-600">Durée (min)</label>
                                        <input
                                            name="duration_minutes"
                                            type="number"
                                            required
                                            min="5"
                                            defaultValue="30"
                                            className="w-full px-3 py-2 rounded-xl border focus:ring-2 focus:ring-primary/20 font-medium text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <Button type="submit" disabled={isPending} className="bg-primary text-white rounded-xl gap-2 font-bold px-5">
                                        <Plus className="w-4 h-4" />
                                        Ajouter
                                    </Button>
                                </div>
                            </form>

                            {/* Existing Services List */}
                            <div className="space-y-3">
                                <h3 className="font-bold text-gray-800">Services actuels</h3>
                                {services?.length === 0 ? (
                                    <p className="text-sm text-gray-500">Aucun service enregistré.</p>
                                ) : (
                                    services?.map(service => (
                                        <div key={service.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-gray-200 transition-all">
                                            <div>
                                                <div className="font-bold text-gray-900">{service.name}</div>
                                                <div className="text-xs text-gray-500 font-medium mt-0.5">{service.duration_minutes} minutes</div>
                                            </div>
                                            <button
                                                onClick={() => handleDelete(service.id)}
                                                disabled={isPending}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                title="Supprimer ce service"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </>
    );
}

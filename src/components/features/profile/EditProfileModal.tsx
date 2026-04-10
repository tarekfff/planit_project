'use client';

import { useState } from 'react';
import { Pencil, Loader2, X } from 'lucide-react';
import { updateEstablishmentProfile } from '@/modules/establishments/actions';
import { Button } from '@/components/ui/button';

interface EditProfileModalProps {
    establishment: any;
}

export function EditProfileModal({ establishment }: EditProfileModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsPending(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        console.log("Submitting formData:", Object.fromEntries(formData));

        try {
            const result = await updateEstablishmentProfile(formData);
            console.log("Action result:", result);

            if (result?.error) {
                setError(result.error);
            } else {
                setIsOpen(false);
            }
        } catch (err: any) {
            console.error("Action error:", err);
            setError(err.message || 'Error executing action');
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
                Modifier le profil
            </Button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">Modifier le profil</h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {error && (
                                <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 rounded-lg">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-gray-700">Nom de l'établissement</label>
                                <input
                                    name="name"
                                    defaultValue={establishment?.name}
                                    required
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-gray-700">Catégorie / Spécialité</label>
                                <input
                                    name="category"
                                    defaultValue={establishment?.category}
                                    placeholder="Ex: Clinique Dentaire, Salon de beauté..."
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-gray-700">Description</label>
                                <textarea
                                    name="description"
                                    defaultValue={establishment?.description}
                                    rows={4}
                                    placeholder="Décrivez votre établissement..."
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium resize-y"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-gray-700">Adresse</label>
                                <input
                                    name="address"
                                    defaultValue={establishment?.address}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-gray-700">Téléphone</label>
                                <input
                                    name="phone"
                                    defaultValue={establishment?.phone}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-gray-700">Email de contact</label>
                                <input
                                    name="contact_email"
                                    type="email"
                                    defaultValue={establishment?.contact_email}
                                    placeholder="Ex: contact@clinique.com"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                />
                            </div>

                            <div className="pt-4 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="px-6 py-2.5 gap-2 rounded-xl shadow-sm text-sm bg-primary text-white font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    {isPending ? (
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    ) : null}
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

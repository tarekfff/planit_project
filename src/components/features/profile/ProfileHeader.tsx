import { EditProfileModal } from "./EditProfileModal";
import { Building2 } from "lucide-react";

interface ProfileHeaderProps {
    establishment: any;
}

export function ProfileHeader({ establishment }: ProfileHeaderProps) {
    const bannerUrl = 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?q=80&w=2600&auto=format&fit=crop';

    return (
        <div className="bg-white border-b border-gray-100">
            {/* Banner Image */}
            <div className="h-64 w-full relative bg-gray-100 overflow-hidden">
                <img
                    src={bannerUrl}
                    alt="Establishment cover"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            </div>

            <div className="max-w-6xl mx-auto px-8 relative pb-8">
                <div className="flex flex-col md:flex-row items-end md:items-center justify-between gap-6 -mt-16 relative z-10">

                    {/* Avatar and Title */}
                    <div className="flex items-end gap-6">
                        <div className="w-40 h-40 rounded-full border-4 border-white bg-white shadow-xl overflow-hidden flex-shrink-0 flex items-center justify-center p-2">
                            {establishment?.logo_url ? (
                                <img src={establishment.logo_url} alt="Logo" className="w-full h-full object-contain" />
                            ) : (
                                <div className="w-full h-full bg-gray-50 flex items-center justify-center rounded-full">
                                    <Building2 className="w-12 h-12 text-gray-300" />
                                </div>
                            )}
                        </div>

                        <div className="pb-4 transform translate-y-3">
                            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                                {establishment?.name || 'Nom non défini'}
                            </h1>
                            <p className="text-sm font-medium text-gray-500 uppercase tracking-widest mt-1">
                                {establishment?.description || 'Établissement'}
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4 pb-4 w-full md:w-auto">
                        <EditProfileModal establishment={establishment} />
                        <div className="bg-green-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm whitespace-nowrap">
                            Clinique Ouverte
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

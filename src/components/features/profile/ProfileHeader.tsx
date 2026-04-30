import { EditProfileModal } from "./EditProfileModal";
import { Building2 } from "lucide-react";
import { ImageUploadTrigger } from "./ImageUploadTrigger";

interface ProfileHeaderProps {
    establishment: any;
}

export function ProfileHeader({ establishment }: ProfileHeaderProps) {
    const bannerUrl = establishment?.banner_url || 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?q=80&w=2600&auto=format&fit=crop';

    return (
        <div className="bg-white border-b border-gray-100">
            {/* Banner Image */}
            <div className="h-64 w-full relative bg-gray-100 overflow-hidden group">
                <img
                    src={bannerUrl}
                    alt="Establishment cover"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                
                {/* Banner Upload Trigger */}
                <ImageUploadTrigger 
                    type="banner" 
                    className="absolute bottom-6 right-8 z-20 opacity-0 group-hover:opacity-100 transition-opacity" 
                />
            </div>

            <div className="max-w-6xl mx-auto px-8 relative pb-8">
                <div className="flex flex-col md:flex-row items-end md:items-center justify-between gap-6 -mt-16 relative z-10">

                    {/* Avatar and Title */}
                    <div className="flex items-end gap-6">
                        <div className="w-44 h-44 rounded-full border-[6px] border-white bg-white shadow-2xl overflow-hidden flex-shrink-0 flex items-center justify-center relative group/logo">
                            {establishment?.logo_url ? (
                                <img src={establishment.logo_url} alt="Logo" className="w-full h-full object-cover transition-transform duration-500 group-hover/logo:scale-110" />
                            ) : (
                                <div className="w-full h-full bg-gray-50 flex items-center justify-center rounded-full">
                                    <Building2 className="w-14 h-14 text-gray-300" />
                                </div>
                            )}
                            
                            {/* Logo Upload Trigger */}
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover/logo:opacity-100 transition-all duration-300 flex items-center justify-center">
                                <ImageUploadTrigger type="logo" />
                            </div>
                        </div>

                        <div className="pb-6 transform translate-y-2">
                            <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                                {establishment?.name || 'Nom non défini'}
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="px-2.5 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                                    {establishment?.category || 'Établissement'}
                                </span>
                                <p className="text-sm font-medium text-gray-500">
                                    {establishment?.wilaya || 'Algérie'}
                                </p>
                            </div>
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

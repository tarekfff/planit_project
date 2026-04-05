import { Star } from "lucide-react";

interface ProfileMainInfoProps {
    establishment: any;
    userEmail: string | undefined;
}

export function ProfileMainInfo({ establishment, userEmail }: ProfileMainInfoProps) {
    const mapPlaceholderUrl = 'https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1000&auto=format&fit=crop';

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* Left side: Infos & Description */}
            <div className="space-y-8">
                {/* Infos Principales */}
                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Infos Principales</h2>
                    <ul className="space-y-3 text-sm">
                        <li className="flex items-start gap-2">
                            <span className="font-bold text-gray-900 min-w-[90px]">Nom :</span>
                            <span className="text-gray-600">{establishment?.name || 'Non défini'}</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="font-bold text-gray-900 min-w-[90px]">Catégorie :</span>
                            <span className="text-gray-600">{establishment?.description || 'Non défini'}</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="font-bold text-gray-900 min-w-[90px]">Adresse :</span>
                            <span className="text-gray-600">{establishment?.address || 'Adresse non renseignée'}</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="font-bold text-gray-900 min-w-[90px]">Téléphone :</span>
                            <span className="text-gray-600">{establishment?.phone || 'Non renseigné'}</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="font-bold text-gray-900 min-w-[90px]">Email :</span>
                            <span className="text-gray-600">{userEmail || 'Non renseigné'}</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 min-w-[90px]">Note :</span>
                            <div className="flex items-center gap-1.5 text-gray-600">
                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                <span className="font-bold">4.8</span>
                                <span className="text-gray-400">/ 5 (124 avis)</span>
                            </div>
                        </li>
                    </ul>
                </div>

                {/* Description */}
                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
                    <div className="text-sm text-gray-600 leading-relaxed space-y-4">
                        <p>
                            Bienvenue chez {establishment?.name || "nous"}, votre référence de confiance pour vos besoins de santé.
                            Notre équipe de professionnels qualifiés vous accueille dans un cadre moderne et confortable
                            pour vous offrir des soins de qualité adaptés à vos besoins.
                        </p>
                        <p>
                            Votre satisfaction est notre priorité. Contactez-nous pour plus d'informations ou pour prendre rendez-vous !
                        </p>
                    </div>
                </div>
            </div>

            {/* Right side: Map Placeholder */}
            <div>
                {/* Empty h2 just for alignment to match 'Infos Principales' vertical flow if needed, or omit it. Let's omit to let the map align to the top block. */}
                <div className="w-full h-64 md:h-80 bg-gray-100 rounded-3xl overflow-hidden mt-12 lg:mt-0 shadow-sm border border-gray-100 relative group">
                    <img src={mapPlaceholderUrl} alt="Map Location" className="w-full h-full object-cover mix-blend-luminosity opacity-80 group-hover:opacity-100 transition-opacity" />
                    {/* A fake pin */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center animate-bounce shadow-lg ring-4 ring-white">
                            <div className="w-3 h-3 bg-white rounded-full"></div>
                        </div>
                        <div className="w-4 h-1.5 bg-black/20 blur-sm rounded-[100%] mt-1"></div>
                    </div>
                </div>
            </div>

        </div>
    );
}

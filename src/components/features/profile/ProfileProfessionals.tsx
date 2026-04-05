import { Star } from "lucide-react";

interface ProfileProfessionalsProps {
    professionals: any[];
}

export function ProfileProfessionals({ professionals }: ProfileProfessionalsProps) {
    // Fallback data if none
    const displayPros = professionals?.length > 0 ? professionals : [
        { id: 1, full_name: 'Dr. Sofia Benali', specialty: 'Dentisterie Générale', experience: 8, rating: 4.9, avatarUrl: 'https://images.unsplash.com/photo-1594824436951-7f12bc41753a?q=80&w=256&auto=format&fit=crop' },
        { id: 2, full_name: 'Dr. Amine Taleb', specialty: 'Orthodontie', experience: 5, rating: 4.7, avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=256&auto=format&fit=crop' },
        { id: 3, full_name: 'Dr. Sarah Kaddour', specialty: 'Dentisterie Esthétique', experience: 12, rating: 5.0, avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=256&auto=format&fit=crop' },
    ];

    return (
        <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Nos Professionnels</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayPros.map((pro) => (
                    <div
                        key={pro.id}
                        className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col gap-4"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-gray-100">
                                {pro.avatarUrl || pro.avatar_url ? (
                                    <img src={pro.avatarUrl || pro.avatar_url} alt={pro.full_name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center font-bold text-gray-400">
                                        {pro.full_name.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-sm">{pro.full_name}</h3>
                                <p className="text-xs font-semibold text-primary">{pro.specialty || 'Spécialiste'}</p>
                            </div>
                        </div>

                        <div className="space-y-1.5 mt-2">
                            <div className="flex items-center justify-between text-xs text-gray-600">
                                <span className="font-semibold text-gray-500">Expérience :</span>
                                <span className="font-bold text-gray-900">{pro.experience || 0} ans</span>
                            </div>
                            <div className="flex items-center gap-1 mt-1 pt-2 border-t border-gray-50">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-3.5 h-3.5 ${i < Math.floor(pro.rating || 5) ? "fill-yellow-400 text-yellow-400" : "fill-gray-100 text-gray-200"}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

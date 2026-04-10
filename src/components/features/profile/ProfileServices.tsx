import { EditServicesModal } from "./EditServicesModal";

interface ProfileServicesProps {
    services: any[];
}

export function ProfileServices({ services }: ProfileServicesProps) {
    // Fallback data if none provided by db
    const displayServices = services?.length > 0 ? services : [
        { id: 1, name: 'Consultation Générale', duration_minutes: 30, color: 'bg-cyan-100/80', textColor: 'text-cyan-600' },
        { id: 2, name: 'Détartrage & Nettoyage', duration_minutes: 45, color: 'bg-orange-100/80', textColor: 'text-orange-600' },
        { id: 3, name: 'Extraction Dentaire', duration_minutes: 30, color: 'bg-yellow-100/80', textColor: 'text-yellow-600' },
        { id: 4, name: 'Traitement de Canal', duration_minutes: 60, color: 'bg-purple-100/80', textColor: 'text-purple-600' },
    ];

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Nos Services</h2>
                <EditServicesModal services={services} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {displayServices.map((service, index) => {
                    // Cyclic fallback colors if real data comes from DB without color fields
                    const defaultBg = ['bg-cyan-100/80', 'bg-orange-100/80', 'bg-yellow-100/80', 'bg-purple-100/80'][index % 4];
                    const defaultText = ['text-cyan-600', 'text-orange-600', 'text-yellow-600', 'text-purple-600'][index % 4];

                    return (
                        <div
                            key={service.id}
                            className={`${service.color || defaultBg} rounded-3xl p-6 flex flex-col justify-between aspect-square transition-transform hover:-translate-y-1 hover:shadow-md`}
                        >
                            <h3 className="text-base font-bold text-gray-900 leading-snug">
                                {service.name}
                            </h3>
                            <div className={`mt-4 text-sm font-bold ${service.textColor || defaultText}`}>
                                {service.duration_minutes} min
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

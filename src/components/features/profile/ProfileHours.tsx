import { Clock, Calendar } from "lucide-react";
import { EditHoursModal } from "./EditHoursModal";

interface ProfileHoursProps {
    establishment: any;
}

export function ProfileHours({ establishment }: ProfileHoursProps) {
    const defaultHours = [
        { day: 'Samedi', time: '9h00 - 14h00', closed: false },
        { day: 'Dimanche', time: '8h00 - 17h00', closed: false },
        { day: 'Lundi', time: '8h00 - 17h00', closed: false },
        { day: 'Mardi', time: '8h00 - 12h00', closed: false },
        { day: 'Mercredi', time: '8h00 - 17h00', closed: false },
        { day: 'Jeudi', time: '8h00 - 17h00', closed: false },
        { day: 'Vendredi', time: 'Fermé', closed: true },
    ];

    const hours = establishment?.working_hours || defaultHours;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Horaires d'Ouverture</h2>
                <EditHoursModal establishment={establishment} />
            </div>

            <div className="bg-cyan-50/70 border border-cyan-100 rounded-3xl p-6 relative overflow-hidden">
                <div className="absolute top-6 right-6 flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-cyan-100 px-4 py-2 rounded-xl text-xs font-bold text-gray-700 shadow-sm">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    Ouvert
                </div>

                <div className="mt-12 flex flex-wrap xl:flex-nowrap gap-3">
                    {hours.map((schedule: any) => (
                        <div
                            key={schedule.day}
                            className={`flex flex-col items-center justify-center p-4 rounded-2xl flex-1 min-w-[100px] border shadow-sm transition-all ${schedule.closed
                                ? 'bg-gray-50/50 border-gray-100 opacity-70'
                                : 'bg-white border-white hover:border-cyan-200'
                                }`}
                        >
                            <Calendar className={`w-4 h-4 mb-2 ${schedule.closed ? 'text-gray-400' : 'text-gray-600'}`} />
                            <span className="text-[11px] font-bold text-gray-900 mb-1">{schedule.day}</span>
                            <span className={`text-[10px] whitespace-nowrap ${schedule.closed ? 'text-gray-500 font-semibold' : 'text-primary font-bold'}`}>
                                {schedule.time}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

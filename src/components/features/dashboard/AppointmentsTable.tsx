'use client';

import { CheckCircle2, MoreHorizontal, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Appointment {
    id: string;
    time: string;
    professional: string;
    client: string;
    service: string;
    status: 'confirmed' | 'pending' | 'cancelled';
    date?: string;
}

interface AppointmentsTableProps {
    title: string;
    appointments: Appointment[];
    showDate?: boolean;
}

export function AppointmentsTable({ title, appointments, showDate = false }: AppointmentsTableProps) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between border-b border-gray-50">
                <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                {showDate && (
                    <div className="w-64 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search"
                            className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-gray-100 bg-gray-50 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-gray-300"
                        />
                    </div>
                )}
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50/50 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            {showDate && <th className="px-6 py-3">Date</th>}
                            <th className="px-6 py-3">Heure</th>
                            <th className="px-6 py-3">Professionnel</th>
                            <th className="px-6 py-3">Client</th>
                            <th className="px-6 py-3">Service</th>
                            <th className="px-6 py-3">Statut</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {appointments.map((apt) => (
                            <tr key={apt.id} className="hover:bg-gray-50/80 transition-colors group">
                                {showDate && <td className="px-6 py-4 text-sm font-medium text-gray-600">{apt.date}</td>}
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{apt.time}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{apt.professional}</td>
                                <td className="px-6 py-4 text-sm text-gray-900 font-medium">{apt.client}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{apt.service}</td>
                                <td className="px-6 py-4">
                                    <div className={cn(
                                        "inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-bold uppercase",
                                        apt.status === 'confirmed' ? "bg-green-50 text-green-600" :
                                            apt.status === 'pending' ? "bg-orange-50 text-orange-600" :
                                                "bg-red-50 text-red-600"
                                    )}>
                                        {apt.status === 'confirmed' && <CheckCircle2 className="w-3 h-3" />}
                                        {apt.status === 'confirmed' ? 'Confirmé' : apt.status === 'pending' ? 'En attente' : 'Annulé'}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {/* Filler rows for design consistency if few results */}
                        {Array.from({ length: Math.max(0, 3 - appointments.length) }).map((_, i) => (
                            <tr key={`empty-${i}`} className="h-14"><td colSpan={6}></td></tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination dummy */}
            <div className="px-6 py-3 border-t border-gray-50 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">1</div>
                <div className="w-8 h-8 rounded-lg hover:bg-gray-50 flex items-center justify-center text-xs font-bold text-gray-400 cursor-pointer">
                    <MoreHorizontal className="w-4 h-4" />
                </div>
            </div>
        </div>
    );
}

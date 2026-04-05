'use client';

import { Calendar, Users, CalendarCheck, Star, AlertTriangle, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
    label: string;
    value: string | number;
    icon: React.ElementType;
    iconBg: string;
    iconColor: string;
}

function StatCard({ label, value, icon: Icon, iconBg, iconColor }: StatCardProps) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="space-y-1">
                <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-tight leading-tight">{label}</p>
            </div>
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", iconBg)}>
                <Icon className={cn("w-6 h-6", iconColor)} />
            </div>
        </div>
    );
}

interface StatsCardsProps {
    metrics: {
        rdvToday: number;
        proCount: number;
        rdvWeek: number;
        satisfaction: number;
        pendingCount: number;
    };
}

export function StatsCards({ metrics }: StatsCardsProps) {
    return (
        <div className="space-y-6">
            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="RDV Aujourd'hui"
                    value={metrics.rdvToday}
                    icon={Calendar}
                    iconBg="bg-cyan-50"
                    iconColor="text-cyan-500"
                />
                <StatCard
                    label="Professionnels"
                    value={metrics.proCount}
                    icon={Users}
                    iconBg="bg-orange-50"
                    iconColor="text-orange-500"
                />
                <StatCard
                    label="RDV Cette Semaine"
                    value={metrics.rdvWeek}
                    icon={CalendarCheck}
                    iconBg="bg-purple-50"
                    iconColor="text-purple-500"
                />
                <StatCard
                    label="Satisfaction"
                    value={metrics.satisfaction}
                    icon={Star}
                    iconBg="bg-yellow-50"
                    iconColor="text-yellow-500"
                />
            </div>

            {/* Alert + Search Bar */}
            <div className="flex flex-col md:flex-row items-center gap-4">
                {metrics.pendingCount > 0 && (
                    <div className="flex-1 w-full bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                        <p className="text-sm font-bold text-gray-900">
                            ALERTE <span className="font-medium ml-2">{metrics.pendingCount} RDV en attente de confirmation</span>
                        </p>
                    </div>
                )}
                {metrics.pendingCount === 0 && (
                    <div className="flex-1 w-full bg-green-50 border border-green-100 rounded-xl px-4 py-3 flex items-center gap-3">
                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                        <p className="text-sm font-bold text-gray-900">
                            TOUT EST À JOUR <span className="font-medium ml-2 text-green-600">Aucun RDV en attente</span>
                        </p>
                    </div>
                )}

                <div className="w-full md:w-64 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search"
                        className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-100 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-gray-300"
                    />
                </div>
            </div>
        </div>
    );
}

function CheckCircleIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
    );
}

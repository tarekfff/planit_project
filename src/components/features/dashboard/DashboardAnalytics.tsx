'use client';

import { CheckCircle2, XCircle, Clock, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DashboardAnalyticsProps {
    serviceTrends: { label: string; percent: number }[];
    pendingItems: { id: string; pro: string; service: string; time: string }[];
    occupancyRates: { label: string; percent: number; color: string }[];
    cancellations: { client: string; time: string }[];
}

export function DashboardAnalytics({
    serviceTrends,
    pendingItems,
    occupancyRates,
    cancellations
}: DashboardAnalyticsProps) {
    return (
        <div className="space-y-6">
            {/* First Row: Services & Confirmations */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Services Progress Bars */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Services les plus demandés</h3>
                    <div className="space-y-4">
                        {serviceTrends.length > 0 ? serviceTrends.map((item, i) => (
                            <div key={item.label} className="space-y-1.5">
                                <div className="flex justify-between text-xs font-bold text-gray-700">
                                    <span>{item.label}</span>
                                    <span className="text-gray-400">{item.percent}%</span>
                                </div>
                                <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden">
                                    <div
                                        className={cn("h-full rounded-full transition-all duration-1000", 
                                            i === 0 ? "bg-purple-500" : i === 1 ? "bg-orange-400" : i === 2 ? "bg-cyan-400" : "bg-gray-300"
                                        )}
                                        style={{ width: `${item.percent}%` }}
                                    />
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-10 text-gray-400 text-sm">Aucune donnée disponible</div>
                        )}
                    </div>
                </div>

                {/* Pending Confirmations List */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">En attente confirmation</h3>
                    <div className="space-y-4">
                        {pendingItems.length > 0 ? pendingItems.map((item, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold bg-indigo-50 text-indigo-600")}>
                                    {item.pro.split(' ')[1]?.[0] || 'P'}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-gray-900">{item.pro} — <span className="text-gray-500 font-medium">{item.service}</span></p>
                                    <p className="text-xs text-gray-400">{item.time}</p>
                                </div>
                                <button className="text-xs font-bold text-primary hover:underline">Voir</button>
                            </div>
                        )) : (
                            <div className="text-center py-10 text-gray-400 text-sm">Tout est à jour !</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Second Row: Occupancy & Cancellations */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Occupancy Progress Bars */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Taux d&apos;occupation</h3>
                    <div className="space-y-4">
                        {occupancyRates.length > 0 ? occupancyRates.map((item) => (
                            <div key={item.label} className="space-y-1.5 focus-within:ring-2">
                                <div className="flex justify-between text-xs font-bold text-gray-700">
                                    <span>{item.label}</span>
                                    <span className="text-gray-400">{item.percent}%</span>
                                </div>
                                <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden text-right">
                                    <div
                                        className={cn("h-full rounded-full transition-all duration-1000", item.color)}
                                        style={{ width: `${item.percent}%` }}
                                    />
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-10 text-gray-400 text-sm">Aucun professionnel actif</div>
                        )}
                    </div>
                </div>

                {/* Daily Cancellations List */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Annulations du jour</h3>
                    <div className="space-y-4">
                        {cancellations.length > 0 ? cancellations.map((item, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                                    <XCircle className="w-5 h-5 text-red-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">{item.client} — <span className="text-red-500">{item.time}</span></p>
                                    <p className="text-xs text-gray-400">Annulé</p>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-10 text-gray-400 text-sm">Aucune annulation aujourd&apos;hui</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Third Row: Donut Charts (Visual placeholders) */}
            <div className="grid sm:grid-cols-3 gap-6">
                <DonutWidget title="RDV"
                    items={[
                        { label: 'RDV Confirmer', color: 'text-green-500', stroke: '#22c55e' },
                        { label: 'RDV Annuler', color: 'text-red-500', stroke: '#ef4444' }
                    ]}
                />
                <DonutWidget title="Heures"
                    items={Array.from({ length: 9 }).map((_, i) => ({ label: `${i + 1}`, color: 'text-gray-400', stroke: '#888' }))}
                    isFull={true}
                />
                <DonutWidget title="Jours"
                    items={[
                        { label: 'Dimanche', color: 'text-orange-500', stroke: '#f97316' },
                        { label: 'Lundi', color: 'text-purple-500', stroke: '#a855f7' },
                        { label: 'Mardi', color: 'text-red-500', stroke: '#ef4444' },
                        { label: 'Mercredi', color: 'text-green-500', stroke: '#22c55e' },
                        { label: 'Jeudi', color: 'text-yellow-500', stroke: '#eab308' },
                        { label: 'Samedi', color: 'text-blue-500', stroke: '#3b82f6' },
                    ]}
                />
            </div>
        </div>
    );
}

function DonutWidget({ title, items, isFull = false }: { title: string, items: any[], isFull?: boolean }) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
            <div className="relative w-32 h-32 mb-6">
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        className="text-gray-100"
                    />
                    {/* Mock segments */}
                    {items.map((item, i) => (
                        <circle
                            key={i}
                            cx="64"
                            cy="64"
                            r="56"
                            stroke={item.stroke}
                            strokeWidth="12"
                            fill="transparent"
                            strokeDasharray={isFull ? `${(1 / items.length) * 351.8} 351.8` : `${(0.4) * 351.8} 351.8`}
                            strokeDashoffset={isFull ? `${-(i / items.length) * 351.8}` : i === 0 ? '0' : '-140'}
                            className="transition-all duration-1000"
                        />
                    ))}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xs font-bold text-gray-500 uppercase">{title}</span>
                </div>
            </div>

            <div className="w-full space-y-1.5">
                {items.filter((_, i) => i < 5 || items.length < 8).map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-[10px] font-bold text-gray-700">
                        <div className={cn("w-2 h-2 rounded-full", item.color?.replace('text-', 'bg-') || 'bg-gray-400')} />
                        <span>{item.label}</span>
                    </div>
                ))}
                {items.length > 7 && <div className="text-[10px] text-gray-400 pl-4">...</div>}
            </div>
        </div>
    );
}

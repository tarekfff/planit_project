'use client';

import { Calendar as CalendarIcon } from 'lucide-react';
import Image from 'next/image';

interface DashboardHeaderProps {
    establishmentName?: string;
    avatarUrl?: string;
}

export function DashboardHeader({ establishmentName = 'Clinique Sophia', avatarUrl }: DashboardHeaderProps) {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };

    // French locale formatting
    const formattedDate = today.toLocaleDateString('fr-FR', options);
    // Capitalize first letter
    const displayDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

    return (
        <header className="flex items-center justify-between px-8 py-4 bg-primary text-white shadow-sm">
            <div className="flex flex-col">
                <h1 className="text-lg font-bold">
                    Salut, <span className="opacity-90">{establishmentName}</span>
                </h1>
            </div>

            <div className="flex items-center gap-6">
                <div className="text-right">
                    <p className="text-sm font-medium opacity-90">{displayDate}</p>
                </div>

                <div className="w-10 h-10 rounded-full border-2 border-white/20 overflow-hidden bg-white/10 flex items-center justify-center">
                    {avatarUrl ? (
                        <Image
                            src={avatarUrl}
                            alt="Profile"
                            width={40}
                            height={40}
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                            <span className="text-xs font-bold text-white">CS</span>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

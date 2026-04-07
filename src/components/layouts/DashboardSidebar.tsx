'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home,
    LayoutDashboard,
    User,
    Briefcase,
    Calendar,
    Bell,
    UserCircle,
    LogOut,
    ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/constants/routes';
import { Button } from '@/components/ui/button';
import { logout } from '@/modules/auth/actions';

const SIDEBAR_ITEMS = [
    { icon: Home, label: 'Accueil', href: '/dashboard/manager/home' }, // Assuming a home or root
    { icon: LayoutDashboard, label: 'Tableau de bord', href: ROUTES.dashboard.manager },
    { icon: User, label: 'Mon Profil', href: '/dashboard/manager/profile' },
    { icon: Briefcase, label: 'Mes Professionnels & Services', href: ROUTES.dashboard.professionals },
    { icon: Calendar, label: 'Calendrier Global', href: '/dashboard/manager/calendar' },
    { icon: Bell, label: 'Notifications', href: '/dashboard/manager/notifications' },
];

interface DashboardSidebarProps {
    establishmentName?: string;
    category?: string;
}

export function DashboardSidebar({ establishmentName = 'Planit', category = 'Établissement' }: DashboardSidebarProps) {
    const pathname = usePathname();

    return (
        <aside className="w-64 h-screen bg-white border-r border-gray-100 flex flex-col sticky top-0 overflow-y-auto">
            {/* Logo Section */}
            <div className="p-6 mb-2">
                <Link href="/" className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-1.5">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">
                            <span className="text-primary">P</span>lanit
                        </span>
                    </div>
                    <div className="mt-4 text-center">
                        <h3 className="text-sm font-bold text-gray-900">{establishmentName}</h3>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">{category}</p>
                    </div>
                </Link>
            </div>

            {/* Navigation section */}
            <nav className="flex-1 px-4 space-y-1">
                {SIDEBAR_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                                isActive
                                    ? "bg-gray-100 text-gray-900 shadow-sm"
                                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                            )}
                        >
                            <div className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                                isActive ? "bg-white text-primary shadow-sm" : "bg-transparent text-gray-400 group-hover:text-gray-600"
                            )}>
                                <Icon className="w-4.5 h-4.5" />
                            </div>
                            <span className="flex-1 min-w-0 truncate">{item.label}</span>
                            {isActive && <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer / Account section */}
            <div className="p-4 mt-auto border-t border-gray-50 space-y-1">
                <Link
                    href="/dashboard/manager/account"
                    className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                        pathname === "/dashboard/manager/account"
                            ? "bg-gray-100 text-gray-900"
                            : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                    )}
                >
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                        <UserCircle className="w-4.5 h-4.5" />
                    </div>
                    <span>Mon Compte</span>
                </Link>
                <form action={logout}>
                    <button
                        type="submit"
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all text-left"
                    >
                        <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-400">
                            <LogOut className="w-4.5 h-4.5" />
                        </div>
                        <span>Déconnexion</span>
                    </button>
                </form>
            </div>
        </aside>
    );
}

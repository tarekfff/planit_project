'use client';

import Link from 'next/link';
import Image from 'next/image';
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
    ChevronRight,
    Search,
    CalendarPlus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/constants/routes';
import { logout } from '@/modules/auth/actions';

const SIDEBAR_CONFIG = {
    client: [
        { icon: Home, label: 'Home', href: '/dashboard/client' },
        { icon: Search, label: 'Search', href: '/search' },
        { icon: Calendar, label: 'My Appointments', href: '/dashboard/client/appointments' },
        { icon: Bell, label: 'Notifications', href: '/dashboard/client/notifications' },
    ],
    professional: [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard/professional' },
        { icon: Calendar, label: 'My Schedule', href: '/dashboard/professional/schedule' },
        { icon: Briefcase, label: 'Services & Hours', href: '/dashboard/professional/services' },
        { icon: CalendarPlus, label: 'Book Appointment', href: '/dashboard/professional/book' },
    ],
    manager: [
        { icon: Home, label: 'Home', href: '/dashboard/manager/home' },
        { icon: LayoutDashboard, label: 'Dashboard', href: ROUTES.dashboard.manager },
        { icon: User, label: 'My Profile', href: '/dashboard/manager/profile' },
        { icon: Briefcase, label: 'Staff & Services', href: ROUTES.dashboard.professionals },
        { icon: Calendar, label: 'Global Calendar', href: '/dashboard/manager/calendar' },
        { icon: Bell, label: 'Notifications', href: '/dashboard/manager/notifications' },
    ],
};

interface DashboardSidebarProps {
    role?: 'client' | 'professional' | 'manager' | 'admin' | string;
    establishmentName?: string;
    category?: string;
}

export function DashboardSidebar({ role = 'client', establishmentName = 'Planit', category = 'Établissement' }: DashboardSidebarProps) {
    const pathname = usePathname();
    const items = SIDEBAR_CONFIG[role as keyof typeof SIDEBAR_CONFIG] || SIDEBAR_CONFIG.client;

    const accountHref = 
      role === 'professional' ? '/dashboard/professional/account' :
      role === 'manager' ? '/dashboard/manager/account' :
      '/dashboard/client/account';

    return (
        <aside className="w-64 h-screen bg-gray-50/30 border-r border-gray-200 flex flex-col sticky top-0 overflow-y-auto">
            {/* Logo & Header Section */}
            <div className="pt-8 pb-6 px-6 border-b border-gray-200 bg-white">
                <Link href="/" className="flex flex-col mb-6">
                    {/* Replaced standard img with Next.js optimized Image */}
                    {/* Wrapper crops out transparent top/bottom/left/right padding via limited box & centering */}
                    <div className="h-[48px] w-[100px] flex items-center justify-center overflow-hidden mb-4 -ml-1">
                        <Image 
                          src="/image.png" 
                          alt="Planit Logo" 
                          width={133}
                          height={133}
                          priority
                          className="min-w-[120px] max-w-[120px] object-cover" 
                        />
                    </div>
                    
                    <div className="text-left">
                        <h3 className="text-base font-bold text-gray-900 leading-tight">
                            {role !== 'client' ? establishmentName : 'Portail Client'}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                            {role !== 'client' ? category : 'Gestion de vos rendez-vous'}
                        </p>
                    </div>
                </Link>
            </div>

            {/* Navigation section */}
            <nav className="flex-1 py-4 bg-white">
                {items.map((item) => {
                    const isBaseRoute = ['/dashboard/manager', '/dashboard/client', '/dashboard/professional'].includes(item.href);
                    const isActive = pathname === item.href || (!isBaseRoute && pathname.startsWith(item.href + '/'));
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-6 py-3 text-sm font-medium transition-all",
                                isActive
                                    ? "bg-gray-200/70 text-gray-900 border-l-4 border-primary"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-l-4 border-transparent"
                            )}
                        >
                            <Icon className={cn(
                                "w-5 h-5",
                                isActive ? "text-gray-900" : "text-gray-500"
                            )} />
                            <span className="flex-1 truncate tracking-wide">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer / Account section with Distinct Line Separator */}
            <div className="bg-white pb-6 pt-4 border-t border-gray-200">
                <Link
                    href={accountHref}
                    className={cn(
                        "flex items-center gap-3 px-6 py-3 text-sm font-medium transition-all",
                        pathname === accountHref
                            ? "text-gray-900 bg-gray-50"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    )}
                >
                    <UserCircle className={cn("w-5 h-5", pathname === accountHref ? "text-gray-900" : "text-gray-500")} />
                    <span className="tracking-wide">My Account</span>
                </Link>
                <form action={logout}>
                    <button
                        type="submit"
                        className="w-full flex items-center gap-3 px-6 py-3 text-sm font-medium text-gray-600 transition-all text-left hover:text-red-600 hover:bg-red-50"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="tracking-wide">Logout</span>
                    </button>
                </form>
            </div>
        </aside>
    );
}

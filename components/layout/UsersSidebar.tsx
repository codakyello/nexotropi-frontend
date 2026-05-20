"use client"
import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    LogOut,
    Settings,
    Share2,
    MessageSquare,
    TrendingUp,
    FileText,
    Users
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import Link from 'next/link';
import Image from 'next/image';

interface MenuItem {
    icon: string | React.ComponentType<any>; // Changed to accept string (for img src) or component
    label: string;
    href: string;
}

interface MenuSection {
    section: 'main' | 'bottom';
    items: MenuItem[];
}

const UsersSidebar = () => {
    const [activeItem, setActiveItem] = useState('Dashboard');
    const router = useRouter();
    const pathname = usePathname();

    const menuItems: MenuSection[] = React.useMemo(() => [
        {
            section: 'main',
            items: [
                { icon: LayoutDashboard, label: 'Dashboard', href: '/user/dashboard' },
                { icon: Share2, label: 'Ecosystem', href: '/user/ecosystem' },
                { icon: Users, label: 'Suppliers', href: '/user/ecosystem/suppliers' },
                { icon: MessageSquare, label: 'Negotiation', href: '/user/negotiation' },
                { icon: TrendingUp, label: 'Analytics', href: '/user/analytics' },
                { icon: FileText, label: 'Audit Trail', href: '/user/audit' },
            ]
        },
        {
            section: 'bottom',
            items: [
                { icon: Settings, label: 'Settings', href: '/user/settings' },
            ]
        }
    ], []);

    // Sync activeItem with current pathname
    useEffect(() => {
        const currentItem = menuItems
            .flatMap(section => section.items)
            .find(item => item.href === pathname);

        if (currentItem) {
            setActiveItem(currentItem.label);
        }
    }, [pathname, menuItems]);

    const handleMenuItemClick = (item: MenuItem): void => {
        setActiveItem(item.label);
        router.push(item.href);
    };

    const handleLogoutClick = (): void => {
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        router.push('/auth/sign-in');
    };

    // Helper function to render icons
    const renderIcon = (icon: string | React.ComponentType<any>, isActive: boolean) => {
        if (typeof icon === 'string') {
            return (
                <Image
                    src={icon}
                    alt="icon"
                    width={20}
                    height={20}
                    className={`mr-4 transition-all duration-300 ${isActive ? 'opacity-100 scale-110 drop-shadow-[0_0_8px_var(--color-primary)]' : 'opacity-60 invert dark:invert-0'}`}
                />
            );
        } else {
            const IconComponent = icon;
            return (
                <IconComponent
                    className={`h-5 cursor-pointer w-5 mr-4 transition-all duration-300 ${isActive ? 'text-primary scale-110 drop-shadow-[0_0_8px_var(--color-primary)]' : 'text-muted-foreground'}`}
                />
            );
        }
    };

    return (
        <div className="w-64 bg-background/60 backdrop-blur-xl border-r border-border/40 h-screen flex flex-col font-sans transition-all duration-300 relative z-40">
            {/* Header */}
            <div className="p-8 mt-2">
                <Link href="/" className="hidden sm:flex items-center space-x-2">
                    <Image src="/nexotropi.png" width={200} height={40} alt="logo" className="drop-shadow-sm" />
                </Link>
            </div>

            {/* Navigation Menu */}
            <div className="flex-1 py-4">
                <nav className="px-4">
                    <div className="space-y-1.5">
                        {menuItems[0].items.map((item: MenuItem, itemIndex: number) => {
                            const isActive = pathname === item.href || pathname.startsWith(item.href + '/') || activeItem === item.label;

                            return (
                                <button
                                    key={itemIndex}
                                    type="button"
                                    onClick={() => handleMenuItemClick(item)}
                                    className={`group flex cursor-pointer items-center w-full px-4 py-3 text-[14px] font-medium rounded-xl transition-all duration-300 text-left border 
                                        ${isActive
                                        ? 'bg-primary/10 text-primary border-primary/20 shadow-[inset_0_0_20px_0_var(--color-primary)]/5'
                                        : 'text-muted-foreground hover:bg-accent/40 border-transparent hover:border-border/50 hover:text-foreground'
                                        }`}
                                >
                                    {renderIcon(item.icon, isActive)}
                                    <span className="tracking-wide">{item.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </nav>
            </div>

            {/* Bottom Menu Items */}
            <div className="px-4 pb-8 space-y-1.5">
                {menuItems[1].items.map((item: MenuItem, itemIndex: number) => {
                    const isActive = pathname === item.href || activeItem === item.label;

                    return (
                        <button
                            key={itemIndex}
                            type="button"
                            onClick={() => handleMenuItemClick(item)}
                            className={`group flex cursor-pointer items-center w-full px-4 py-3 text-[14px] font-medium rounded-xl transition-all duration-300 text-left border 
                                ${isActive
                                ? 'bg-primary/10 text-primary border-primary/20 shadow-[inset_0_0_20px_0_var(--color-primary)]/5'
                                : 'text-muted-foreground hover:bg-accent/40 border-transparent hover:border-border/50 hover:text-foreground'
                                }`}
                        >
                            {renderIcon(item.icon, isActive)}
                            <span className="tracking-wide">{item.label}</span>
                        </button>
                    );
                })}

                {/* Logout Button */}
                <button
                    onClick={handleLogoutClick}
                    className="group flex items-center w-full px-4 py-3 text-[14px] font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 border border-transparent rounded-xl transition-all duration-300"
                >
                    <LogOut className="h-5 w-5 mr-4 transition-transform group-hover:scale-110" />
                    <span className="tracking-wide">Logout</span>
                </button>
            </div>
        </div>
    );
};

export default UsersSidebar;
"use client"
import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    LogOut,
    Settings,
    Share2,
    MessageSquare,
    TrendingUp,
    FileText
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

const AdminSidebar = () => {
    const [activeItem, setActiveItem] = useState('Dashboard');
    const router = useRouter();
    const pathname = usePathname();

    const menuItems: MenuSection[] = [
        {
            section: 'main',
            items: [
                { icon: '/dashboard.svg', label: 'Dashboard', href: '/admin/dashboard' },
                { icon: '/menu.svg', label: 'Content Management', href: '/admin/content-management' },
                { icon: '/persons.svg', label: 'Users', href: '/admin/users' },
                { icon: '/roles.svg', label: 'Roles & Permisssions', href: '/admin/permission' },
                { icon: '/lock.svg', label: 'Security Logs', href: '/admin/security' },
            ]
        },
        {
            section: 'bottom',
            items: [
                { icon: Settings, label: 'Settings', href: '/user/settings' },
            ]
        }
    ];

    // Sync activeItem with current pathname
    useEffect(() => {
        const currentItem = menuItems
            .flatMap(section => section.items)
            .find(item => item.href === pathname);

        if (currentItem) {
            setActiveItem(currentItem.label);
        }
    }, [pathname]);

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
            // It's an image path
            return (
                <img
                    src={icon}
                    alt="icon"
                    className={`h-5 w-5 mr-4 ${isActive ? 'text-[#1A4A7A]' : 'text-gray-500'}`}
                />
            );
        } else {
            // It's a React component (like Lucide icons)
            const IconComponent = icon;
            return (
                <IconComponent
                    className={`h-5 cursor-pointer w-5 mr-3 ${isActive ? 'text-[#1A4A7A]' : 'text-gray-500'}`}
                />
            );
        }
    };

    return (
        <div className="w-62 bg-white border-r border-gray-200 h-screen flex flex-col">
            {/* Header */}
            <div className="p-6 mt-4">
                <Link href="/" className="hidden sm:flex items-center space-x-2 text-white">
                    <Image src="/user.png" width={188} height={32} alt="logo" />
                </Link>
            </div>

            {/* Navigation Menu */}
            <div className="flex-1 py-8">
                <nav className="px-3">
                    {/* Main menu items */}
                    <div className="space-y-3">
                        {menuItems[0].items.map((item: MenuItem, itemIndex: number) => {
                            const isActive = pathname === item.href || activeItem === item.label;

                            return (
                                <button
                                    key={itemIndex}
                                    type="button"
                                    onClick={() => handleMenuItemClick(item)}
                                    className={`flex cursor-pointer items-center w-full px-4 py-3 text-base text-nowrap font-medium rounded-lg transition-all duration-200 text-left ${isActive
                                        ? 'bg-[#E8EDF2] text-[#1A4A7A] border-l-2 border-[#1A4A7A] rounded-lg'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
                                    {renderIcon(item.icon, isActive)}
                                    {item.label}
                                </button>
                            );
                        })}
                    </div>
                </nav>
            </div>

            {/* Bottom Menu Items */}
            <div className="px-6 pb-8 space-y-2">
                {menuItems[1].items.map((item: MenuItem, itemIndex: number) => {
                    const isActive = pathname === item.href || activeItem === item.label;

                    return (
                        <button
                            key={itemIndex}
                            type="button"
                            onClick={() => handleMenuItemClick(item)}
                            className={`flex items-center cursor-pointer w-full px-4 py-3 text-base font-medium rounded-lg transition-all duration-200 text-left ${isActive
                                ? 'bg-blue-50 text-[#1A4A7A]'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            {renderIcon(item.icon, isActive)}
                            {item.label}
                        </button>
                    );
                })}

                {/* Logout Button */}
                <button
                    onClick={handleLogoutClick}
                    className="flex items-center w-full px-4 py-3 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-all duration-200"
                >
                    <LogOut className="h-5 w-5 mr-4 text-gray-500" />
                    Logout
                </button>
            </div>
        </div>
    );
};

export default AdminSidebar;
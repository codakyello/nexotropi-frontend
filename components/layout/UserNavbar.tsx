"use client"
import React, { useState } from 'react';
import { Search, Bell, LogOut, User, ChevronDown, Loader2 } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useGetAdminInfo } from '@/services/requests/auth';

const AdminNavbar = () => {
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // Fetch admin info
    const { data: adminData, isLoading, isError } = useGetAdminInfo();

    const admin = adminData?.data;

    const handleLogout = async () => {
        setIsLoggingOut(true);

        try {
            // Clear all auth-related cookies
            Cookies.remove('access_token');
            Cookies.remove('refresh_token');
            Cookies.remove('access_token'); // if you use this separately

            toast.success('Logged out successfully');

            // Redirect to admin login
            router.push('/auth/admin/sign-in');
        } catch (error) {
            toast.error('Failed to logout');
            console.error('Logout error:', error);
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <nav className="w-full bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between max-w-full">
                {/* Search Bar */}
                <div className="flex-1 max-w-2xl">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Type to search"
                            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1A4A7A] focus:border-transparent transition-all duration-200"
                        />
                    </div>
                </div>

                {/* Right Side - Notification and Profile */}
                <div className="flex items-center space-x-6 ml-8">
                    {/* Notification Bell */}
                    <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200">
                        <Bell className="h-5 w-5" />
                        {/* Notification dot */}
                        <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                    </button>

                    {/* Admin Profile Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center space-x-3 focus:outline-none hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors duration-200">
                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#1A4A7A] flex items-center justify-center">
                                    {isLoading ? (
                                        <Loader2 className="h-5 w-5 text-white animate-spin" />
                                    ) : admin?.profile_image ? (
                                        <img
                                            src={admin.profile_image}
                                            alt="Admin Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <User className="h-5 w-5 text-white" />
                                    )}
                                </div>
                                <div className="hidden md:block text-left">
                                    <p className="text-sm font-semibold text-gray-900">
                                        {isLoading ? 'Loading...' : admin?.name || admin?.email?.split('@')[0] || 'Admin'}
                                    </p>
                                    <p className="text-xs text-gray-500">Administrator</p>
                                </div>
                                <ChevronDown className="h-4 w-4 text-gray-400" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium text-gray-900">
                                        {admin?.name || 'Admin User'}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {admin?.email || 'admin@example.com'}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => router.push('/admin/settings')}
                                className="cursor-pointer"
                            >
                                <User className="mr-2 h-4 w-4" />
                                <span>Profile</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={handleLogout}
                                disabled={isLoggingOut}
                                className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                            >
                                {isLoggingOut ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        <span>Logging out...</span>
                                    </>
                                ) : (
                                    <>
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Logout</span>
                                    </>
                                )}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </nav>
    );
};

export default AdminNavbar;
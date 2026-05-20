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
import { useGetUserInfo } from '@/services/requests/auth';


const UserNavbar = () => {
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // Fetch user info
    const { data: userData, isLoading, isError } = useGetUserInfo();

    const user = userData?.data;

    const handleLogout = async () => {
        setIsLoggingOut(true);

        try {
            // Clear all auth-related cookies
            Cookies.remove('access_token');
            Cookies.remove('refresh_token');
            Cookies.remove('access_token'); // if you use this separately

            toast.success('Logged out successfully');

            // Redirect to user login
            router.push('/auth/sign-in');
        } catch (error) {
            toast.error('Failed to logout');
            console.error('Logout error:', error);
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <nav className="w-full sticky top-0 z-50 bg-background/60 backdrop-blur-3xl border-b border-border/40 px-6 py-4 shadow-sm transition-all duration-300">
            <div className="flex items-center justify-between max-w-full">
                {/* Search Bar */}
                <div className="flex-1 max-w-2xl">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                        </div>
                        <input
                            type="text"
                            placeholder="Global search..."
                            className="w-full pl-12 pr-4 py-2.5 bg-background/40 border border-border/50 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 focus:bg-background transition-all duration-300 shadow-inner backdrop-blur-md"
                        />
                    </div>
                </div>

                {/* Right Side - Notification and Profile */}
                <div className="flex items-center space-x-6 ml-8">
                    {/* Notification Bell */}
                    <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors duration-300 rounded-full hover:bg-accent/50">
                        <Bell className="h-5 w-5" />
                        {/* Notification dot */}
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-primary rounded-full shadow-[0_0_8px_var(--color-primary)] animate-pulse"></span>
                    </button>

                    {/* Admin Profile Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center space-x-3 focus:outline-none hover:bg-accent/40 rounded-xl px-3 py-2 transition-all duration-300 border border-transparent hover:border-border/50">
                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                                    {isLoading ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : user?.profile_image ? (
                                        <img
                                            src={user.profile_image}
                                            alt="User Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <User className="h-5 w-5" />
                                    )}
                                </div>
                                <div className="hidden md:block text-left">
                                    <p className="text-sm font-semibold text-foreground">
                                        {isLoading ? 'Loading...' : user?.first_name || user?.email?.split('@')[0] || 'User'}
                                    </p>
                                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-mono font-bold">
                                        Member
                                    </p>
                                </div>
                                <ChevronDown className="h-4 w-4 text-muted-foreground ml-2" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 bg-background/95 backdrop-blur-xl border-border/50 shadow-2xl rounded-xl">
                            <DropdownMenuLabel>
                                <div className="flex flex-col space-y-1.5 py-1">
                                    <p className="text-sm font-semibold text-foreground">
                                        {user?.first_name || 'Nexotropi User'}
                                    </p>
                                    <p className="text-xs text-muted-foreground font-mono">
                                        {user?.email || 'user@nexotropi.com'}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-border/50" />
                            <DropdownMenuItem
                                onClick={() => router.push('/admin/settings')}
                                className="cursor-pointer hover:bg-accent/50 focus:bg-accent/50"
                            >
                                <User className="mr-2 h-4 w-4 text-primary" />
                                <span>Profile</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-border/50" />
                            <DropdownMenuItem
                                onClick={handleLogout}
                                disabled={isLoggingOut}
                                className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 hover:bg-destructive/10"
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

export default UserNavbar;
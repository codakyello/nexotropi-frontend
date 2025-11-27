import React from 'react';
import { Search, Bell } from 'lucide-react';

const UserNavbar = () => {
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
                        {/* Notification dot (optional) */}
                        <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                    </button>

                    {/* Profile Image */}
                    <div className="relative">
                        <button className="flex items-center space-x-2 focus:outline-none rounded-full">
                            <div className="w-10 h-10 rounded-lg overflow-hidden transition-all duration-200">
                                <img
                                    src="/profile.png"
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default UserNavbar;
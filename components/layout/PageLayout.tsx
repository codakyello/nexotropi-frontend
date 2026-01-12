"use client"
import React from 'react';
import Navbar from './Navbar';
import { usePathname } from 'next/navigation';
import { useThemeStore } from '@/store/themeStore';

interface LayoutProps {
    children: React.ReactNode;
}

const PageLayout: React.FC<LayoutProps> = ({ children }) => {
    const pathname = usePathname();
    const { isDarkMode } = useThemeStore();
    const isHomePage = pathname === '/';

    return (
        <div   className={`bg-cover bg-center bg-no-repeat sm:bg-fixed transition-colors ${
            isHomePage ? 'min-h-screen' : 'h-max'
        } ${
            isDarkMode 
                ? '' 
                : 'bg-[#c1e6e9a0]'  // Solid color in light mode
        }`}
        style={isDarkMode ? { backgroundImage: "url('/landing.png')" } : {}}>
            <Navbar />
            <main className="relative">
                {children}
            </main>
        </div>
    );
};

export default PageLayout;
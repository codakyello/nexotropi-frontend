"use client"
import React from 'react';
import Navbar from './Navbar';
import { usePathname } from 'next/navigation';

interface LayoutProps {
    children: React.ReactNode;
}

const PageLayout: React.FC<LayoutProps> = ({ children }) => {
    const pathname = usePathname();
    const isHomePage = pathname === '/';

    return (
        <div
            className={`bg-cover bg-center bg-no-repeat sm:bg-fixed transition-colors ${isHomePage ? 'min-h-screen' : 'h-max'}`}
            style={{ backgroundImage: "url('/landing.png')" }}
        >
            <Navbar />
            <main className="relative">
                {children}
            </main>
        </div>
    );
};

export default PageLayout;

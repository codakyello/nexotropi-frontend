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
        <div className={`bg-cover bg-center bg-no-repeat bg-fixed ${isHomePage ? 'min-h-screen' : 'h-fit'}`}
            style={{ backgroundImage: "url('/hero.png')" }}>
            <Navbar />
            <main className="relative">
                {children}
            </main>
        </div>
    );
};

export default PageLayout;
"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import WaitlistModal from '../modals/WaitListModal';

const Header: React.FC = () => {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const scrollToSolution = () => {
        const solutionSection = document.getElementById('solution');
        if (solutionSection) {
            solutionSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    const scrollToCrisis = () => {
        const crisisSection = document.getElementById('crisis');
        if (crisisSection) {
            crisisSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    const scrollToFeatures = () => {
        const featureSection = document.getElementById('features');
        if (featureSection) {
            featureSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <header className="relative z-50 px-6 py-4">
            <nav className="flex items-center bg-[#181818] p-4 sm:p-6 rounded-md justify-between max-w-7xl mx-auto">
                {/* Logo */}
                <Link href="/" className="flex items-center space-x-2 text-white">
                    <Image
                        src="/nexotropoli.png"
                        width={188}
                        height={32}
                        alt="logo"
                        className="w-32 h-auto sm:w-[188px]"
                    />
                </Link>

                {/* Desktop Navigation Links */}
                <div className="hidden md:flex items-center space-x-8">
                </div>

                {/* Desktop Right Side */}
                <div className="hidden md:flex items-center space-x-4">
                    <Link href="/auth/sign-in" className="text-white font-medium hover:text-gray-200 transition-colors">
                        Sign in
                    </Link>
                    <Link href="/auth/sign-up" className="bg-white cursor-pointer text-purple-900 px-6 py-2 rounded-full font-medium hover:bg-gray-100 transition-colors">
                        Get started
                    </Link>
                </div>

                {/* Mobile CTAs */}
                <div className="flex sm:hidden items-center space-x-2">
                    <Link href="/auth/sign-in" className="text-white font-medium text-sm hover:text-gray-200 transition-colors">
                        Sign in
                    </Link>
                    <Link href="/auth/sign-up" className="bg-white cursor-pointer text-purple-900 px-3 text-nowrap py-2 rounded-lg font-medium text-sm hover:bg-gray-100 transition-colors">
                        Get started
                    </Link>
                </div>
            </nav>

            <WaitlistModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </header>
    );
};

export default Header;

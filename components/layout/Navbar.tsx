"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import WaitlistModal from '../modals/WaitListModal';
import { useThemeStore } from '@/store/themeStore';

const Header: React.FC = () => {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { isDarkMode, toggleTheme, initializeTheme } = useThemeStore();

    // Initialize theme on mount
    useEffect(() => {
        initializeTheme();
    }, [initializeTheme]);

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
            <nav className={`flex items-center ${!isDarkMode ? "bg-[#181818] p-6 rounded-md" : "p-0 bg-none rounded-none"} justify-between max-w-7xl mx-auto`}>
                {/* Logo */}
                <Link href="/" className="flex items-center space-x-2 text-white">
                    <Image src="/nexotropoli.png" width={188} height={32} alt="logo" />
                </Link>

                {/* Desktop Navigation Links */}
                <div className="hidden md:flex items-center space-x-8">
                    {/* <div
                        onClick={scrollToCrisis}
                        className={`text-white cursor-pointer font-medium hover:text-gray-200 transition-colors`}
                    >
                        Silent Crisis
                    </div>
                    <div
                        onClick={scrollToSolution}
                        className={`text-white cursor-pointer font-medium hover:text-gray-200 transition-colors`}
                    >
                        Solution
                    </div>
                    <div
                        onClick={scrollToFeatures}
                        className={`text-white cursor-pointer font-medium hover:text-gray-200 transition-colors`}
                    >
                        Features
                    </div> */}
                </div>

                {/* Desktop Right Side - Theme Toggle & CTA Button */}
                <div className="hidden md:flex items-center space-x-4">
                    {/* Theme Toggle Button */}
                    <button
                        onClick={toggleTheme}
                        className="text-white cursor-pointer hover:text-gray-200 transition-colors p-2 rounded-lg hover:bg-white/10"
                        aria-label="Toggle theme"
                    >
                        {isDarkMode ? (
                            // Sun icon for light mode
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        ) : (
                            // Moon icon for dark mode
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            </svg>
                        )}
                    </button>

                    {/* CTA Button */}
                    <button onClick={() => setIsModalOpen(true)} className="bg-white cursor-pointer text-purple-900 px-6 py-2 rounded-full font-medium hover:bg-gray-100 transition-colors">
                        Join Waitlist
                    </button>
                </div>

                {/* Mobile Menu Button */}
                {/* <button
                    onClick={toggleMobileMenu}
                    className="md:hidden text-white focus:outline-none focus:text-gray-200"
                    aria-label="Toggle mobile menu"
                >
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        {isMobileMenuOpen ? (
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        ) : (
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        )}
                    </svg>
                </button> */}

                {/* Mobile Theme Toggle & CTA */}
                <div className="flex sm:hidden items-center space-x-3">
                    {/* Theme Toggle Button */}
                    <button
                        onClick={toggleTheme}
                        className="text-white hover:text-gray-200 transition-colors p-2"
                        aria-label="Toggle theme"
                    >
                        {isDarkMode ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            </svg>
                        )}
                    </button>

                    <button onClick={() => setIsModalOpen(true)} className="bg-white cursor-pointer text-purple-900 px-2 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                        Join Waitlist
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Sidebar */}
            {isMobileMenuOpen && (
                <div className="md:hidden fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 backdrop-blur-sm z-40">
                    <div className="w-64 h-full bg-black bg-opacity-95 backdrop-blur-sm">
                        <div className="px-6 py-8 space-y-6">
                            {/* Close button */}
                            <button
                                onClick={closeMobileMenu}
                                className="text-white hover:text-gray-200 focus:outline-none mb-8"
                                aria-label="Close menu"
                            >
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <WaitlistModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </header>
    );
};

export default Header;
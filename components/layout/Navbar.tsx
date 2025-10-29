"use client"
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import WaitlistModal from '../modals/WaitListModal';

const Header: React.FC = () => {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false)

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <header className="relative z-50 px-6 py-4">
            <nav className="flex items-center justify-between max-w-7xl mx-auto">
                {/* Logo */}
                <Link href="/" className="hidden sm:flex items-center space-x-2 text-white">
                    <Image src="/nexotropoli.png" width={188} height={32} alt="logo" />
                </Link>

                {/* Desktop Navigation Links */}
                <div className="hidden md:flex items-center space-x-8">
                    <Link
                        href="/why-nexusforge"
                        className={`text-white hover:text-gray-200 transition-colors ${pathname === '/why-nexusforge' ? 'font-medium' : ''
                            }`}
                    >
                        Why Nexotropi
                    </Link>
                    <Link
                        href="/pricing"
                        className={`text-white hover:text-gray-200 transition-colors ${pathname === '/pricing' ? 'font-medium' : ''
                            }`}
                    >
                        Pricing
                    </Link>
                    <Link
                        href="/contact"
                        className={`text-white hover:text-gray-200 transition-colors ${pathname === '/contact' ? 'font-medium' : ''
                            }`}
                    >
                        Contact Us
                    </Link>
                </div>

                {/* Desktop CTA Button */}
                <button onClick={() => setIsModalOpen(true)} className="hidden md:block bg-white cursor-pointer text-purple-900 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                    Join Waitlist
                </button>

                {/* Mobile Menu Button */}
                <button
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
                </button>
                <button className="flex sm:hidden bg-white cursor-pointer text-purple-900 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                    Join Waitlist
                </button>
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

                            <Link
                                href="/why-nexusforge"
                                onClick={closeMobileMenu}
                                className={`block text-white hover:text-gray-200 transition-colors py-3 ${pathname === '/why-nexusforge' ? 'font-medium' : ''
                                    }`}
                            >
                                Why NexusForge
                            </Link>
                            <Link
                                href="/pricing"
                                onClick={closeMobileMenu}
                                className={`block text-white hover:text-gray-200 transition-colors py-3 ${pathname === '/pricing' ? 'font-medium' : ''
                                    }`}
                            >
                                Pricing
                            </Link>
                            <Link
                                href="/contact"
                                onClick={closeMobileMenu}
                                className={`block text-white hover:text-gray-200 transition-colors py-3 ${pathname === '/contact' ? 'font-medium' : ''
                                    }`}
                            >
                                Contact Us
                            </Link>
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
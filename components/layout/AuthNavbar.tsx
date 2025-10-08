"use client"
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const AuthHeader: React.FC = () => {

    return (
        <header className="relative z-50 px-6 py-4">
            <nav className="flex max-w-7xl mx-auto">
                {/* Logo */}
                <Link href="/" className="hidden sm:flex items-center space-x-2 text-white">
                    <Image src="/authheader.png" width={188} height={32} alt="logo" />
                </Link>


            </nav>
        </header>
    );
};

export default AuthHeader;
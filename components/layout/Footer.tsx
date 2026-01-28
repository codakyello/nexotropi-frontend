"use client"
import React, { useState } from 'react';
import { Linkedin, Facebook, Instagram, Youtube, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import WaitlistModal from '../modals/WaitListModal';
import { FaXTwitter } from "react-icons/fa6"
import { useRouter } from 'next/navigation';

const Footer = () => {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const router = useRouter()
    return (
        <footer className="text-white bg-cover bg-center bg-no-repeat sm:bg-fixed"
            style={{ backgroundImage: "url('/footernew.png')" }}
        >
            {/* CTA Section */}
            <div className="py-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-2xl font-bold mb-8">
                        Ready to Forge Your Autonomous Future?
                    </h1>
                    <p className="text-base text-indigo-200 mb-12 max-w-3xl mx-auto leading-relaxed">
                        Join our exclusive waitlist for early access to the Nexotropi platform and our
                        <br />
                        first product demos.
                    </p>
                    <button onClick={() => setIsModalOpen(true)} className="bg-white cursor-pointer text-indigo-950 px-12 py-3 rounded-full text-base font-semibold hover:bg-gray-50 transition-colors">
                        Join Waitlist
                    </button>
                </div>
            </div>

            {/* Footer Content */}
            <div className="border-t border-white">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">

                        <Link href="/" className="flex items-center space-x-2 text-white">
                            <Image src="/nexotropoli.png" width={188} height={32} alt="logo" />
                        </Link>

                        {/* Social Media Icons */}
                        <div className="flex items-center space-x-4">
                            <a
                                href="https://www.linkedin.com/company/nexotropi/"
                                className="w-10 h-10 border border-white rounded-full flex items-center justify-center hover:border-indigo-500 transition-colors"
                            >
                                <Linkedin className="w-4 h-4" />
                            </a>
                            <a
                                href="https://x.com/nexotropi?s=09"
                                className="w-10 h-10 border border-white rounded-full flex items-center justify-center hover:border-indigo-500 transition-colors"
                            >
                                <FaXTwitter className="w-4 h-4" />
                            </a>
                            <a
                                href="https://www.instagram.com/nexotropi_ai?igsh=MWhja2EyeXlhM3k5Yw==
"
                                className="w-10 h-10 border border-white rounded-full flex items-center justify-center hover:border-indigo-500 transition-colors"
                            >
                                <Instagram className="w-4 h-4" />
                            </a>
                            <a
                                href="https://www.youtube.com/@Nexotropi"
                                className="w-10 h-10 border border-white rounded-full flex items-center justify-center hover:border-indigo-500 transition-colors"
                            >
                                <Youtube className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Bottom Row */}
                    <div className="flex flex-col md:flex-row justify-between items-center mt-8 pt-8 border-t border-white space-y-4 md:space-y-0">
                        <p className="text-white text-sm">
                            © {new Date().getFullYear()} Nexotropi. All rights reserved.
                        </p>
                        <div className="flex items-center space-x-8">
                            <a
                                href="/privacy"
                                className="text-white hover:text-white transition-colors text-sm"
                            >
                                Privacy Policy
                            </a>
                            <Link
                                href="/terms-of-service"
                                className="text-white hover:text-white transition-colors text-sm"
                            >
                                Terms & Conditions
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
            <WaitlistModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </footer>
    );
};

export default Footer;
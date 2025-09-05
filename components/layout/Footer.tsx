import React from 'react';
import { Linkedin, Facebook, Instagram, Youtube } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const Footer = () => {
    return (
        <footer className="text-white bg-cover bg-center bg-no-repeat bg-fixed"
            style={{ backgroundImage: "url('/footercover.png')" }}
        >
            {/* CTA Section */}
            <div className="py-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-2xl font-bold mb-8">
                        Ready to Forge Your Autonomous Future?
                    </h1>
                    <p className="text-base text-indigo-200 mb-12 max-w-3xl mx-auto leading-relaxed">
                        Join our exclusive waitlist for early access to the NexusForge AI platform and our
                        <br />
                        first product demos.
                    </p>
                    <button className="bg-white text-indigo-950 px-12 py-4 cursor-pointer rounded-lg text-base font-semibold hover:bg-gray-50 transition-colors">
                        Join Waitlist
                    </button>
                </div>
            </div>

            {/* Footer Content */}
            <div className="border-t border-indigo-800">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">

                        <Link href="/" className="flex items-center space-x-2 text-white">
                            <Image src="/nexuslogo.png" width={188} height={32} alt="logo" />
                        </Link>

                        {/* Social Media Icons */}
                        <div className="flex items-center space-x-4">
                            <a
                                href="#"
                                className="w-10 h-10 border border-indigo-700 rounded-full flex items-center justify-center hover:border-indigo-500 transition-colors"
                            >
                                <Linkedin className="w-4 h-4" />
                            </a>
                            <a
                                href="#"
                                className="w-10 h-10 border border-indigo-700 rounded-full flex items-center justify-center hover:border-indigo-500 transition-colors"
                            >
                                <Facebook className="w-4 h-4" />
                            </a>
                            <a
                                href="#"
                                className="w-10 h-10 border border-indigo-700 rounded-full flex items-center justify-center hover:border-indigo-500 transition-colors"
                            >
                                <Instagram className="w-4 h-4" />
                            </a>
                            <a
                                href="#"
                                className="w-10 h-10 border border-indigo-700 rounded-full flex items-center justify-center hover:border-indigo-500 transition-colors"
                            >
                                <Youtube className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Bottom Row */}
                    <div className="flex flex-col md:flex-row justify-between items-center mt-8 pt-8 border-t border-indigo-800 space-y-4 md:space-y-0">
                        <p className="text-indigo-300 text-sm">
                            © 2025 NexusForge AI. All rights reserved.
                        </p>
                        <div className="flex items-center space-x-8">
                            <a
                                href="#"
                                className="text-indigo-300 hover:text-white transition-colors text-sm"
                            >
                                Privacy Policy
                            </a>
                            <a
                                href="#"
                                className="text-indigo-300 hover:text-white transition-colors text-sm"
                            >
                                Terms & Conditions
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
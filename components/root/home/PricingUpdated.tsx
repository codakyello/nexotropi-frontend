"use client"
import React from 'react';
import { Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

const PricingUpdated = () => {
    const router = useRouter()

    const scrollToContact = () => {
        const contactSection = document.getElementById('contact');
        if (contactSection) {
            contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    return (
        <section className="min-h-screen bg-gray-50 py-20 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-[1.7rem] sm:text-[2rem] font-bold text-[#1F2937] mb-6">
                        Pricing That Aligns with Your Growth
                    </h1>
                    <p className="text-base text-gray-500 max-w-2xl mx-auto">
                        Our value-based pricing is designed to grow with your business,
                        <br />
                        ensuring you see a clear return on every dollar.
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="grid lg:grid-cols-3 gap-8 mb-12">

                    {/* Launch Plan */}
                    <div className="bg-white rounded-2xl p-8 border border-gray-200">
                        <div className="mb-6">
                            <p className="text-sm text-gray-600 mb-2">Mid-Market Pilots</p>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Launch</h2>
                            <div className="mb-6">
                                <span className="text-3xl font-bold text-gray-900">Custom Pricing</span>
                            </div>
                            <p className="text-gray-600 mb-8">
                                Perfect for companies starting their AI journey
                            </p>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="flex items-start space-x-3">
                                <div className="w-5 h-5 rounded-full bg-[#1A4A7A] flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Check className="w-3 h-3 text-white" />
                                </div>
                                <span className="text-gray-700">Core replication</span>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="w-5 h-5 rounded-full bg-[#1A4A7A] flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Check className="w-3 h-3 text-white" />
                                </div>
                                <span className="text-gray-700">Single-module focus</span>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="w-5 h-5 rounded-full bg-[#1A4A7A] flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Check className="w-3 h-3 text-white" />
                                </div>
                                <span className="text-gray-700">Unlimited two-party negotiation</span>
                            </div>
                        </div>

                        <button onClick={scrollToContact} className="w-full py-3 px-6 border-2 border-[#1A4A7A] text-[#1A4A7A] cursor-pointer rounded-lg font-medium hover:bg-[#1A4A7A] hover:text-white transition-colors">
                            Contact Sales
                        </button>
                    </div>

                    {/* Scale Plan - Most Popular */}
                    <div className="bg-[#6E56A4] rounded-2xl p-8 relative transform scale-105">
                        {/* Most Popular Badge */}
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                            <span className="bg-white px-6 py-2 rounded-full text-sm font-medium text-[#6E56A4]">
                                Most Popular
                            </span>
                        </div>

                        <div className="mb-6">
                            <p className="text-sm text-white/80 mb-2">Enterprise Solutions</p>
                            <h2 className="text-2xl font-bold text-white mb-4">Scale</h2>
                            <div className="mb-6">
                                <h3 className="text-3xl font-bold text-white mb-2">Custom pricing</h3>
                            </div>
                            <p className="text-white/90 mb-8">
                                Comprehensive solution for large enterprises
                            </p>
                        </div>

                        <hr className="border-white/30 mb-8" />

                        <div className="space-y-4 mb-8">
                            <div className="flex items-start space-x-3">
                                <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Check className="w-3 h-3 text-[#6E56A4]" />
                                </div>
                                <span className="text-white">Full replication</span>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Check className="w-3 h-3 text-[#6E56A4]" />
                                </div>
                                <span className="text-white">Multi-party negotiation</span>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Check className="w-3 h-3 text-[#6E56A4]" />
                                </div>
                                <span className="text-white">API Integrations</span>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Check className="w-3 h-3 text-[#6E56A4]" />
                                </div>
                                <span className="text-white">Dedicated support</span>
                            </div>
                        </div>

                        <button onClick={scrollToContact} className="w-full py-3 px-6 bg-white text-[#6E56A4] rounded-lg font-medium hover:bg-gray-50 transition-colors">
                            Contact Sales
                        </button>
                    </div>

                    {/* Optimize Plan */}
                    <div className="bg-white rounded-2xl p-8 border border-gray-200">
                        <div className="mb-6">
                            <p className="text-sm text-gray-600 mb-2">Add-on Services</p>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Optimize</h2>
                            <div className="mb-6">
                                <h3 className="text-3xl font-bold text-gray-900 mb-2">Project-based</h3>
                            </div>
                            <p className="text-gray-600 mb-8">
                                Custom enhancements and consulting
                            </p>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="flex items-start space-x-3">
                                <div className="w-5 h-5 rounded-full bg-[#1A4A7A] flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Check className="w-3 h-3 text-white" />
                                </div>
                                <span className="text-gray-700">Custom AI training</span>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="w-5 h-5 rounded-full bg-[#1A4A7A] flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Check className="w-3 h-3 text-white" />
                                </div>
                                <span className="text-gray-700">Fine-tuning</span>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="w-5 h-5 rounded-full bg-[#1A4A7A] flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Check className="w-3 h-3 text-white" />
                                </div>
                                <span className="text-gray-700">Consulting</span>
                            </div>
                        </div>

                        <button onClick={scrollToContact} className="w-full py-3 cursor-pointer z-50 px-6 border-2 border-[#1A4A7A] text-[#1A4A7A] rounded-lg font-medium hover:bg-[#1A4A7A] hover:text-white transition-colors">
                            Contact Sales
                        </button>
                    </div>
                </div>

                {/* Footer Text */}
                <div className="text-center">
                    <p className="text-gray-600 max-w-3xl mx-auto">
                        Pricing is based on your unique needs, the scale of your digital ecosystem, and the volume
                        <br />
                        of autonomous interactions.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default PricingUpdated;
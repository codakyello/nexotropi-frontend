import React from 'react';
import { Network, Handshake, Shield } from 'lucide-react';

const Businesses = () => {
    return (
        <div className="bg-gray-50 py-16 pb-32 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">

                {/* Main Heading */}
                <h2 className="text-[1.7rem] sm:text-[2rem] font-bold text-gray-900 text-center mb-16">
                    Why Businesses Choose Us
                </h2>

                {/* Three Cards Grid */}
                <div className="grid md:grid-cols-3 gap-8">

                    {/* Card 1 - Beyond Traditional Digital Twins */}
                    <div className="bg-white rounded-2xl p-8 border border-gray-100">
                        <div className="bg-[#1A4A7A] w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                            <img src="/beyond.svg" />
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                            Beyond Traditional Digital Twins
                        </h3>

                        <p className="text-gray-600 leading-relaxed">
                            We replicate entire business ecosystems, not just physical assets.
                        </p>
                    </div>

                    {/* Card 2 - Strategic AI Negotiation */}
                    <div className="bg-white rounded-2xl p-8 border border-gray-100">
                        <div className="bg-[#1A4A7A] w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                            <img src="/strategic.svg" />
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                            Strategic AI Negotiation
                        </h3>

                        <p className="text-gray-600 leading-relaxed">
                            AI agents handle data-heavy talks, while humans retain final control.
                        </p>
                    </div>

                    {/* Card 3 - Security First */}
                    <div className="bg-white rounded-2xl p-8 border border-gray-100">
                        <div className="bg-[#1A4A7A] w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                            <img src="/security.svg" />
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                            Security First
                        </h3>

                        <p className="text-gray-600 leading-relaxed">
                            Federated learning, zero-knowledge proofs, and full encryption keep your data private.
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Businesses;
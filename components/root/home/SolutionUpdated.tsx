import Image from 'next/image';
import React from 'react';

const SolutionUpdated = () => {
    const features = [
        {
            icon: "/brain.svg",
            title: "AI-to-AI Negotiation:",
            description: "Your business represented by an always-on digital twin that negotiates, contracts, and transacts autonomously"
        },
        {
            icon: "/secure.svg",
            title: "Risk-Free Simulation:",
            description: "Test scenarios in a digital sandbox before committing to real-world execution"
        },
        {
            icon: "/agent.svg",
            title: "Proactive Optimization:",
            description: "AI agents continuously analyze market conditions, supplier performance, and internal needs to suggest improvements"
        },
        {
            icon: "/digital.svg",
            title: "Living Digital Ecosystems:",
            description: "Your digital twin interacts with supplier/buyer twins to co-create value—no human friction"
        }
    ];

    return (
        <section className="bg-gray-50 py-20 px-6">
            <div className="container mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        <span className="relative inline-block">
                            The Solution:
                            <span className="absolute bottom-1 left-0 w-full h-3 bg-blue-200 -z-10"></span>
                        </span>
                    </h1>
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">
                        Living Digital Ecosystems.
                    </h2>
                    <p className="text-lg text-gray-600">
                        Autonomous AI Agents for Enterprise Commerce
                    </p>
                </div>

                {/* Two Column Layout */}
                <div className="grid lg:grid-cols-2 gap-16 items-start">
                    {/* Left: 3D Visualization */}
                    <div className="relative h-[500px] bg-black rounded-3xl overflow-hidden">
                        <Image
                            src="/solution.png"
                            alt="Digital ecosystem visualization"
                            fill
                            className="object-cover"
                        />
                    </div>

                    {/* Right: Features List */}
                    <div className="space-y-6">
                        {features.map((feature, index) => (
                            <div key={index} className="flex gap-4 items-start">
                                <div className="flex-shrink-0 w-12 h-12 bg-[#1a1f3a] rounded-lg flex items-center justify-center">
                                    <Image
                                        src={feature.icon}
                                        alt=""
                                        width={24}
                                        height={24}
                                        className="w-6 h-6"
                                    />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-700 text-base leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {/* Traction Box */}
                        <div className="mt-8 bg-[#AE94E9] rounded-md p-6">
                            <p className="text-white text-base leading-relaxed">
                                <span className="font-semibold">Early Traction:</span> Beta MVP in development; 2 Letters of Intent from Fortune 500 manufacturers & distributors.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SolutionUpdated;
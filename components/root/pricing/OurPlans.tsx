import React from 'react';
import { Check, X } from 'lucide-react';

const PricingComparisonTable = () => {
    const features = [
        {
            name: "Core ecosystem generation",
            launch: true,
            scale: true,
            optimize: true
        },
        {
            name: "Two-party negotiations",
            launch: true,
            scale: true,
            optimize: true
        },
        {
            name: "API integrations",
            launch: false,
            scale: true,
            optimize: true
        },
        {
            name: "Custom AI training",
            launch: false,
            scale: false,
            optimize: true
        },
        {
            name: "Fine-tuning services",
            launch: false,
            scale: false,
            optimize: true
        },
        {
            name: "Dedicated support",
            launch: false,
            scale: true,
            optimize: true
        },
        {
            name: "Strategic consulting",
            launch: false,
            scale: false,
            optimize: true
        }
    ];

    return (
        <div className="w-full max-w-6xl mx-auto px-6 py-16">
            {/* Header */}
            <div className="text-center mb-12">
                <h2 className="text-[2rem] font-bold text-gray-900 mb-4">
                    Compare Our Plans – Find the Perfect<br />
                    Fit for Your Business
                </h2>
                <p className="text-gray-500 text-base max-w-3xl mx-auto">
                    From pilot projects to enterprise-scale automation, see what each NexusForge<br />
                    AI plan offers and choose the one that matches your goals.
                </p>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-4 bg-gray-50 border-b">
                    <div className="p-6">
                        <h3 className="text-base font-semibold text-gray-900">Features</h3>
                    </div>
                    <div className="p-6 text-center">
                        <h3 className="text-base font-semibold text-gray-900">Launch</h3>
                    </div>
                    <div className="p-6 text-center">
                        <h3 className="text-base font-semibold text-gray-900">Scale</h3>
                    </div>
                    <div className="p-6 text-center">
                        <h3 className="text-base font-semibold text-gray-900">Optimize</h3>
                    </div>
                </div>

                {/* Table Body */}
                {features.map((feature, index) => (
                    <div
                        key={feature.name}
                        className={`grid grid-cols-4 border-b border-gray-200 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                            }`}
                    >
                        <div className="p-6">
                            <span className="text-gray-900 font-medium">{feature.name}</span>
                        </div>
                        <div className="p-6 flex justify-center">
                            {feature.launch ? (
                                <Check className="w-6 h-6 text-teal-500" />
                            ) : (
                                <X className="w-6 h-6 text-red-500" />
                            )}
                        </div>
                        <div className="p-6 flex justify-center">
                            {feature.scale ? (
                                <Check className="w-6 h-6 text-teal-500" />
                            ) : (
                                <X className="w-6 h-6 text-red-500" />
                            )}
                        </div>
                        <div className="p-6 flex justify-center">
                            {feature.optimize ? (
                                <Check className="w-6 h-6 text-teal-500" />
                            ) : (
                                <X className="w-6 h-6 text-red-500" />
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PricingComparisonTable;
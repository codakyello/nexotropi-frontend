import Image from 'next/image';
import React from 'react';

const SilentCrisis = () => {
    return (
        <section className="bg-white py-16 px-6">
            <div className="container mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-[1.7rem] sm:text-[2rem] font-bold text-gray-900 mb-6">
                        The Silent Crisis in B2B
                    </h1>
                    <p className="text-base text-gray-700 max-w-3xl mx-auto">
                        The way companies interact today is analog, inefficient, and brittle. This<br></br>
                        &apos;gap&apos; costs your business billions.
                    </p>
                </div>

                {/* Three Column Grid */}
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Card 1 */}
                    <div className="relative border border-[#E9EBF8] rounded-lg p-8">
                        <div className="absolute top-0 right-0 w-12 h-12 text-gray-300">
                            <Image src="/high.svg" alt="high negotiation" width={80} height={80} />
                        </div>
                        <div className="text-5xl font-bold mb-4">
                            01
                        </div>

                        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                            High Negotiation Costs
                        </h3>

                        <p className="text-[#AAAAAA] leading-relaxed">
                            Billions are lost annually to manual processes, legal fees, and wasted human capital on repetitive haggling.
                        </p>
                    </div>
                    <div className="relative border border-[#E9EBF8] border-b-4 border-b-black rounded-lg p-8">
                        <div className="absolute top-0 right-0 w-12 h-12 text-gray-300">
                            <Image src="/fragile.svg" alt="fragile supply" width={80} height={80} />
                        </div>
                        <div className="text-5xl font-bold mb-4">
                            02
                        </div>

                        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                            Fragile Supply Chains
                        </h3>

                        <p className="text-[#AAAAAA] leading-relaxed">
                            Businesses are reactive to disruptions, costing trillions in lost revenue due to a lack of proactive foresight and adaptation.
                        </p>
                    </div>
                    <div className="relative border border-[#E9EBF8] rounded-lg p-8">
                        <div className="absolute top-0 right-0 w-12 h-12 text-gray-300">
                            <Image src="/slow.svg" alt="fragile supply" width={80} height={80} />
                        </div>
                        <div className="text-5xl font-bold mb-4">
                            03
                        </div>

                        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                            Slow Decisions
                        </h3>

                        <p className="text-[#AAAAAA] leading-relaxed">
                            Human analytical capacity is a bottleneck, preventing businesses from responding quickly in dynamic markets.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SilentCrisis;
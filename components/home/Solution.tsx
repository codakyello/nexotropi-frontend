import Image from 'next/image';
import React from 'react';

const Solution = () => {
    return (
        <section className="bg-[f9fafc] py-16 px-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-[1.7rem] sm:text-[2rem] font-bold text-gray-900 mb-6">
                        The Solution: <br></br> Living Digital Ecosystems.
                    </h1>
                    <p className="text-base text-gray-700 max-w-3xl mx-auto">
                        NexusForge AI is a revolutionary platform that creates  hyper-realistic AI replicas of your business,<br></br> enabling them to autonomously  interact with other companies.
                    </p>
                </div>

                {/* Three Column Grid */}
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Card 1 */}
                    <div className="relative border border-[#E9EBF8] border-b-4 border-b-black rounded-lg p-8">
                        <div className="mb-4">
                            <Image src="/create.svg" alt="high negotiation" width={70} height={70} />
                        </div>

                        <h3 className="text-[1.3rem] font-bold text-gray-900 mb-4">
                            Holistic Enterprise Replication
                        </h3>

                        <p className="text-[#AAAAAA] leading-relaxed">
                            Create a &apos;living&apos; AI replica of your business—not just a  machine—including operations, finance, and supply chain.
                        </p>
                    </div>
                    <div className="relative border border-[#E9EBF8] rounded-lg p-8">

                        <div className="mb-4">
                            <Image src="/ai.svg" alt="high negotiation" width={70} height={70} />
                        </div>

                        <h3 className="text-[1.3rem] font-bold text-gray-900 mb-4">
                            Autonomous AI Diplomacy
                        </h3>

                        <p className="text-[#AAAAAA] leading-relaxed">
                            AI agents negotiate contracts and optimize relationships with other  companies in real-time, 24/7.
                        </p>
                    </div>
                    <div className="relative border border-[#E9EBF8] border-b-4 border-b-black rounded-lg p-8">
                        <div className="mb-4">
                            <Image src="/agree.svg" alt="high negotiation" width={70} height={70} />
                        </div>

                        <h3 className="text-[1.3rem] font-bold text-gray-900 mb-4">
                            Verifiable Real-World Action
                        </h3>

                        <p className="text-[#AAAAAA] leading-relaxed">
                            Agreements are seamlessly translated into automated actions in your  ERP or via smart contracts.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Solution;
import Image from 'next/image';
import React from 'react';

const WhatWeDoSection = () => {
    return (
        <div className="bg-[#6E56A4] py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-12 items-start">

                    {/* Left Content */}
                    <div className="text-white space-y-8">
                        <h2 className="text-[24px] font-bold">
                            What We Do
                        </h2>

                        <div className="space-y-6">
                            <p className="text-base leading-relaxed">
                                Nexotropi is not just a tool — its a transformation engine
                            </p>

                            <p className="text-base leading-relaxed">
                                We build AI-powered replicas of entire companies, from their operations and
                                finances to supply chains, and enable them to interact with other companies AI
                                ecosystems.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <p className="text-base">
                                With Nexotropi, businesses can:
                            </p>

                            <ul className="space-y-3 text-base">
                                <li className="flex items-start">
                                    <span className="text-blue-300 mr-3">•</span>
                                    Run complex multi-party deal simulations
                                </li>
                                <li className="flex items-start">
                                    <span className="text-blue-300 mr-3">•</span>
                                    Negotiate autonomously using AI and game theory
                                </li>
                                <li className="flex items-start">
                                    <span className="text-blue-300 mr-3">•</span>
                                    Compare multiple &apos;what-if&apos; market scenarios instantly
                                </li>
                                <li className="flex items-start">
                                    <span className="text-blue-300 mr-3">•</span>
                                    Make high-impact decisions with measurable confidence
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className=" p-4">

                        <Image
                            src="/frame.png"
                            alt=""
                            width={400}
                            height={500}
                            className="rounded-lg"
                        />

                        {/* <Image
                            src="/two.png"
                            alt=""
                            width={250}
                            height={100}
                            className="object-contain rounded-lg"
                        /> */}


                    </div>


                </div>
            </div>
        </div>
    );
};

export default WhatWeDoSection;
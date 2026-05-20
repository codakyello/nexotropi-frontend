import Image from 'next/image';
import React from 'react';

const MissionSection = () => {
    return (
        <div className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-20">

                {/* Mission Section */}
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Mission Text */}
                    <div className="space-y-6">
                        <img src="/mission.svg" alt="mission" className='w-28' />

                        <h2 className="text-[2rem] font-bold text-gray-900 leading-tight">
                            Turning uncertainty into clarity through AI-powered simulations
                        </h2>

                        <p className="text-base text-gray-600 leading-relaxed">
                            To revolutionize the way companies make decisions by creating living digital
                            ecosystems — hyper-realistic AI replicas of entire businesses — enabling them to
                            simulate strategies, negotiate deals, and optimize operations in a safe virtual
                            environment before real-world execution.
                        </p>
                    </div>

                    {/* Mission Images */}
                    <div className="space-y-4">
                        <Image src="/mission.png" alt="mission" width={340} height={240} />
                    </div>
                </div>

                {/* Vision Section */}
                <div className="grid lg:grid-cols-2 gap-12 items-center">

                    {/* Vision Text */}
                    <div className="space-y-6">
                        <img src="/vision.svg" alt="mission" className='w-28' />
                        <h2 className="text-[2rem] font-bold text-gray-900 leading-tight">
                            A future where every decision is tested before it&apos;s made
                        </h2>

                        <p className="text-base text-gray-600 leading-relaxed">
                            A world where every major business decision is tested, refined, and perfected
                            through AI simulations — turning uncertainty into clarity, and bold ideas into
                            confident action.
                        </p>
                    </div>
                    {/* Vision Images */}
                    <div className="relative">
                        <Image src="/vision.png" alt="mission" width={340} height={340} />
                        <Image src="/nexus.png" alt="nexus" className='hidden sm:flex absolute top-[-10rem] right-24' width={240} height={240} />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default MissionSection;
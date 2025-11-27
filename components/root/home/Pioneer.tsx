import Image from 'next/image';
import React from 'react';

export default function Pioneer() {
    return (
        <section className="min-h-screen bg-gray-50 flex items-center">
            <div className="px-4 sm:px-0">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Content */}
                    <div className="space-y-8 sm:pl-28">
                        <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 leading-tight">
                            Be a Pioneer in{' '}
                            <span className="block">Autonomous</span>
                            <span className="block">Commerce.</span>
                        </h1>

                        <p className="text-base text-gray-600 leading-relaxed max-w-lg">
                            Nexotropi is in its early stages of development. Join our<br></br>
                            waitlist for exclusive access and help us shape the future of B2B.
                        </p>

                        <button className="bg-[#1A4A7A] cursor-pointer text-white font-semibold px-8 py-4 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl">
                            Join Waitlist
                        </button>
                    </div>

                    {/* Right Image */}
                    <div className="w-full">
                        <Image src="/pioneer.png" alt="pioneer" width={700} height={650} className='rounded-md' />
                    </div>
                </div>
            </div>
        </section>
    );
}
import React from 'react';

const Testimonials = () => {
    return (
        <section className="min-h-screen bg-[#E8EDF2] py-20 px-4 relative overflow-hidden">
            {/* Subtle background decoration */}
            <div className="absolute inset-0 opacity-30">
                <div className="absolute top-20 right-10 w-96 h-96 border border-gray-300 rounded-full"></div>
                <div className="absolute bottom-20 left-10 w-64 h-64 border border-gray-300 rounded-full"></div>
            </div>

            <div className="max-w-6xl mx-auto relative">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-[1.7rem] sm:text-[2rem] font-bold text-gray-800 mb-6">
                        What our clients are saying about us
                    </h1>
                    <p className="text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        See how companies are achieving smarter, faster, and
                        <br />
                        more efficient results with our platform
                    </p>
                </div>

                {/* Testimonial Card */}
                <div className="flex flex-col lg:flex-row items-center justify-center gap-12">

                    {/* Profile Image */}
                    <div className="flex-shrink-0">
                        <div className="relative">
                            <div className="w-80 h-96 bg-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                                <img
                                    src="/testimonial.png"
                                    alt="John Doe, CEO of Nairamatics"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Testimonial Content */}
                    <div className="flex-1 max-w-2xl">
                        <div className="mb-8">
                            <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-8">
                                &apos;With Nexotropi&apos;s digital ecosystem replication, we finally have
                                a living, breathing view of our entire enterprise. We can see every
                                relationship, process, and dependency in real time — it&apos;s like
                                having an x-ray of our business operations. The multimodal data
                                ingestion has cut our data harmonization time by 70%.&apos;
                            </p>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">
                                John Doe
                            </h3>
                            <p className="text-gray-600 font-medium">
                                CEO Nairamatics
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
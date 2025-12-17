import Image from "next/image";

const SilentCrisisUpdated = () => {
    const problems = [
        {
            icon: "/money.svg",
            text: "$100B+ lost annually to manual errors, duplicate orders, and pricing inefficiencies (McKinsey)"
        },
        {
            icon: "/timers.svg",
            text: "60-90 day procurement cycles paralyzed by email ping-pong and manual approvals"
        },
        {
            icon: "/graphs.svg",
            text: "Zero strategic foresight—reactive decision-making based on outdated spreadsheets"
        },
        {
            icon: "/error.svg",
            text: "Fragile supply chains crumbling under complexity (avg. 250+ tier-2 suppliers per enterprise) (commercetools)"
        },
        {
            icon: "/graph.svg",
            text: "Human bottlenecks in scaling partnerships—every new relationship requires manual onboarding"
        }
    ];

    return (
        <section className="bg-white py-20 px-6">
            <div className="container mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        The Silent Crisis in B2B
                    </h1>
                    <p className="text-lg text-gray-600">
                        Global B2B Commerce Still Runs on Email & Spreadsheets
                    </p>
                </div>

                {/* Two Column Layout */}
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left: Problem List */}
                    <div className="space-y-8">
                        {problems.map((problem, index) => (
                            <div key={index} className="flex gap-4 items-center">
                                <div className="flex-shrink-0 w-12 h-12 bg-[#1a1f3a] rounded-lg flex items-center justify-center">
                                    <Image
                                        src={problem.icon}
                                        alt=""
                                        width={24}
                                        height={24}
                                        className="w-6 h-6"
                                    />
                                </div>
                                <p className="text-gray-800 text-base leading-relaxed pt-2">
                                    {problem.text}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Right: Office Image */}
                    <div className="relative h-[450px] rounded-2xl overflow-hidden">
                        <Image
                            src="/crisis.png"
                            alt="Modern office workspace"
                            fill
                            className="object-cover"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SilentCrisisUpdated
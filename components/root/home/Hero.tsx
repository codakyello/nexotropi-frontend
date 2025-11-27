"use client"
import { useState } from "react";
import PageLayout from "../../layout/PageLayout";
import WaitlistModal from "../../modals/WaitListModal";
import { useRouter } from "next/navigation";

interface HeroSectionProps {
    title: string;
    subtitle: string;
    showButtons?: boolean;
}

const HeroSection: React.FC<HeroSectionProps> = ({
    title,
    subtitle,
    showButtons = true
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const router = useRouter()
    return (
        <PageLayout>
            <section className="relative z-10 px-6 py-20 md:py-32">
                <div className="max-w-4xl mx-auto text-center text-white">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                        {title}
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-200 mb-8 leading-relaxed max-w-3xl mx-auto">
                        {subtitle}
                    </p>

                    {showButtons && (
                        <div className="flex flex-row gap-4 justify-center items-center">
                            <button onClick={() => router.push("/auth/sign-up")} className="bg-white cursor-pointer text-gray-900 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                                Get Started
                            </button>
                            <button className="border border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-purple-900 transition-colors">
                                Learn More
                            </button>
                        </div>
                    )}
                </div>
            </section>
            <WaitlistModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </PageLayout>
    );
};

export default HeroSection;
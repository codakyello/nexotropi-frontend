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
    const scrollToContact = () => {
        const contactSection = document.getElementById('contact');
        if (contactSection) {
            contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    return (
        <PageLayout>
            <section className="relative z-10 px-6 py-20 md:py-32">
                <div className="max-w-6xl mx-auto text-center text-white mt-12">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                        {title}
                    </h1>
                    <p className="text-xl md:text-2xl font-normal text-gray-200 mb-8 max-w-3xl mx-auto">
                        {subtitle}
                    </p>

                    {showButtons && (
                        <div className="flex flex-row gap-4 justify-center items-center">
                            <button onClick={() => setIsModalOpen(true)} className="bg-white cursor-pointer text-gray-900 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                                Join Waitlist
                            </button>
                            <button onClick={scrollToContact} className="border cursor-pointer border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-purple-900 transition-colors">
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
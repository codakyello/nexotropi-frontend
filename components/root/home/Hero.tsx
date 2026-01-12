"use client"
import { useState } from "react";
import PageLayout from "../../layout/PageLayout";
import WaitlistModal from "../../modals/WaitListModal";
import { useRouter } from "next/navigation";
import { useThemeStore } from '@/store/themeStore';

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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();
    const { isDarkMode } = useThemeStore();

    const scrollToContact = () => {
        const contactSection = document.getElementById('features');
        if (contactSection) {
            contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    return (
        <PageLayout>
            <section className="relative z-10 px-6 py-20 md:py-32">
                <div className={`max-w-6xl mx-auto text-center sm:mt-6 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                        The Future of <br></br> B2B Commerce is Autonomous.
                    </h1>
                    <p className={`text-xl md:text-2xl font-normal mb-8 max-w-3xl mx-auto ${isDarkMode ? 'text-gray-200' : 'text-gray-700'
                        }`}>
                        {subtitle}
                    </p>

                    {showButtons && (
                        <div className="flex flex-row gap-1.5 sm:gap-4 justify-center items-center">
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className={`cursor-pointer px-8 py-3 rounded-full font-medium transition-colors bg-[#93DBE4] text-gray-900 hover:bg-white
                                    }`}
                            >
                                Join Waitlist
                            </button>
                            <button
                                onClick={scrollToContact}
                                className={`cursor-pointer px-8 py-3 rounded-full font-medium transition-colors ${isDarkMode
                                    ? 'border border-[#93DBE4] text-white hover:bg-white hover:text-gray-900'
                                    : 'border border-gray-500 shadow-sm text-gray-900 hover:bg-transparent'
                                    }`}
                            >
                                Our Features
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
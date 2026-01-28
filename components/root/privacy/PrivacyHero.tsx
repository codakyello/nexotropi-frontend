"use client"
import { useThemeStore } from "@/store/themeStore";
import PageLayout from "../../layout/PageLayout";

interface HeroSectionProps {
    title: string;
    subtitle: string;
    showButtons?: boolean;
}

const PrivacyHero: React.FC<HeroSectionProps> = ({
    title,
    subtitle,
    showButtons = false
}) => {
    const { isDarkMode } = useThemeStore();

    return (
        <PageLayout>
            <section className="relative z-10 px-6 py-20 md:py-32">
                <div className={`max-w-4xl mx-auto text-center transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                    <h1 className="text-4xl font-bold mb-6 leading-tight">
                        {title}
                    </h1>
                    <p className={`text-xl mb-8 leading-relaxed max-w-3xl mx-auto ${isDarkMode ? 'text-gray-200' : 'text-gray-700'
                        }`}>
                        {subtitle}
                    </p>
                    <p className={`text-xl mb-8 leading-relaxed max-w-3xl mx-auto ${isDarkMode ? 'text-gray-200' : 'text-gray-700'
                        }`}>
                        Last Updated: January 2026
                    </p>

                    {showButtons && (
                        <div className="flex flex-row gap-4 justify-center items-center">
                            <button className={`px-8 py-3 rounded-lg font-medium transition-colors ${isDarkMode
                                ? 'bg-white text-gray-900 hover:bg-gray-100'
                                : 'bg-gray-900 text-white hover:bg-gray-800'
                                }`}>
                                Join Waitlist
                            </button>
                            <button className={`border px-8 py-3 rounded-lg font-medium transition-colors ${isDarkMode
                                ? 'border-white text-white hover:bg-white hover:text-purple-900'
                                : 'border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white'
                                }`}>
                                Learn More
                            </button>
                        </div>
                    )}
                </div>
            </section>
        </PageLayout>
    );
};

export default PrivacyHero;
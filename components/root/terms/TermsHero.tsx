"use client"
import PageLayout from "../../layout/PageLayout";

interface HeroSectionProps {
    title: string;
    subtitle: string;
    showButtons?: boolean;
}

const TermsHero: React.FC<HeroSectionProps> = ({
    title,
    subtitle,
    showButtons = false
}) => {
    return (
        <PageLayout>
            <section className="relative z-10 px-6 py-20 md:py-32">
                <div className="max-w-4xl mx-auto text-center text-white">
                    <h1 className="text-4xl font-bold mb-6 leading-tight">
                        {title}
                    </h1>
                    <p className="text-xl mb-8 leading-relaxed max-w-3xl mx-auto text-gray-200">
                        {subtitle}
                    </p>
                    <p className="text-xl mb-8 leading-relaxed max-w-3xl mx-auto text-gray-200">
                        Last Updated: July 25, 2025
                    </p>
                </div>
            </section>
        </PageLayout>
    );
};

export default TermsHero;

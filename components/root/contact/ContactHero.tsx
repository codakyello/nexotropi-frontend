import PageLayout from "../../layout/PageLayout";

interface HeroSectionProps {
    title: string;
    subtitle: string;
    showButtons?: boolean;
}

const ContactHero: React.FC<HeroSectionProps> = ({
    title,
    subtitle,
    showButtons = false
}) => {
    return (
        <PageLayout>
            <section className="relative z-10 px-6 pt-32 pb-60">
                <div className="max-w-4xl mx-auto text-center text-white">
                    <h1 className="text-4xl font-bold mb-6 leading-tight">
                        {title}
                    </h1>
                    <p className="text-xl text-gray-200 mb-8 leading-relaxed max-w-3xl mx-auto">
                        {subtitle}
                    </p>

                    {showButtons && (
                        <div className="flex flex-row gap-4 justify-center items-center">
                            <button className="bg-white text-gray-900 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                                Join Waitlist
                            </button>
                            <button className="border border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-purple-900 transition-colors">
                                Learn More
                            </button>
                        </div>
                    )}
                </div>
            </section>
        </PageLayout>
    );
};

export default ContactHero;
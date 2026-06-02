import React from 'react'
import PageLayout from '../../layout/PageLayout'

interface ContactHeroProps {
    title: string
    subtitle: string
}

const ContactHero: React.FC<ContactHeroProps> = ({ title, subtitle }) => {
    return (
        <PageLayout>
            <section className="relative z-10 px-6 py-20 md:py-32">
                <div className="max-w-6xl mx-auto text-center sm:mt-6 text-white">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                        {title}
                    </h1>
                    <p className="text-xl md:text-2xl font-normal mb-8 max-w-3xl mx-auto text-gray-200">
                        {subtitle}
                    </p>
                </div>
            </section>
        </PageLayout>
    )
}

export default ContactHero

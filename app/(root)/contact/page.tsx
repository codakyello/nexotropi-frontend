import ContactHero from '@/components/contact/ContactHero'
import ContactSection from '@/components/contact/ContactSection'
import React from 'react'

const page = () => {
    return (
        <>
            <ContactHero title="Contact NexusForge AI" subtitle='We’re here to answer your questions, discuss your needs, and help you explore how NexusForge AI can transform your business decisions.' />
            <ContactSection />
        </>
    )
}

export default page
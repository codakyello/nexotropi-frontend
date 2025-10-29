import ContactHero from '@/components/users/contact/ContactHero'
import ContactSection from '@/components/users/contact/ContactSection'
import React from 'react'

const page = () => {
    return (
        <>
            <ContactHero title="Contact Nexotropi" subtitle='We’re here to answer your questions, discuss your needs, and help you explore how Nexotropi can transform your business decisions.' />
            <ContactSection />
        </>
    )
}

export default page
import TermsHero from '@/components/terms/TermsHero'
import TermsSection from '@/components/terms/TermsSection'
import React from 'react'

const page = () => {
    return (
        <>
            <TermsHero title="Terms of Service" subtitle='Please read these Terms of Service ("Terms") carefully before using the website and platform operated by NexusForge AI, Inc. ("us", "we", or "our").' />
            <TermsSection />
        </>
    )
}

export default page
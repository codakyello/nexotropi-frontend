import TermsHero from '@/components/root/terms/TermsHero'
import TermsSection from '@/components/root/terms/TermsSection'
import React from 'react'

const page = () => {
    return (
        <>
            <TermsHero title="Terms of Service" subtitle='Please read these Terms of Service ("Terms") carefully before using the website and platform operated by Nexotropi, Inc. ("us", "we", or "our").' />
            <TermsSection />
        </>
    )
}

export default page
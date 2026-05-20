import PrivacyHero from '@/components/root/privacy/PrivacyHero'
import PrivacySection from '@/components/root/privacy/PrivacySection'
import React from 'react'

const page = () => {
    return (
        <>
            <PrivacyHero title="Privacy" subtitle='Please read these Terms of Service ("Terms") carefully before using the website and platform operated by Nexotropi, Inc. ("us", "we", or "our").' />
            <PrivacySection />
        </>
    )
}

export default page
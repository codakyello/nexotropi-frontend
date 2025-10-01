import Pricing from '@/components/home/Pricing'
import PricingHero from '@/components/pricing/PricingHero'
import TermsSection from '@/components/terms/TermsSection'
import React from 'react'

const page = () => {
    return (
        <>
            <PricingHero title="NexusForge AI – Simple, Transparent Pricing" subtitle='Powerful AI simulations for every stage of your business journey. No hidden fees, no surprises.' />
            <Pricing />
        </>
    )
}

export default page
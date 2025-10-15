import Pricing from '@/components/root/home/Pricing'
import PricingHero from '@/components/root/pricing/PricingHero'
import TermsSection from '@/components/root/terms/TermsSection'
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
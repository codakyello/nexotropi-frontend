import FaqSection from '@/components/home/FaqSection'
import Pricing from '@/components/home/Pricing'
import PricingComparisonTable from '@/components/pricing/OurPlans'
import PricingHero from '@/components/pricing/PricingHero'
import React from 'react'

const page = () => {
    return (
        <>
            <PricingHero title="NexusForge AI – Simple, Transparent Pricing" subtitle='NexusForge AI – Simple, Transparent Pricing
            Powerful AI simulations for every stage of your business journey. No hidden fees, no surprises.' />
            <Pricing />
            <PricingComparisonTable />
            <FaqSection />
        </>
    )
}

export default page
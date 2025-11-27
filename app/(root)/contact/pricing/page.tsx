import FaqSection from '@/components/root/home/FaqSection'
import Pricing from '@/components/root/home/Pricing'
import PricingComparisonTable from '@/components/root/pricing/OurPlans'
import PricingHero from '@/components/root/pricing/PricingHero'
import React from 'react'

const page = () => {
    return (
        <>
            <PricingHero title="Nexotropi – Simple, Transparent Pricing" subtitle='Nexotropi – Simple, Transparent Pricing
            Powerful AI simulations for every stage of your business journey. No hidden fees, no surprises.' />
            <Pricing />
            <PricingComparisonTable />
            <FaqSection />
        </>
    )
}

export default page
import Businesses from '@/components/root/why-nexusforge/Businesses'
import MissionSection from '@/components/root/why-nexusforge/Mission'
import WhatWeDoSection from '@/components/root/why-nexusforge/WhatWeDo'
import WhyChooseHero from '@/components/root/whychooseus/WhyChooseHero'
import React from 'react'

const page = () => {
    return (
        <>
            <WhyChooseHero title="Nexotropi – Simple, Transparent Pricing" subtitle='Nexotropi – Simple, Transparent Pricing
            Powerful AI simulations for every stage of your business journey. No hidden fees, no surprises.' />
            <MissionSection />
            <WhatWeDoSection />
            <Businesses />
        </>
    )
}

export default page
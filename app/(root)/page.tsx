import CoreFeatures from '@/components/root/home/CoreFeatures'
import FaqSection from '@/components/root/home/FaqSection'
import HeroSection from '@/components/root/home/Hero'
import Pioneer from '@/components/root/home/Pioneer'
import PricingUpdated from '@/components/root/home/PricingUpdated'
import SilentCrisisUpdated from '@/components/root/home/SilentCrisisUpdated'
import SolutionUpdated from '@/components/root/home/SolutionUpdated'
import Testimonials from '@/components/root/home/Testimonials'
import ContactSection from '@/components/root/contact/ContactSection'
import React from 'react'

const page = () => {
  return (
    <>
      <HeroSection title="The Future of B2B Commerce is Autonomous." subtitle='Nexotropi enables autonomous negotiation and strategic  simulation by creating living digital ecosystems of your business.' />
      {/* <SilentCrisisUpdated />
      <SolutionUpdated /> */}
      <CoreFeatures />
      {/* <PricingUpdated /> */}
      {/* <Testimonials />
      <Pioneer /> */}
      {/* <FaqSection /> */}
      {/* <ContactSection /> */}
    </>
  )
}

export default page
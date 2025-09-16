import CoreFeatures from '@/components/home/CoreFeatures'
import FaqSection from '@/components/home/FaqSection'
import HeroSection from '@/components/home/Hero'
import Pioneer from '@/components/home/Pioneer'
import Pricing from '@/components/home/Pricing'
import SilentCrisis from '@/components/home/SilentCrisis'
import Solution from '@/components/home/Solution'
import Testimonials from '@/components/home/Testimonials'
import React from 'react'

const page = () => {
  return (
    <>
      <HeroSection title="The Future of B2B Commerce is Autonomous." subtitle='NexusForge AI enables autonomous negotiation and strategic  simulation by creating living digital ecosystems of your business.' />
      <SilentCrisis />
      <Solution />
      <CoreFeatures />
      <Pricing />
      <Testimonials />
      <Pioneer />
      <FaqSection />
    </>
  )
}

export default page
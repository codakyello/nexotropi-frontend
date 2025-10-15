import CoreFeatures from '@/components/root/home/CoreFeatures'
import FaqSection from '@/components/root/home/FaqSection'
import HeroSection from '@/components/root/home/Hero'
import Pioneer from '@/components/root/home/Pioneer'
import Pricing from '@/components/root/home/Pricing'
import SilentCrisis from '@/components/root/home/SilentCrisis'
import Solution from '@/components/root/home/Solution'
import Testimonials from '@/components/root/home/Testimonials'
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
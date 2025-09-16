import DashboardMetrics from '@/components/dashboard/DashboardMetrics'
import RecentActivity from '@/components/dashboard/RecentActivity'
import Link from 'next/link'
import React from 'react'

const page = () => {
    return (
        <div className='bg-gray-50'>
            <div className="relative bg-white rounded-lg p-8 mb-12">
                <div className="flex items-center justify-between">
                    {/* Left Content */}
                    <div className="flex-1 max-w-3xl">
                        <h1 className="text-2xl font-bold text-gray-900 mb-6 leading-tight">
                            Welcome to the NexusForge AI Platform
                        </h1>
                        <p className="text-base text-[#475467] leading-relaxed max-w-2xl">
                            We're glad to have you here. NexusForge AI gives you smart tools, insights, and a seamless experience to power your journey.
                        </p>
                    </div>

                    {/* Right CTA Button */}
                    <div className="flex-shrink-0 ml-8">
                        <Link href="/user/negotiation" className="cursor-pointer bg-[#1A4A7A] text-white px-6 py-3 rounded-lg font-normal text-base transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center">
                            Go to Negotiations
                        </Link>
                    </div>
                </div>
            </div>
            <DashboardMetrics />
            <RecentActivity />
        </div>
    )
}

export default page
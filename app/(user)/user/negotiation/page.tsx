import NegotiationsGrid from '@/components/negotiation/NegotiationsGrid'
import NegotiationTable from '@/components/negotiation/NegotiationTable'
import SearchNegotiation from '@/components/negotiation/SearchNegotiation'
import Link from 'next/link'
import React from 'react'

const page = () => {
    return (
        <div className='bg-gray-50 px-4 pb-10'>
            <div className="relative mb-12">
                <div className="flex items-center justify-between">
                    {/* Left Content */}
                    <div className="flex-1 max-w-3xl">
                        <h1 className="text-2xl font-bold text-gray-900 mb-6 leading-tight">
                            Negotiations
                        </h1>
                        <p className="text-base text-[#475467] leading-relaxed max-w-2xl">
                            Monitor and control AI-driven negotiations in real-time</p>
                    </div>

                    {/* Right CTA Button */}
                    <div className="flex-shrink-0 ml-8">
                        <Link href="/user/negotiation/new" className="cursor-pointer bg-[#1A4A7A] text-white px-6 py-3 rounded-lg font-normal text-base transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center">
                            Start New Negotiation
                        </Link>
                    </div>
                </div>
            </div>
            <SearchNegotiation />
        </div>
    )
}

export default page
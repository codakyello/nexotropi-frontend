"use client"
import NegotiationSummary from '@/components/users/negotiation/NegotiationSummary'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React from 'react'

const NegotiationSummaryPage = () => {
    const router = useRouter()
    return (
        <div className='bg-gray-50 px-4 pb-10'>
            <div className="mb-6">
                <button onClick={() => router.back()} className="flex items-center cursor-pointer text-gray-600 hover:text-gray-900 transition-colors duration-200 group">
                    <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
                    <span className="text-sm font-medium">Back to Negotiations</span>
                </button>
            </div>

            {/* Title and Status Section */}
            <div className="flex items-center gap-4 mb-3">
                <h1 className="text-2xl font-bold text-gray-900">Steel Materials</h1>
                <div className="px-3 py-1.5 bg-[#FEF5E7] text-[#F59E0B] rounded-full text-sm font-normal">
                    Ongoing
                </div>
            </div>

            {/* Creation Date */}
            <p className="text-gray-400 text-sm mb-12">
                Created: 01/08/2025
            </p>
            <NegotiationSummary />
        </div>
    )
}

export default NegotiationSummaryPage
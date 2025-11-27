"use client"
import NegotiationForm from '@/components/users/negotiation/NegotiationForm'
import NegotiationSummary from '@/components/users/negotiation/NegotiationSummary'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React from 'react'

const StartNegotiationPage = () => {
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
            <div className="flex flex-col gap-2 mb-10">
                <h1 className="text-2xl font-bold text-gray-900">Start New Negotiations</h1>
                <p className="text-sm font-normal text-gray-600">Monitor and control AI-driven negotiations in real-time.</p>
            </div>
            <NegotiationForm />
        </div>
    )
}

export default StartNegotiationPage
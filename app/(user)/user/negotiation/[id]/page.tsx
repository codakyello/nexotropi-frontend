"use client"
import NegotiationSummary from '@/components/users/negotiation/NegotiationSummary'
import RFQDrafting from '@/components/users/negotiation/RFQDrafting'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { use } from 'react'

const NegotiationSummaryPage = ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = use(params)
    const router = useRouter()
    return (
        <div className='w-full pb-10'>
            <div className="mb-6 mt-2">
                <button onClick={() => router.back()} className="flex items-center cursor-pointer text-muted-foreground hover:text-foreground transition-colors duration-300 group px-4 py-2 hover:bg-white/5 rounded-lg w-auto">
                    <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300 opacity-70" />
                    <span className="text-sm font-medium">Back</span>
                </button>
            </div>
            <RFQDrafting sessionId={id} />
            <NegotiationSummary />
        </div>
    )
}

export default NegotiationSummaryPage

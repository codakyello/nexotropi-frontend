import NetworkOverview from '@/components/users/ecosystem/NetworkOverview'
import React from 'react'

const page = () => {
    return (
        <div className='bg-gray-50'>
            <div className="bg-white rounded-lg p-8 mb-12">
                <div className="flex items-center justify-between">
                    {/* Left Content */}
                    <div className="flex-1 max-w-3xl">
                        <h1 className="text-2xl font-bold text-gray-900 mb-6 leading-tight">
                            Ecosystem
                        </h1>
                        <p className="text-base text-[#475467] leading-relaxed max-w-2xl">
                            Interactive view of your business relationships and dependencies.
                        </p>
                    </div>
                </div>
            </div>
            <NetworkOverview />
        </div>
    )
}

export default page
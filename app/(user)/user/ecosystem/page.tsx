import NetworkOverview from '@/components/users/ecosystem/NetworkOverview'
import React from 'react'
import Link from 'next/link'
import { Users, ArrowRight } from 'lucide-react'

const page = () => {
    return (
        <div className='bg-gray-50'>
            <div className="bg-white rounded-lg p-8 mb-6">
                <div className="flex items-center justify-between">
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

            {/* Quick links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <Link
                    href="/user/ecosystem/suppliers"
                    className="bg-white rounded-lg p-6 border border-gray-200 hover:border-[#1A4A7A] hover:shadow-sm transition-all group"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#E8EDF2] rounded-lg flex items-center justify-center">
                                <Users className="h-5 w-5 text-[#1A4A7A]" />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">Suppliers</p>
                                <p className="text-sm text-gray-500">Manage your supplier network</p>
                            </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-[#1A4A7A] transition-colors" />
                    </div>
                </Link>
            </div>

            <NetworkOverview />
        </div>
    )
}

export default page
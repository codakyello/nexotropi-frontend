import AdminMetrics from '@/components/admin/dashboard/AdminMetrics'
import AdminRecentActivity from '@/components/admin/dashboard/AdminRecentActivity'
import AdminStats from '@/components/admin/dashboard/AdminStats'
import { Eye } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const page = () => {
    return (
        <div className='bg-gray-50'>
            <div className="relative p-8 mb-12">
                <div className="flex items-center justify-between">
                    {/* Left Content */}
                    <div className="flex-1 max-w-3xl">
                        <h1 className="text-2xl font-bold text-gray-900 mb-6 leading-tight">
                            Dashboard Overview
                        </h1>
                        <p className="text-base text-[#475467] leading-relaxed max-w-2xl">
                            Your command center for platform insights and quick actions
                        </p>
                    </div>

                    {/* Right CTA Button */}
                    <div className="flex-shrink-0 ml-8">
                        <Link href="/" className="cursor-pointer gap-2 bg-[#1A4A7A] text-white px-6 py-3 rounded-lg font-normal text-base transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center">
                            <Eye size={18} />
                            View Site
                        </Link>
                    </div>
                </div>
            </div>
            <AdminMetrics />
            <AdminRecentActivity />
            <AdminStats />
        </div>
    )
}

export default page
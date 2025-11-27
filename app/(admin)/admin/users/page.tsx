import AdminMetrics from '@/components/admin/dashboard/AdminMetrics'
import AdminRecentActivity from '@/components/admin/dashboard/AdminRecentActivity'
import AdminStats from '@/components/admin/dashboard/AdminStats'
import UserManagement from '@/components/admin/user-management/UserManagement'
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
                            Users Management
                        </h1>
                        <p className="text-base text-[#475467] leading-relaxed max-w-2xl">
                            Monitor, verify, and manage all platform users
                        </p>
                    </div>
                </div>
            </div>
            <UserManagement />
        </div>
    )
}

export default page
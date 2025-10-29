import LogManagement from '@/components/admin/securityLogs/LogManagement'
import LogMetric from '@/components/admin/securityLogs/LogMetric'
import { ArrowUpFromLine, Eye } from 'lucide-react'
import React from 'react'

const page = () => {
    return (
        <div className='bg-gray-50'>
            <div className="relative p-8 ">
                <div className="flex items-center justify-between">
                    {/* Left Content */}
                    <div className="flex-1 max-w-3xl">
                        <h1 className="text-2xl font-bold text-gray-900 mb-6 leading-tight">
                            Security Logs
                        </h1>
                        <p className="text-base text-[#475467] leading-relaxed max-w-2xl">
                            Track and review all security-related activities to ensure transparency and accountability.
                        </p>
                    </div>
                    <div className="flex-shrink-0 ml-8">
                        <button className="cursor-pointer gap-2 bg-[#1A4A7A] text-white px-6 py-3 rounded-lg font-normal text-base transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center">
                            <ArrowUpFromLine size={18} />
                            Export Logs
                        </button>
                    </div>
                </div>
            </div>
            <LogMetric />
            <LogManagement />
        </div>
    )
}

export default page
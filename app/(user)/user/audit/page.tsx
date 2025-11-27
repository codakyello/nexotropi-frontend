import ActivityLogs from '@/components/users/audit-trail/ActivityLogs'
import { RefreshCcw, Upload } from 'lucide-react'
import React from 'react'

const page = () => {
    return (
        <div className='bg-gray-50 px-4 pb-10'>
            <div className="relative mb-12">
                <div className="flex items-center justify-between">
                    {/* Left Content */}
                    <div className="flex-1 max-w-3xl">
                        <h1 className="text-2xl font-bold text-gray-900 mb-6 leading-tight">
                            Audit Trail
                        </h1>
                        <p className="text-base text-[#475467] leading-relaxed max-w-2xl">
                            Comprehensive log of all AI decisions and user actions                        </p>
                    </div>

                    <div className="flex items-center gap-4 ml-8">
                        <button className="flex items-center gap-2 px-6 py-2.5 cursor-pointer bg-transparent rounded-lg font-medium border border-gray-300">
                            <RefreshCcw className="w-4 h-4" />
                            Refresh
                        </button>

                        {/* Export Button */}
                        <button className="flex items-center gap-2 px-6 py-2.5 cursor-pointer bg-[#1A4A7A] text-white rounded-lg font-medium transition-colors shadow-sm">
                            <Upload className="w-4 h-4" />
                            Export logs
                        </button>
                    </div>
                </div>
            </div>
            <ActivityLogs />
        </div>
    )
}

export default page
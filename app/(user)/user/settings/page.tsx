"use client"
import AccountSettings from '@/components/users/settings/AccountSettings'
import React, { useState } from 'react'

const page = () => {
    const [activeTab, setActiveTab] = useState("account")
    return (
        <div className='bg-gray-50'>
            <div className="rounded-lg p-8 mb-12">
                <div className="flex items-center justify-between">
                    {/* Left Content */}
                    <div className="flex-1 max-w-3xl">
                        <h1 className="text-2xl font-bold text-gray-900 mb-6 leading-tight">
                            Settings
                        </h1>
                        <p className="text-base text-[#475467] leading-relaxed max-w-2xl">
                            Manage your account, preferences, and security to personalize your NexusForge experience.
                        </p>
                    </div>
                </div>
            </div>
            <div className="flex gap-2 mx-6 p-1 bg-white w-max mb-8">
                <button onClick={() => setActiveTab('account')} className={`px-6 cursor-pointer py-2 rounded-none font-medium transition-colors ${activeTab === 'account'
                    ? 'bg-[#E8EDF2] text-gray-900'
                    : 'text-gray-600 hover:bg-gray-100'
                    }`}>
                    Account Settings
                </button>
                <button disabled onClick={() => setActiveTab('preferences')} className={`px-6 cursor-pointer py-2 rounded-none font-medium transition-colors ${activeTab === 'negotiations'
                    ? 'bg-[#E8EDF2] text-gray-900'
                    : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                    Preferences
                </button>
                <button disabled onClick={() => setActiveTab('security')} className={`px-6 cursor-pointer py-2 rounded-none font-medium transition-colors ${activeTab === 'reports'
                    ? 'bg-[#E8EDF2] text-gray-900'
                    : 'text-gray-600 hover:bg-gray-100'
                    }`}>
                    Security & Privacy
                </button>
                <button disabled onClick={() => setActiveTab('subscription')} className={`px-6 cursor-pointer py-2 rounded-none font-medium transition-colors ${activeTab === 'reports'
                    ? 'bg-[#E8EDF2] text-gray-900'
                    : 'text-gray-600 hover:bg-gray-100'
                    }`}>
                    Subscription & Billing
                </button>
                <button disabled onClick={() => setActiveTab('support')} className={`px-6 cursor-pointer py-2 rounded-none font-medium transition-colors ${activeTab === 'reports'
                    ? 'bg-[#E8EDF2] text-gray-900'
                    : 'text-gray-600 hover:bg-gray-100'
                    }`}>
                    Support & Help
                </button>
            </div>
            <div>
                {activeTab === "account" ? <AccountSettings /> : null}
            </div>
        </div>
    )
}

export default page
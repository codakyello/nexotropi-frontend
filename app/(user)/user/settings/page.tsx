"use client"
import AccountSettings from '@/components/users/settings/AccountSettings'
import React, { useState } from 'react'
import Link from 'next/link'
import { Mail, Building2, ChevronRight } from 'lucide-react'

const TAB_STYLE = (active: boolean) =>
    `px-6 cursor-pointer py-2 rounded-none font-medium transition-colors ${active ? 'bg-[#E8EDF2] text-gray-900' : 'text-gray-600 hover:bg-gray-100'}`

const UserSettings = () => {
    const [activeTab, setActiveTab] = useState("account")
    return (
        <div className='bg-gray-50'>
            <div className="rounded-lg p-8 mb-12">
                <div className="flex-1 max-w-3xl">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6 leading-tight">Settings</h1>
                    <p className="text-base text-[#475467] leading-relaxed max-w-2xl">
                        Manage your account, email integration, company profile, and preferences.
                    </p>
                </div>
            </div>

            <div className="flex gap-2 mx-6 p-1 bg-white w-max mb-8">
                <button onClick={() => setActiveTab('account')} className={TAB_STYLE(activeTab === 'account')}>
                    Account Settings
                </button>
                <button onClick={() => setActiveTab('integrations')} className={TAB_STYLE(activeTab === 'integrations')}>
                    Integrations
                </button>
                <button disabled onClick={() => setActiveTab('preferences')} className={TAB_STYLE(false)}>
                    Preferences
                </button>
                <button disabled onClick={() => setActiveTab('security')} className={TAB_STYLE(false)}>
                    Security & Privacy
                </button>
                <button disabled onClick={() => setActiveTab('subscription')} className={TAB_STYLE(false)}>
                    Subscription & Billing
                </button>
            </div>

            <div className="mx-6">
                {activeTab === "account" && <AccountSettings />}

                {activeTab === "integrations" && (
                    <div className="max-w-2xl space-y-3">
                        <Link href="/user/settings/email"
                            className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-5 py-4 hover:border-[#1A4A7A] hover:shadow-sm transition-all group">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                                    <Mail className="h-5 w-5 text-[#1A4A7A]" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">Email Connection</p>
                                    <p className="text-sm text-gray-500">Connect Gmail or Outlook via Nylas to enable AI negotiations</p>
                                </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-[#1A4A7A]" />
                        </Link>

                        <Link href="/user/settings/company"
                            className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-5 py-4 hover:border-[#1A4A7A] hover:shadow-sm transition-all group">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                                    <Building2 className="h-5 w-5 text-[#1A4A7A]" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">Company Profile</p>
                                    <p className="text-sm text-gray-500">Logo, branding colors, address, and legal info used on PDF RFQs</p>
                                </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-[#1A4A7A]" />
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}

export default UserSettings
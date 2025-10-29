"use client"
import HeroSectionManager from '@/components/admin/content-management/HeroSectionManager'
import ProblemSectionManager from '@/components/admin/content-management/ProblemSectionManager'
import SolutionSectionManager from '@/components/admin/content-management/SolutionSectionManager'
import React, { useState } from 'react'

const ContentManagement = () => {
    const [activeTab, setActiveTab] = useState('published');
    return (
        <div className='bg-gray-50'>
            <div className="relative p-8 mb-2">
                <div className="flex items-center justify-between">
                    {/* Left Content */}
                    <div className="flex-1 max-w-3xl">
                        <h1 className="text-2xl font-bold text-gray-900 mb-6 leading-tight">
                            Content Management
                        </h1>
                        <p className="text-base text-[#475467] leading-relaxed max-w-2xl">
                            Quickly update the most visible section of the landing page to keep it fresh and engaging.
                        </p>
                    </div>
                </div>
            </div>
            <div className="max-w-7xl mx-auto p-6">
                {/* Tabs */}
                <div className="flex gap-4 shadow-sm bg-white mb-6 p-1 rounded-sm w-max border-b">
                    <button
                        onClick={() => setActiveTab('published')}
                        className={`p-3 cursor-pointer rounded-sm ${activeTab === 'published'
                            ? 'bg-[#E8EDF2] text-[#1A4A7A] font-medium'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Published content
                    </button>
                    <button
                        onClick={() => setActiveTab('drafts')}
                        className={`py-3 px-6 cursor-pointer rounded-sm ${activeTab === 'drafts'
                            ? 'bg-[#E8EDF2] text-[#1A4A7A] font-medium'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Drafts
                    </button>
                </div>
            </div>
            <HeroSectionManager activeTab={activeTab} setActiveTab={setActiveTab} />
            <ProblemSectionManager activeTab={activeTab} setActiveTab={setActiveTab} />
            <SolutionSectionManager activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
    )
}

export default ContentManagement
"use client"
import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import OverviewMetrics from '@/components/users/analytics/OverviewMetrics';
import NegotiationMetrics from '@/components/users/analytics/NegotiationMetrics';
import ReportMetrics from '@/components/users/analytics/ReportMetrics';

const AnalyticsPage = () => {
    const [selectedPeriod, setSelectedPeriod] = useState('Last 30 days');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("overview")

    const periods = [
        'Last 7 days',
        'Last 30 days',
        'Last 90 days',
        'Last 6 months',
        'Last year',
        'All time'
    ];

    return (
        <div className='bg-gray-50'>
            <div className="relative rounded-lg p-8 mb-6">
                <div className="flex items-center justify-between">
                    {/* Left Content */}
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-gray-900 mb-3">
                            Analytics & Reporting
                        </h1>
                        <p className="text-gray-600 text-base">
                            Comprehensive insights into negotiation performance and outcome.
                        </p>
                    </div>

                    {/* Right Controls */}
                    <div className="flex items-center gap-4 ml-8">
                        {/* Time Period Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors min-w-[160px] justify-between"
                            >
                                <span>{selectedPeriod}</span>
                                <svg
                                    className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                    {periods.map((period) => (
                                        <button
                                            key={period}
                                            onClick={() => {
                                                setSelectedPeriod(period);
                                                setIsDropdownOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${selectedPeriod === period ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                                                }`}
                                        >
                                            {period}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Export Button */}
                        <button className="flex items-center gap-2 px-6 py-2.5 cursor-pointer bg-[#1A4A7A] text-white rounded-lg font-medium transition-colors shadow-sm">
                            <Upload className="w-4 h-4" />
                            Export Reports
                        </button>
                    </div>
                </div>
            </div>
            <div className="flex gap-2 mx-6 p-1 bg-white w-max mb-8">
                <button onClick={() => setActiveTab('overview')} className={`px-6 cursor-pointer py-2 rounded-none font-medium transition-colors ${activeTab === 'overview'
                    ? 'bg-[#E8EDF2] text-gray-900'
                    : 'text-gray-600 hover:bg-gray-100'
                    }`}>
                    Overview
                </button>
                <button onClick={() => setActiveTab('negotiations')} className={`px-6 cursor-pointer py-2 rounded-none font-medium transition-colors ${activeTab === 'negotiations'
                    ? 'bg-[#E8EDF2] text-gray-900'
                    : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                    Negotiations
                </button>
                <button onClick={() => setActiveTab('reports')} className={`px-6 cursor-pointer py-2 rounded-none font-medium transition-colors ${activeTab === 'reports'
                    ? 'bg-[#E8EDF2] text-gray-900'
                    : 'text-gray-600 hover:bg-gray-100'
                    }`}>
                    Reports
                </button>
            </div>
            <div>
                {activeTab === "overview" ? <OverviewMetrics /> : activeTab === "negotiations" ? <NegotiationMetrics /> : <ReportMetrics />}
            </div>
        </div>
    );
};

export default AnalyticsPage;
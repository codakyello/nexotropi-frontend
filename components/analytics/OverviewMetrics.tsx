"use client"
import React from 'react';
import { Database, Shield, MessageSquare, TrendingUp, TrendingDown, Plus } from 'lucide-react';
import OverviewMetricsChart from './OverviewMetricsChart';

const OverviewMetrics = () => {
    return (
        <div className="max-w-7xl mx-auto mb-3 p-6">
            {/* Top Row - 3 Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Total Negotiations */}
                <div className="bg-white rounded-xl p-6 border border-gray-100">
                    <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                            <Database className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="text-gray-700 font-medium">Total Negotiations</h3>
                    </div>
                    <div className="mb-3">
                        <p className="text-4xl font-bold text-gray-900">120</p>
                    </div>
                    <div className="flex items-center text-sm">
                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-green-500 font-medium">+2%</span>
                        <span className="text-gray-500 ml-1">compared to last month</span>
                    </div>
                </div>

                {/* Successful Deals */}
                <div className="bg-white rounded-xl p-6 border border-gray-100">
                    <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-[#E8EDF2] rounded-full flex items-center justify-center mr-4">
                            <MessageSquare className="w-6 h-6 text-[#1A4A7A]" />
                        </div>
                        <h3 className="text-gray-700 font-medium">Successful Deals (Win)</h3>
                    </div>
                    <div className="mb-3">
                        <p className="text-4xl font-bold text-gray-900">92 <span className="text-2xl text-gray-500">(72%)</span></p>
                    </div>
                    <div className="flex items-center text-sm">
                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-green-500 font-medium">+2%</span>
                        <span className="text-gray-500 ml-1">compared to last month</span>
                    </div>
                </div>

                {/* Unsuccessful Deals */}
                <div className="bg-white rounded-xl p-6 border border-gray-100">
                    <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                            <Shield className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="text-gray-700 font-medium">Unsuccessful Deals (Loss)</h3>
                    </div>
                    <div className="mb-3">
                        <p className="text-4xl font-bold text-gray-900">28 <span className="text-2xl text-gray-500">(23%)</span></p>
                    </div>
                    <div className="flex items-center text-sm">
                        <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                        <span className="text-red-500 font-medium">+2%</span>
                        <span className="text-gray-500 ml-1">compared to last month</span>
                    </div>
                </div>
            </div>

            {/* Middle Row - 3 Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Total Value Negotiated */}
                <div className="bg-white rounded-xl p-6 border border-gray-100">
                    <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                            <Database className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="text-gray-700 font-medium">Total Value Negotiated</h3>
                    </div>
                    <div className="mb-3">
                        <p className="text-4xl font-bold text-gray-900">$2,450,000</p>
                    </div>
                    <div className="flex items-center text-sm">
                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-green-500 font-medium">+2%</span>
                        <span className="text-gray-500 ml-1">compared to last month</span>
                    </div>
                </div>

                {/* AI-Secured Savings */}
                <div className="bg-white rounded-xl p-6 border border-gray-100">
                    <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-[#E8EDF2] rounded-full flex items-center justify-center mr-4">
                            <MessageSquare className="w-6 h-6 text-[#1A4A7A]" />
                        </div>
                        <h3 className="text-gray-700 font-medium">AI-Secured Savings/Gains</h3>
                    </div>
                    <div className="mb-3">
                        <p className="text-4xl font-bold text-gray-900">$315,000</p>
                    </div>
                    <div className="flex items-center text-sm">
                        <Plus className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-green-500 font-medium">2</span>
                        <span className="text-gray-500 ml-1">currently in progrss</span>
                    </div>
                </div>

                {/* Average Per Negotiation */}
                <div className="bg-white rounded-xl p-6 border border-gray-100">
                    <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                            <Shield className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="text-gray-700 font-medium">Average Per Negotiation</h3>
                    </div>
                    <div className="mb-3">
                        <p className="text-4xl font-bold text-gray-900">$3,425</p>
                    </div>
                    <div className="flex items-center text-sm">
                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-green-500 font-medium">+12%</span>
                    </div>
                </div>
            </div>

            {/* Bottom Row - 2 Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Closed Negotiations */}
                <div className="bg-white rounded-xl p-6 border border-gray-100">
                    <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                            <Database className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="text-gray-700 font-medium">Closed Negotiations</h3>
                    </div>
                    <div className="mb-3">
                        <p className="text-4xl font-bold text-gray-900">110 <span className="text-2xl text-gray-500">(91%)</span></p>
                    </div>
                    <div className="flex items-center text-sm">
                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-green-500 font-medium">+2%</span>
                        <span className="text-gray-500 ml-1">compared to last month</span>
                    </div>
                </div>

                {/* Abandoned/Expired */}
                <div className="bg-white rounded-xl p-6 border border-gray-100">
                    <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-[#E8EDF2] rounded-full flex items-center justify-center mr-4">
                            <MessageSquare className="w-6 h-6 text-[#1A4A7A]" />
                        </div>
                        <h3 className="text-gray-700 font-medium">Abandoned/Expired</h3>
                    </div>
                    <div className="mb-3">
                        <p className="text-4xl font-bold text-gray-900">10 <span className="text-2xl text-gray-500">(9%)</span></p>
                    </div>
                    <div className="flex items-center text-sm">
                        <Plus className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-green-500 font-medium">2</span>
                        <span className="text-gray-500 ml-1">currently in progrss</span>
                    </div>
                </div>
            </div>
            <OverviewMetricsChart />
        </div>
    );
};

export default OverviewMetrics;
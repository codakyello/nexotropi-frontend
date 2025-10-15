'use client';

import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

const NegotiationMetrics = () => {
    const [activeTab, setActiveTab] = useState('12 month');

    const chartData = [
        { month: 'Jan', value1: 15000, value2: 8000, value3: 3000 },
        { month: 'Feb', value1: 20000, value2: 10000, value3: 4000 },
        { month: 'Mar', value1: 21000, value2: 11000, value3: 2000 },
        { month: 'Apr', value1: 23000, value2: 12000, value3: 5000 },
        { month: 'May', value1: 24000, value2: 13000, value3: 3000 },
        { month: 'Jun', value1: 28000, value2: 16000, value3: 4000 },
        { month: 'Jul', value1: 30000, value2: 18000, value3: 10000 },
    ];

    return (
        <div className="max-w-7xl mx-auto mb-3 bg-white p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-3">
                    Negotiation Progress Tracking
                </h1>
                <p className="text-gray-600 text-sm">
                    Detailed view of active and completed negotiations
                </p>
            </div>

            {/* Main Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-8">
                {/* Negotiation Header */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-1">
                            Dataflow Inc - Analytics package
                        </h2>
                        <p className="text-sm text-gray-600">Started 2024-12-12</p>
                    </div>
                    <span className="px-3 py-2 bg-gray-100 text-[#1A4A7A] text-sm font-medium rounded">
                        in progress
                    </span>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-4 gap-6 mb-6">
                    <div>
                        <p className="text-sm text-gray-600 mb-1">Initial offer</p>
                        <p className="text-2xl font-bold text-gray-900">$2,000</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 mb-1">Current offer</p>
                        <p className="text-2xl font-bold text-teal-600">$1,500</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 mb-1">Target Price</p>
                        <p className="text-2xl font-bold text-gray-900">$1,000</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 mb-1">Savings</p>
                        <p className="text-2xl font-bold text-teal-600">$500</p>
                    </div>
                </div>

                {/* Price Convergence */}
                <h3 className="text-lg font-bold text-gray-900 mb-6">Price convergence</h3>

                {/* Line Charts Section */}
                <div className="mt-8 bg-gray-100 p-4 rounded-md">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-900">Line Charts</h3>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                            <span className="text-sm text-gray-600">Total Profits</span>
                        </div>
                    </div>

                    {/* Time Period Tabs */}
                    <div className="flex gap-2 mb-8 border-gray-200">
                        {['12 month', '30 days', '7 days', '24 hours'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-3 bg-white rounded-md py-2 border text-sm font-medium transition-colors ${activeTab === tab
                                    ? 'text-gray-900 border-b-2 border-gray-900'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Chart */}
                    <div className="h-96">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="0" stroke="#f0f0f0" vertical={false} />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                    ticks={[0, 10000, 20000, 30000, 40000, 50000, 60000]}
                                    tickFormatter={(value) => `${value / 1000}k`}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="value1"
                                    stroke="#6366F1"
                                    strokeWidth={3}
                                    dot={false}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="value2"
                                    stroke="#A5B4FC"
                                    strokeWidth={3}
                                    dot={false}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="value3"
                                    stroke="#C7D2FE"
                                    strokeWidth={3}
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Generate Report Button */}
                <div className="flex justify-end mt-8">
                    <button className="px-6 py-3 bg-[#1A4A7A] text-white font-medium rounded-lg transition-colors">
                        Generate report
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NegotiationMetrics;
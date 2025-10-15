"use client"
import React from 'react';
import { Database, Monitor, Shield, Users, FileText, Calendar, Network, TrendingUp, TrendingDown, Plus } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const DashboardMetrics = () => {
    const router = useRouter()
    return (
        <div className="max-w-7xl mx-auto mb-12">
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {/* Cost Savings Card */}
                <div className="bg-white rounded-xl p-6 border border-gray-100">
                    <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                            <Database className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="text-gray-700 font-medium">Cost Savings</h3>
                    </div>
                    <div className="mb-3">
                        <p className="text-3xl font-bold text-gray-900">$2,000</p>
                    </div>
                    <div className="flex items-center text-sm">
                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-green-500 font-medium">2.3%</span>
                        <span className="text-gray-500 ml-1">compared to last month</span>
                    </div>
                </div>

                {/* Active Negotiations Card */}
                <div className="bg-white rounded-xl p-6 border border-gray-100">
                    <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-[#E8EDF2] rounded-full flex items-center justify-center mr-4">
                            <Image src="/negotiate.svg" width={24} height={24} alt="negotiation" />
                        </div>
                        <h3 className="text-gray-700 font-medium">Active Negotiations</h3>
                    </div>
                    <div className="mb-3">
                        <p className="text-3xl font-bold text-gray-900">12</p>
                    </div>
                    <div className="flex items-center text-sm">
                        <Plus className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-green-500 font-medium">15%</span>
                        <span className="text-gray-500 ml-1">currently in progress</span>
                    </div>
                </div>

                {/* Supply Resilience Card */}
                <div className="bg-white rounded-xl p-6 border border-gray-100">
                    <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-[#FEF5E7] rounded-full flex items-center justify-center mr-4">
                            <Shield className="w-6 h-6 text-[#F59E0B]" />
                        </div>
                        <h3 className="text-gray-700 font-medium">Supply Resilience</h3>
                    </div>
                    <div className="mb-3">
                        <p className="text-3xl font-bold text-gray-900">91%</p>
                    </div>
                    <div className="flex items-center text-sm">
                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-green-500 font-medium">+12%</span>
                        <span className="text-gray-500 ml-1">Risk assessment score</span>
                    </div>
                </div>

                {/* Supplier Relationships Card */}
                <div className="bg-white rounded-xl p-6 border border-gray-100">
                    <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mr-4">
                            <Users className="w-6 h-6 text-gray-600" />
                        </div>
                        <h3 className="text-gray-700 font-medium">Supplier Relationships</h3>
                    </div>
                    <div className="mb-3">
                        <p className="text-3xl font-bold text-gray-900">47</p>
                    </div>
                    <div className="flex items-center text-sm">
                        <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                        <span className="text-red-500 font-medium">2%</span>
                        <span className="text-gray-500 ml-1">Active partnerships</span>
                    </div>
                </div>
            </div>

            {/* Quick Actions Section */}
            <div className='bg-white p-8 rounded-lg'>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Start new negotiation */}
                    <button onClick={() => router.push("/user/negotiation")} className="bg-[#F6F6F6] cursor-pointer rounded-xl px-4 border border-gray-100 hover:shadow-md transition-shadow duration-200 text-left group">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mr-4 transition-colors duration-200">
                                <FileText className="w-6 h-6 text-gray-600" />
                            </div>
                            <h3 className="text-gray-900 font-medium">Start new negotiation</h3>
                        </div>
                    </button>

                    {/* Generate report */}
                    <button className="bg-[#F6F6F6] cursor-pointer rounded-xl px-4 border border-gray-100 hover:shadow-md transition-shadow duration-200 text-left group">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mr-4 transition-colors duration-200">
                                <Calendar className="w-6 h-6 text-gray-600" />
                            </div>
                            <h3 className="text-gray-900 font-medium">Generate report</h3>
                        </div>
                    </button>

                    {/* View Ecosystem */}
                    <button onClick={() => router.push("/user/ecosystem")} className="bg-[#F6F6F6] cursor-pointer rounded-xl px-4 border border-gray-100 hover:shadow-md transition-shadow duration-200 text-left group">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mr-4 transition-colors duration-200">
                                <Network className="w-6 h-6 text-gray-600" />
                            </div>
                            <h3 className="text-gray-900 font-medium">View Ecosystem</h3>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DashboardMetrics;
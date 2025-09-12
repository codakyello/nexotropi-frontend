"use client"
import React, { useState } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

const ContactSection = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        company: '',
        message: ''
    });

    const handleInputChange = (e:any) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = () => {
        // Handle form submission logic here
        console.log('Form submitted:', formData);
    };

    return (
        <div className="min-h-screen py-8 lg:py-16 px-4 sm:px-6 lg:px-8 lg:mt-[-6rem]">
            <div className="max-w-6xl mx-auto">

                {/* Main Content Grid - Mobile: Stack vertically with contact first, Desktop: Side by side */}
                <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 lg:gap-12">

                    {/* Get in Touch Section - Order 1 on mobile, Order 1 on desktop */}
                    <div className="bg-white rounded-xl lg:rounded-2xl col-span-1 p-4 sm:p-6 shadow-lg lg:shadow-2xl order-2 sm:order-1">
                        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6 lg:mb-8">Get in Touch</h2>

                        <div className="space-y-4 lg:space-y-6">
                            {/* Email Us */}
                            <div className="bg-[#E8EDF2] rounded-lg lg:rounded-xl p-4 lg:p-6">
                                <div className="flex items-center mb-3 lg:mb-4">
                                    <Mail className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600 mr-2 lg:mr-3" />
                                    <h3 className="font-semibold text-gray-900 text-sm lg:text-base">Email Us</h3>
                                </div>
                                <div className="space-y-1 lg:space-y-2 text-xs lg:text-sm text-gray-600">
                                    <p><span className="font-medium">General Inquiries:</span> support@nexusforge.ai</p>
                                    <p><span className="font-medium">Sales & Partnerships:</span> sales@nexusforge.ai</p>
                                    <p><span className="font-medium">Press & Media:</span> media@nexusforge.ai</p>
                                </div>
                            </div>

                            {/* Call Us */}
                            <div className="bg-[#E8EDF2] rounded-lg lg:rounded-xl p-4 lg:p-6">
                                <div className="flex items-center mb-3 lg:mb-4">
                                    <Phone className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600 mr-2 lg:mr-3" />
                                    <h3 className="font-semibold text-gray-900 text-sm lg:text-base">Call Us</h3>
                                </div>
                                <div className="space-y-1 lg:space-y-2 text-xs lg:text-sm text-gray-600">
                                    <p><span className="font-medium">US Office:</span> +1 (xxx) xxx-xxxx</p>
                                    <p><span className="font-medium">UK Office:</span> +44 (xxxx) xxx-xxx</p>
                                </div>
                            </div>

                            {/* Visit Us */}
                            <div className="bg-[#E8EDF2] rounded-lg lg:rounded-xl p-4 lg:p-6">
                                <div className="flex items-center mb-3 lg:mb-4">
                                    <MapPin className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600 mr-2 lg:mr-3" />
                                    <h3 className="font-semibold text-gray-900 text-sm lg:text-base">Visit us</h3>
                                </div>
                                <div className="text-xs lg:text-sm text-gray-600">
                                    <p className="font-medium mb-1">Headquarters:</p>
                                    <p>123 Innovation Drive,</p>
                                    <p>San Francisco, CA, 94105, USA</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form - Order 2 on mobile, Order 2 on desktop */}
                    <div className="bg-white col-span-2 rounded-xl lg:rounded-2xl p-6 lg:p-8 shadow-lg lg:shadow-2xl order-1 sm:order-2">
                        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6 lg:mb-8">Contact form</h2>

                        <div className="space-y-4 lg:space-y-6">
                            {/* Full Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Full name*
                                </label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    placeholder="Enter Full name"
                                    className="w-full px-3 lg:px-4 py-2.5 lg:py-3 border border-gray-200 rounded-lg bg-gray-50 transition-colors text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-[#1A4A7A] focus:border-transparent"
                                />
                            </div>

                            {/* Work Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Work Email Address*
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="chioma@kargoo.io"
                                    className="w-full px-3 lg:px-4 py-2.5 lg:py-3 border border-gray-200 rounded-lg bg-gray-50 transition-colors text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-[#1A4A7A] focus:border-transparent"
                                />
                            </div>

                            {/* Company */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Company / Organization*
                                </label>
                                <input
                                    type="text"
                                    name="company"
                                    value={formData.company}
                                    onChange={handleInputChange}
                                    placeholder="Enter company name"
                                    className="w-full px-3 lg:px-4 py-2.5 lg:py-3 border border-gray-200 rounded-lg bg-gray-50 transition-colors text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-[#1A4A7A] focus:border-transparent"
                                />
                            </div>

                            {/* Message */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Message
                                </label>
                                <textarea
                                    name="message"
                                    rows={4}
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    placeholder="Enter message"
                                    className="w-full px-3 lg:px-4 py-2.5 lg:py-3 border border-gray-200 rounded-lg bg-gray-50 resize-none transition-colors text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-[#1A4A7A] focus:border-transparent"
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                onClick={handleSubmit}
                                className="w-full bg-[#1A4A7A] text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 text-sm lg:text-base"
                            >
                                Send message
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ContactSection;
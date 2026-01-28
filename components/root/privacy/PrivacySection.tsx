"use client"
import React, { useState } from 'react';

const PrivacySection = () => {
    const [activeSection, setActiveSection] = useState('introduction');

    const tableOfContents = [
        { id: 'introduction', title: 'Introduction' },
        { id: 'information', title: 'Information We Collect' },
        { id: 'usage', title: 'How We Use Information' },
        { id: 'processing', title: 'Data Processing Role' },
        { id: 'sharing', title: 'Data Sharing' },
        { id: 'security', title: 'Data Security' },
        { id: 'retention', title: 'Data Retention' },
        { id: 'rights', title: 'Your Rights' },
        { id: 'transfers', title: 'International Transfers' },
        { id: 'cookies', title: 'Cookies' },
        { id: 'children', title: 'Children\'s Privacy' },
        { id: 'contact', title: 'Contact' },
    ];

    const scrollToSection = (sectionId: string) => {
        setActiveSection(sectionId);
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-4 gap-2">

                    {/* Table of Contents Sidebar */}
                    <div className="lg:col-span-1 h-max hidden sm:flex">
                        <div className="bg-white rounded-lg px-8 p-6 sticky top-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-6">Table of Contents</h3>
                            <nav className="space-y-3">
                                {tableOfContents.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => scrollToSection(item.id)}
                                        className={`block w-full text-left text-sm cursor-pointer transition-colors duration-200 hover:text-[#1A4A7A] ${activeSection === item.id
                                            ? 'text-[#1A4A7A] font-medium'
                                            : 'text-gray-600'
                                            }`}
                                    >
                                        {item.title}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-lg p-6 sm:p-8">

                            {/* Header */}
                            <div className="mb-12">
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
                                <p className="text-gray-600">Last Updated: January 2026</p>
                            </div>

                            {/* Section 1 */}
                            <section id="introduction" className="mb-12">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Introduction</h2>
                                <p className="text-gray-700 leading-relaxed">
                                    Nexotropi, Inc. ("Nexotropi," "we," "us," or "our") operates the Nexotropi.com website and
                                    SaaS platform for B2B supply chain solutions.
                                </p>
                            </section>

                            {/* Section 2 */}
                            <section id="information" className="mb-12">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">2. Information We Collect</h2>
                                <p className="text-gray-700 leading-relaxed">
                                    We collect business contact information, account data, customer-provided supply chain data,
                                    and technical usage data necessary to operate the platform.
                                </p>
                            </section>

                            {/* Section 3 */}
                            <section id="usage" className="mb-12">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">3. How We Use Information</h2>
                                <p className="text-gray-700 leading-relaxed">
                                    Information is used to deliver services, maintain security, improve performance, and comply
                                    with legal obligations.
                                </p>
                            </section>

                            {/* Section 4 */}
                            <section id="processing" className="mb-12">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Data Processing Role</h2>
                                <p className="text-gray-700 leading-relaxed">
                                    Nexotropi acts as a data processor; customers remain data controllers for Customer Data.
                                </p>
                            </section>

                            {/* Section 5 */}
                            <section id="sharing" className="mb-12">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">5. Data Sharing</h2>
                                <p className="text-gray-700 leading-relaxed">
                                    We do not sell data. Information is shared only with service providers, integrations authorized
                                    by customers, or as required by law.
                                </p>
                            </section>

                            {/* Section 6 */}
                            <section id="security" className="mb-12">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">6. Data Security</h2>
                                <p className="text-gray-700 leading-relaxed">
                                    We apply administrative, technical, and organizational safeguards including encryption and
                                    access controls.
                                </p>
                            </section>

                            {/* Section 7 */}
                            <section id="retention" className="mb-12">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">7. Data Retention</h2>
                                <p className="text-gray-700 leading-relaxed">
                                    Data is retained only as long as necessary or contractually required.
                                </p>
                            </section>

                            {/* Section 8 */}
                            <section id="rights" className="mb-12">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">8. Your Rights</h2>
                                <p className="text-gray-700 leading-relaxed">
                                    Users may request access, correction, or deletion through their employer or Nexotropi.
                                </p>
                            </section>

                            {/* Section 9 */}
                            <section id="transfers" className="mb-12">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">9. International Transfers</h2>
                                <p className="text-gray-700 leading-relaxed">
                                    Data may be processed in the United States or other jurisdictions with appropriate safeguards.
                                </p>
                            </section>

                            {/* Section 10 */}
                            <section id="cookies" className="mb-12">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">10. Cookies</h2>
                                <p className="text-gray-700 leading-relaxed">
                                    Cookies are used for functionality and analytics. Browser controls may limit usage.
                                </p>
                            </section>

                            {/* Section 11 */}
                            <section id="children" className="mb-12">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">11. Children&apos;s Privacy</h2>
                                <p className="text-gray-700 leading-relaxed">
                                    The platform is not intended for individuals under 18.
                                </p>
                            </section>

                            {/* Section 12 */}
                            <section id="contact" className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">12. Contact</h2>
                                <div className="bg-blue-50 border border-blue-100 rounded-lg p-6">
                                    <p className="text-gray-900 font-semibold mb-1">Nexotropi, Inc.</p>
                                    <p className="text-gray-700 mb-1">
                                        <span className="font-medium">Email:</span> <span className="text-[#1A4A7A] font-medium">privacy@nexotropi.com</span>
                                    </p>
                                    <p className="text-gray-700">
                                        <span className="font-medium">Website:</span> <a href="https://www.nexotropi.com" className="text-[#1A4A7A] font-medium hover:underline">https://www.nexotropi.com</a>
                                    </p>
                                </div>
                            </section>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacySection;
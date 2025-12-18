import React from 'react';
import { Database, Cpu, BarChart3, Users, Brain, Zap, Eye, Settings, RefreshCw } from 'lucide-react';

const CoreFeatures = () => {
    const features = [
        {
            category: "Ecosystem Generation & Digital Replication",
            items: [
                {
                    icon: <Database className="w-5 h-5 text-emerald-400" />,
                    title: "Multimodal Data Ingestion",
                    description: "A secure system for ingesting and harmonizing data from multiple sources, including structu..."
                },
                {
                    icon: <Cpu className="w-5 h-5 text-emerald-400" />,
                    title: "LLM-Driven Replication Engine",
                    description: "Advanced AI engine using custom Large Language Models"
                },
                {
                    icon: <BarChart3 className="w-5 h-5 text-emerald-400" />,
                    title: "Dynamic Visualization",
                    description: "Interactive dashboard for complex business relationships"
                }
            ]
        },
        {
            category: "Autonomous Interaction & Negotiation Engine",
            items: [
                {
                    icon: <Users className="w-5 h-5 text-emerald-400" />,
                    title: "Multi-Agent Game Theory Framework",
                    description: "Orchestrates intelligent AI agents for sophisticated negotiations"
                },
                {
                    icon: <Brain className="w-5 h-5 text-emerald-400" />,
                    title: "Predictive Outcome Simulation",
                    description: "Run 'what-if' scenarios with millions of potential interactions"
                },
                {
                    icon: <Eye className="w-5 h-5 text-emerald-400" />,
                    title: "Human-in-the-Loop Controls",
                    description: "Full control mechanisms for monitoring and intervention"
                }
            ]
        },
        {
            category: "Real-World Integration & Optimization",
            items: [
                {
                    icon: <Zap className="w-5 h-5 text-emerald-400" />,
                    title: "Reinforcement Learning",
                    description: "Self-improving platform through continuous learning"
                },
                {
                    icon: <Settings className="w-5 h-5 text-emerald-400" />,
                    title: "API & Smart Contract Integration",
                    description: "Robust framework for real-world action execution"
                },
                {
                    icon: <RefreshCw className="w-5 h-5 text-emerald-400" />,
                    title: "Real-time Optimization",
                    description: "Dynamic adjustments for operational efficiency"
                }
            ]
        }
    ];

    return (
        <section id="features" className="min-h-screen bg-[#6E56A4] py-20 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-[1.7rem] sm:text-[2rem] font-bold text-white mb-6">
                        Nexotropi: Core Features
                    </h1>
                    <p className="text-base text-slate-300 max-w-4xl mx-auto leading-relaxed">
                        Nexotropi&apos;s platform is built to deliver a comprehensive, intelligent, and autonomous solution for inter-<br></br>enterprise B2B interactions.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid lg:grid-cols-3 gap-8">
                    {features.map((category, categoryIndex) => (
                        <div
                            key={categoryIndex}
                            className="bg-[#E3E3E31A] backdrop-blur-sm rounded-2xl p-8 transition-all duration-300"
                        >
                            {/* Category Title */}
                            <h2 className="text-xl font-semibold text-white mb-8 leading-tight">
                                {category.category}
                            </h2>

                            {/* Feature Items */}
                            <div className="space-y-8">
                                {category.items.map((item, itemIndex) => (
                                    <div key={itemIndex} className="group">
                                        <div className="flex items-start space-x-4">
                                            <div className="flex-shrink-0 p-2 bg-emerald-400/10 rounded-lg group-hover:bg-emerald-400/20 transition-colors duration-200">
                                                {item.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-white font-medium mb-2 group-hover:text-emerald-300 transition-colors duration-200">
                                                    {item.title}
                                                </h3>
                                                <p className="text-slate-400 text-sm leading-relaxed">
                                                    {item.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Optional CTA or Additional Content */}
                <div className="text-center mt-16">
                    <div className="inline-flex items-center space-x-2 text-emerald-400">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium">Powered by Advanced AI Technology</span>
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CoreFeatures;
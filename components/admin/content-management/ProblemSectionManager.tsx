"use client"
import React, { useState } from 'react';
import { Pencil, ExternalLink, X } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface ProblemSectionManagerProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const ProblemSectionManager = ({ activeTab, setActiveTab }: ProblemSectionManagerProps) => {
    const [publishedData, setPublishedData] = useState({
        mainHeadline: 'The Silent Crisis in B2B',
        subHeadline: 'The way companies interact today is analog, inefficient, and brittle. This "gap" costs your business billions.',
        pillars: [
            {
                id: 1,
                headline: 'High Negotiation Costs',
                subHeadline: 'Billions are lost annually to manual processes, legal fees, and wasted human capital on repetitive haggling.'
            },
            {
                id: 2,
                headline: 'Fragile Supply Chains',
                subHeadline: 'Businesses are reactive to disruptions, costing trillions in lost revenue due to a lack of proactive foresight and adaptation.'
            },
            {
                id: 3,
                headline: 'Slow Decisions',
                subHeadline: 'Human analytical capacity is a bottleneck, preventing businesses from responding quickly in dynamic markets.'
            }
        ],
        status: 'published',
        lastUpdated: '2 hours ago'
    });

    const [draftData, setDraftData] = useState({
        mainHeadline: 'Modern B2B Challenges Require New Solutions',
        subHeadline: 'Traditional business methods are holding companies back from reaching their full potential.',
        pillars: [
            {
                id: 1,
                headline: 'Inefficient Processes',
                subHeadline: 'Manual workflows and outdated systems drain resources and reduce competitiveness in the market.'
            },
            {
                id: 2,
                headline: 'Limited Visibility',
                subHeadline: 'Companies struggle with data silos and lack real-time insights into operations and opportunities.'
            },
            {
                id: 3,
                headline: 'Scaling Difficulties',
                subHeadline: 'Growth is hampered by infrastructure that cannot adapt quickly to changing business demands.'
            }
        ],
        status: 'draft',
        lastUpdated: '1 hour ago'
    });

    const [showEditModal, setShowEditModal] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [editingType, setEditingType] = useState('published');

    const currentData = activeTab === 'published' ? publishedData : draftData;
    const editData = editingType === 'published' ? publishedData : draftData;
    const setEditData = editingType === 'published' ? setPublishedData : setDraftData;

    const handleSaveToDraft = () => {
        if (editingType === 'published') {
            setPublishedData(prev => ({ ...prev, status: 'draft' }));
        } else {
            setDraftData(prev => ({ ...prev, status: 'draft' }));
        }
        setShowEditModal(false);
        setShowPreviewModal(false);
    };

    const handlePublish = () => {
        if (editingType === 'drafts') {
            setPublishedData({ ...draftData, status: 'published' });
        } else {
            setPublishedData(prev => ({ ...prev, status: 'published' }));
        }
        setShowEditModal(false);
        setShowPreviewModal(false);
    };

    const handlePublishDraft = () => {
        setPublishedData({ ...draftData, status: 'published' });
        setActiveTab('published');
    };

    const handlePreview = () => {
        setShowEditModal(false);
        setShowPreviewModal(true);
    };

    const handleEdit = (type: string) => {
        setEditingType(type);
        setShowEditModal(true);
    };

    const updatePillar = (pillarId: any, field: any, value: any) => {
        setEditData(prev => ({
            ...prev,
            pillars: prev.pillars.map(pillar =>
                pillar.id === pillarId ? { ...pillar, [field]: value } : pillar
            )
        }));
    };

    return (
        <div className="max-w-7xl mx-auto px-6 pb-6">
            {/* Problem Section Card */}
            <div className="bg-white border border-gray-200 rounded-lg mb-6">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <div>
                        <h3 className="font-semibold mb-2">Problem Section Editor</h3>
                        <p className="text-sm text-gray-500">Edit headlines, sub-headlines, and the three pillar sections</p>
                    </div>
                    <div className="flex gap-6">
                        <button
                            onClick={() => handleEdit(activeTab === 'published' ? 'published' : 'drafts')}
                            className="flex cursor-pointer items-center gap-2 text-gray-700 hover:text-gray-900"
                        >
                            <Pencil size={16} />
                            Edit
                        </button>
                        {activeTab === 'drafts' && (
                            <button
                                onClick={handlePublishDraft}
                                className="flex cursor-pointer items-center gap-2 px-4 py-2 bg-[#1A4A7A] text-white rounded hover:bg-[#153a5f]"
                            >
                                <ExternalLink size={16} />
                                Publish
                            </button>
                        )}
                    </div>
                </div>

                {/* Preview */}
                <div className="p-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4 text-gray-900">{currentData.mainHeadline}</h2>
                        <p className="text-base text-gray-600 max-w-3xl mx-auto">
                            {currentData.subHeadline}
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                        {currentData.pillars.map((pillar) => (
                            <div key={pillar.id} className="bg-white border border-gray-200 rounded-lg p-6 relative">
                                <div className="absolute -top-4 left-6 text-6xl font-bold text-gray-100">
                                    0{pillar.id}
                                </div>
                                <div className="relative pt-8">
                                    <h3 className="text-xl font-semibold mb-3 text-gray-900">{pillar.headline}</h3>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        {pillar.subHeadline}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Status Footer */}
                <div className="px-6 py-3 bg-gray-50 rounded-b-lg flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        {activeTab === 'published' ? (
                            <>
                                <span className="text-green-600">✓</span>
                                <span className="text-sm text-green-600 font-medium">Published</span>
                            </>
                        ) : (
                            <>
                                <span className="text-orange-500">✓</span>
                                <span className="text-sm text-orange-500 font-medium">Saved as Drafts</span>
                            </>
                        )}
                    </div>
                    <span className="text-sm text-gray-500">Last updated {currentData.lastUpdated}</span>
                </div>
            </div>

            {/* Edit Dialog */}
            <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Problem section</DialogTitle>
                    </DialogHeader>

                    {/* Main Headlines */}
                    <div className="space-y-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Main Headline
                            </label>
                            <input
                                type="text"
                                value={editData.mainHeadline}
                                onChange={(e) => setEditData(prev => ({ ...prev, mainHeadline: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Sub-Headline
                            </label>
                            <textarea
                                value={editData.subHeadline}
                                onChange={(e) => setEditData(prev => ({ ...prev, subHeadline: e.target.value }))}
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Pillars */}
                    {editData.pillars.map((pillar, index) => (
                        <div key={pillar.id} className="mb-6 pb-6 border-b border-gray-200 last:border-b-0">
                            <h4 className="font-semibold mb-4">Pillar {pillar.id}</h4>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Problem Headline
                                    </label>
                                    <input
                                        type="text"
                                        value={pillar.headline}
                                        onChange={(e) => updatePillar(pillar.id, 'headline', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Problem Sub-Headline
                                    </label>
                                    <textarea
                                        value={pillar.subHeadline}
                                        onChange={(e) => updatePillar(pillar.id, 'subHeadline', e.target.value)}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Action Buttons */}
                    <div className="flex justify-between pt-4 border-t">
                        <button
                            onClick={() => setShowEditModal(false)}
                            className="px-4 py-2 cursor-pointer text-gray-700 hover:text-gray-900"
                        >
                            Cancel
                        </button>
                        <div className="flex gap-3">
                            <button
                                onClick={handleSaveToDraft}
                                className="px-6 py-2 border cursor-pointer border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Save to draft
                            </button>
                            <button
                                onClick={handlePreview}
                                className="px-6 py-2 bg-[#1A4A7A] cursor-pointer text-white rounded-md hover:bg-[#153a5f]"
                            >
                                Preview
                            </button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Preview Dialog */}
            <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
                <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Problem section preview</DialogTitle>
                        <DialogDescription>Take a quick look at your problem section before publishing</DialogDescription>
                    </DialogHeader>

                    {/* Preview Content */}
                    <div className="mt-4">
                        <div className="text-center mb-12">
                            <h1 className="text-4xl font-bold mb-4 text-gray-900">{editData.mainHeadline}</h1>
                            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                                {editData.subHeadline}
                            </p>
                        </div>

                        <div className="grid grid-cols-3 gap-6">
                            {editData.pillars.map((pillar) => (
                                <div key={pillar.id} className="bg-white border border-gray-200 rounded-lg p-6 relative">
                                    <div className="absolute -top-4 left-6 text-6xl font-bold text-gray-100">
                                        0{pillar.id}
                                    </div>
                                    <div className="relative pt-8">
                                        <h3 className="text-xl font-semibold mb-3 text-gray-900">{pillar.headline}</h3>
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            {pillar.subHeadline}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-center gap-4 mt-6 pt-4 border-t">
                        <button
                            onClick={() => setShowPreviewModal(false)}
                            className="px-6 py-2 cursor-pointer text-gray-700 hover:text-gray-900"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSaveToDraft}
                            className="px-6 py-2 border cursor-pointer border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Save to draft
                        </button>
                        <button
                            onClick={handlePublish}
                            className="px-6 py-2 bg-[#1A4A7A] cursor-pointer text-white rounded-md hover:bg-[#153a5f]"
                        >
                            Publish
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ProblemSectionManager;
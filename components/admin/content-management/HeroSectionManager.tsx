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

interface HeroSectionManagerProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const HeroSectionManager = ({ activeTab, setActiveTab }: HeroSectionManagerProps) => {
    const [heroData, setHeroData] = useState({
        layoutType: 'centered',
        mainHeadline: 'The Future of B2B Commerce is Autonomous',
        subHeadline: 'Nexotropi enables autonomous negotiation and strategic simulation by creating living digital ecosystems of your business.',
        primaryCTA: 'Join Waitlist',
        secondaryCTA: 'Learn More',
        heroImage: null,
        status: 'published',
        lastUpdated: '2 hours ago'
    });

    const [draftData, setDraftData] = useState({
        layoutType: 'split',
        mainHeadline: 'Transform Your Business with AI-Powered Solutions',
        subHeadline: 'Experience the next generation of autonomous commerce and strategic decision-making.',
        primaryCTA: 'Get Started',
        secondaryCTA: 'View Demo',
        heroImage: null,
        status: 'draft',
        lastUpdated: '1 hour ago'
    });

    const [showEditModal, setShowEditModal] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [previewLayout, setPreviewLayout] = useState('centered');
    const [editingType, setEditingType] = useState('published');

    const layoutOptions = [
        {
            type: 'centered',
            title: 'Centered Content',
            description: 'Headline, text, and CTA buttons centered on the screen with a background image.',
            note: 'Minimalist and impactful look.'
        },
        {
            type: 'video',
            title: 'Video Background',
            description: 'Headline & CTA layered over a looping video background.',
            note: 'Engaging, great for storytelling products.'
        },
        {
            type: 'split',
            title: 'Split Screen',
            description: 'Left: Headline & text. Right: Image or illustration (or video).',
            note: 'Great for visual storytelling.'
        },
        {
            type: 'carousel',
            title: 'Carousel / Slider',
            description: 'Rotating slides with different messaging or visuals.',
            note: 'To showcase multiple key features upfront.'
        }
    ];

    const currentData = activeTab === 'published' ? heroData : draftData;
    const setCurrentData = activeTab === 'published' ? setHeroData : setDraftData;

    const handleSaveToDraft = () => {
        if (editingType === 'published') {
            setHeroData(prev => ({ ...prev, status: 'draft' }));
        } else {
            setDraftData(prev => ({ ...prev, status: 'draft' }));
        }
        setShowEditModal(false);
    };

    const handlePublish = () => {
        if (editingType === 'drafts') {
            setHeroData({ ...draftData, status: 'published' });
        } else {
            setHeroData(prev => ({ ...prev, status: 'published' }));
        }
        setShowEditModal(false);
        setShowPreviewModal(false);
    };

    const handlePublishDraft = () => {
        setHeroData({ ...draftData, status: 'published' });
        setActiveTab('published');
    };

    const handlePreview = () => {
        setShowEditModal(false);
        setShowPreviewModal(true);
        const data = editingType === 'published' ? heroData : draftData;
        setPreviewLayout(data.layoutType);
    };

    const handleEdit = (type: string) => {
        setEditingType(type);
        const data = type === 'published' ? heroData : draftData;
        setPreviewLayout(data.layoutType);
        setShowEditModal(true);
    };

    const editData = editingType === 'published' ? heroData : draftData;
    const setEditData = editingType === 'published' ? setHeroData : setDraftData;

    return (
        <div className="max-w-7xl mx-auto px-6 pb-6">
            {/* Hero Section Card */}
            <div className="bg-white border border-gray-200 rounded-lg mb-6">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <div>
                        <h3 className="font-semibold mb-2">Hero Section Editor</h3>
                        <p className="text-sm text-gray-500">Edit the main headline, subheadline, images and CTA buttons</p>
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
                    <div style={{ backgroundImage: "url('/hero.png')" }} className="text-white rounded-lg p-12 text-center">
                        <h2 className="text-3xl font-bold mb-4">{currentData.mainHeadline}</h2>
                        <p className="text-base mb-6 max-w-2xl mx-auto opacity-90">
                            {currentData.subHeadline}
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button className="px-5 py-2 bg-white text-blue-900 rounded font-medium">
                                {currentData.primaryCTA}
                            </button>
                            <button className="px-5 py-2 border-2 border-white text-white rounded font-medium">
                                {currentData.secondaryCTA}
                            </button>
                        </div>
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
                <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Hero section</DialogTitle>
                    </DialogHeader>

                    {/* Layout Selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Hero Section Style
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            {layoutOptions.map((layout) => (
                                <button
                                    key={layout.type}
                                    onClick={() => {
                                        setEditData(prev => ({ ...prev, layoutType: layout.type }));
                                        setPreviewLayout(layout.type);
                                    }}
                                    className={`p-4 border rounded-lg text-left transition ${editData.layoutType === layout.type
                                        ? 'border-blue-900 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className={`font-semibold mb-1 ${editData.layoutType === layout.type ? 'text-blue-900' : 'text-gray-900'
                                        }`}>
                                        {layout.title}
                                    </div>
                                    <div className="text-xs text-gray-600 mb-2">{layout.description}</div>
                                    <div className="text-xs text-gray-500 italic">{layout.note}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Main Headline */}
                    <div className="mb-4">
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

                    {/* Sub-Headline */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Sub-Headline
                        </label>
                        <textarea
                            value={editData.subHeadline}
                            onChange={(e) => setEditData(prev => ({ ...prev, subHeadline: e.target.value }))}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Primary CTA */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Primary CTA Button
                        </label>
                        <input
                            type="text"
                            value={editData.primaryCTA}
                            onChange={(e) => setEditData(prev => ({ ...prev, primaryCTA: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Secondary CTA */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Secondary CTA Button
                        </label>
                        <input
                            type="text"
                            value={editData.secondaryCTA}
                            onChange={(e) => setEditData(prev => ({ ...prev, secondaryCTA: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Hero Image Upload */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Hero Image
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                            <div className="text-gray-400 mb-2">↑</div>
                            <div className="text-sm text-gray-600">Drag and drop</div>
                        </div>
                    </div>

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
                                className="px-6 py-2 bg-[#1A4A7A] cursor-pointer text-white rounded-md"
                            >
                                Preview
                            </button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Preview Dialog */}
            <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
                <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Hero section preview</DialogTitle>
                        <DialogDescription>Take a quick look at your hero section before publishing</DialogDescription>
                    </DialogHeader>

                    {/* Preview Content */}
                    <div className="mt-4">
                        {previewLayout === 'centered' ? (
                            <div style={{ backgroundImage: "url('/hero.png')" }} className=" text-white rounded-lg p-16 text-center">
                                <h1 className="text-4xl font-bold mb-4">{editData.mainHeadline}</h1>
                                <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
                                    {editData.subHeadline}
                                </p>
                                <div className="flex gap-4 justify-center">
                                    <button className="px-6 py-3 bg-white text-blue-900 rounded-md font-medium hover:bg-gray-100">
                                        {editData.primaryCTA}
                                    </button>
                                    <button className="px-6 py-3 border-2 border-white text-white rounded-md font-medium hover:bg-white hover:bg-opacity-10">
                                        {editData.secondaryCTA}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-8 items-center">
                                <div>
                                    <h1 className="text-2xl font-bold mb-4">{editData.mainHeadline}</h1>
                                    <p className="text-base mb-8 text-gray-600">
                                        {editData.subHeadline}
                                    </p>
                                    <div className="flex gap-4">
                                        <button className="px-6 py-3 bg-blue-900 text-white rounded-md font-medium hover:bg-blue-800">
                                            {editData.primaryCTA}
                                        </button>
                                        <button className="px-6 py-3 border-2 border-blue-900 text-blue-900 rounded-md font-medium">
                                            {editData.secondaryCTA}
                                        </button>
                                    </div>
                                </div>
                                <img src="/content.png" />
                            </div>
                        )}
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
                            className="px-6 py-2 bg-[#1A4A7A] cursor-pointer text-white rounded-md"
                        >
                            Publish
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default HeroSectionManager;
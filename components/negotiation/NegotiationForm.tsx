"use client"
import React, { useState } from 'react';
import { Calendar, Upload } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface FormData {
    negotiationTitle: string;
    counterpartCompany: string;
    category: string;
    deadline: string;
    minimumPrice: string;
    maximumPrice: string;
    quantity: string;
    quantityDeadline: string;
    negotiationStyle: string;
    aiApproach: string;
    riskTolerance: string;
    riskDeadline: string;
}

const NegotiationForm = () => {
    const [formData, setFormData] = useState<FormData>({
        negotiationTitle: '',
        counterpartCompany: '',
        category: '',
        deadline: '12-12-12',
        minimumPrice: '1,000',
        maximumPrice: '1,500',
        quantity: '23',
        quantityDeadline: '12-12-12',
        negotiationStyle: '',
        aiApproach: '',
        riskTolerance: '',
        riskDeadline: '12-12-12'
    });

    const [dragActive, setDragActive] = useState<boolean>(false);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const router = useRouter()

    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const files = Array.from(e.dataTransfer.files);
        setUploadedFiles(prev => [...prev, ...files]);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setUploadedFiles(prev => [...prev, ...files]);
    };

    const removeFile = (index: number) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const clearAll = () => {
        setFormData({
            negotiationTitle: '',
            counterpartCompany: '',
            category: '',
            deadline: '',
            minimumPrice: '',
            maximumPrice: '',
            quantity: '',
            quantityDeadline: '',
            negotiationStyle: '',
            aiApproach: '',
            riskTolerance: '',
            riskDeadline: ''
        });
        setUploadedFiles([]);
    };

    return (
        <div className="w-full">
            <div className="p-8 bg-white rounded-lg">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Parameters</h1>
                    <p className="text-gray-600">Help the AI negotiate smarter by adding your details.</p>
                </div>

                {/* Basic Information Section */}
                <div className="mb-12">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Basic Information</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Negotiation Title */}
                        <div className="space-y-2">
                            <Label htmlFor="negotiation-title">Negotiation Title</Label>
                            <Input
                                id="negotiation-title"
                                placeholder="Enter title"
                                value={formData.negotiationTitle}
                                onChange={(e) => handleInputChange('negotiationTitle', e.target.value)}
                                className="focus:ring-[#1A4A7A] focus:border-[#1A4A7A] py-5"
                            />
                        </div>

                        {/* Counter part company */}
                        <div className="space-y-2">
                            <Label htmlFor="counterpart-company">Counter part company</Label>
                            <Input
                                id="counterpart-company"
                                placeholder="Enter company name"
                                value={formData.counterpartCompany}
                                onChange={(e) => handleInputChange('counterpartCompany', e.target.value)}
                                className="focus:ring-[#1A4A7A] focus:border-[#1A4A7A] py-5"
                            />
                        </div>

                        {/* Category */}
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Select
                                value={formData.category}
                                onValueChange={(value) => handleInputChange('category', value)}
                            >
                                <SelectTrigger className="focus:ring-[#1A4A7A] focus:border-[#1A4A7A] py-5 h-auto w-full">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="raw-materials">Raw Materials</SelectItem>
                                    <SelectItem value="services">Services</SelectItem>
                                    <SelectItem value="equipment">Equipment</SelectItem>
                                    <SelectItem value="technology">Technology</SelectItem>
                                    <SelectItem value="consulting">Consulting</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Deadline */}
                        <div className="space-y-2">
                            <Label htmlFor="deadline">Deadline</Label>
                            <div className="relative">
                                <Input
                                    id="deadline"
                                    type="date"
                                    value={formData.deadline}
                                    onChange={(e) => handleInputChange('deadline', e.target.value)}
                                    className="focus:ring-[#1A4A7A] focus:border-[#1A4A7A] py-5"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Goals and Constraints Section */}
                <div className="mb-12">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Goals and Constraints</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Minimum Price */}
                        <div className="space-y-2">
                            <Label htmlFor="min-price">Minimum Price ($)</Label>
                            <Input
                                id="min-price"
                                type="number"
                                placeholder="0"
                                value={formData.minimumPrice}
                                onChange={(e) => handleInputChange('minimumPrice', e.target.value)}
                                className="focus:ring-[#1A4A7A] focus:border-[#1A4A7A] py-5"
                            />
                        </div>

                        {/* Maximum Price */}
                        <div className="space-y-2">
                            <Label htmlFor="max-price">Maximum Price ($)</Label>
                            <Input
                                id="max-price"
                                type="number"
                                placeholder="0"
                                value={formData.maximumPrice}
                                onChange={(e) => handleInputChange('maximumPrice', e.target.value)}
                                className="focus:ring-[#1A4A7A] focus:border-[#1A4A7A] py-5"
                            />
                        </div>

                        {/* Quantity */}
                        <div className="space-y-2">
                            <Label htmlFor="quantity">Quantity</Label>
                            <Input
                                id="quantity"
                                type="number"
                                placeholder="0"
                                value={formData.quantity}
                                onChange={(e) => handleInputChange('quantity', e.target.value)}
                                className="focus:ring-[#1A4A7A] focus:border-[#1A4A7A] py-5"
                            />
                        </div>

                        {/* Quantity Deadline */}
                        <div className="space-y-2">
                            <Label htmlFor="quantity-deadline">Delivery Deadline</Label>
                            <Input
                                id="quantity-deadline"
                                type="date"
                                value={formData.quantityDeadline}
                                onChange={(e) => handleInputChange('quantityDeadline', e.target.value)}
                                className="focus:ring-[#1A4A7A] focus:border-[#1A4A7A] py-5"
                            />
                        </div>
                    </div>
                </div>

                {/* Strategy Settings Section */}
                <div className="mb-12">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Strategy Settings</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Negotiation style */}
                        <div className="space-y-2">
                            <Label>Negotiation Style</Label>
                            <Select
                                value={formData.negotiationStyle}
                                onValueChange={(value) => handleInputChange('negotiationStyle', value)}
                            >
                                <SelectTrigger className="focus:ring-[#1A4A7A] focus:border-[#1A4A7A] py-5 h-auto w-full">
                                    <SelectValue placeholder="Select negotiation style" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="collaborative">Collaborative</SelectItem>
                                    <SelectItem value="competitive">Competitive</SelectItem>
                                    <SelectItem value="accommodating">Accommodating</SelectItem>
                                    <SelectItem value="compromising">Compromising</SelectItem>
                                    <SelectItem value="avoiding">Avoiding</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* AI-Approach */}
                        <div className="space-y-2">
                            <Label>AI Approach</Label>
                            <Select
                                value={formData.aiApproach}
                                onValueChange={(value) => handleInputChange('aiApproach', value)}
                            >
                                <SelectTrigger className="focus:ring-[#1A4A7A] focus:border-[#1A4A7A] py-5 h-auto w-full">
                                    <SelectValue placeholder="Select AI approach" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="aggressive">Aggressive</SelectItem>
                                    <SelectItem value="moderate">Moderate</SelectItem>
                                    <SelectItem value="conservative">Conservative</SelectItem>
                                    <SelectItem value="adaptive">Adaptive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Risk tolerance */}
                        <div className="space-y-2">
                            <Label>Risk Tolerance</Label>
                            <Select
                                value={formData.riskTolerance}
                                onValueChange={(value) => handleInputChange('riskTolerance', value)}
                            >
                                <SelectTrigger className="focus:ring-[#1A4A7A] focus:border-[#1A4A7A] py-5 h-auto w-full">
                                    <SelectValue placeholder="Select risk tolerance" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low Risk</SelectItem>
                                    <SelectItem value="medium">Medium Risk</SelectItem>
                                    <SelectItem value="high">High Risk</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Risk Deadline */}
                        <div className="space-y-2">
                            <Label htmlFor="risk-deadline">Final Deadline</Label>
                            <Input
                                id="risk-deadline"
                                type="date"
                                value={formData.riskDeadline}
                                onChange={(e) => handleInputChange('riskDeadline', e.target.value)}
                                className="focus:ring-[#1A4A7A] focus:border-[#1A4A7A] py-5"
                            />
                        </div>
                    </div>
                </div>

                {/* Documents Section */}
                <div className="mb-12">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Documents</h2>

                    <div className="space-y-4">
                        <div
                            className={cn(
                                "border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer",
                                dragActive
                                    ? "border-[#1A4A7A] bg-[#1A4A7A]/5"
                                    : "border-gray-300 hover:border-gray-400"
                            )}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => document.getElementById('file-upload')?.click()}
                        >
                            <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600 mb-1">Drag and drop files here</p>
                            <p className="text-sm text-gray-400">or click to browse</p>
                            <p className="text-xs text-gray-400 mt-2">Supported formats: PDF, DOC, DOCX, TXT</p>
                            <input
                                type="file"
                                multiple
                                className="hidden"
                                id="file-upload"
                                accept=".pdf,.doc,.docx,.txt"
                                onChange={handleFileSelect}
                            />
                        </div>

                        {/* Uploaded Files List */}
                        {uploadedFiles.length > 0 && (
                            <div className="space-y-2">
                                <Label>Uploaded Files</Label>
                                <div className="space-y-2">
                                    {uploadedFiles.map((file, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <Upload className="h-4 w-4 text-gray-500" />
                                                <span className="text-sm text-gray-700 truncate max-w-xs">
                                                    {file.name}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    ({Math.round(file.size / 1024)} KB)
                                                </span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeFile(index)}
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                            >
                                                ×
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-end pt-6 border-t">
                    <Button
                        variant="outline"
                        onClick={clearAll}
                        className="px-8 py-5"
                    >
                        Clear All
                    </Button>
                    <Button
                        onClick={() => router.push("/user/negotiation/live")}
                        className="px-8 py-5 cursor-pointer bg-[#1A4A7A] hover:bg-[#1A4A7A]/90 text-white"
                    >
                        Start Negotiations
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default NegotiationForm;
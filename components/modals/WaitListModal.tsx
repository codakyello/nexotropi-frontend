"use client"
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Check } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

// Zod schema for form validation
const waitlistSchema = z.object({
    fullName: z.string().min(1, 'Full name is required').min(2, 'Full name must be at least 2 characters'),
    workEmail: z.string().min(1, 'Work email is required').email('Please enter a valid email address'),
    company: z.string().min(1, 'Company/Organization is required').min(2, 'Company name must be at least 2 characters'),
    industry: z.string().min(1, 'Industry/Sector is required').min(2, 'Industry must be at least 2 characters'),
    usage: z.string().optional(),
    receiveUpdates: z.boolean().optional(),
    agreeToTerms: z.boolean().refine(val => val === true, {
        message: 'You must agree to the Terms of Service and Privacy Policy'
    })
});

type WaitlistFormData = z.infer<typeof waitlistSchema>;

interface WaitlistModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const WaitlistModal: React.FC<WaitlistModalProps> = ({ isOpen, onClose }) => {
    const [step, setStep] = useState<'form' | 'success'>('form');

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<WaitlistFormData>({
        resolver: zodResolver(waitlistSchema),
        defaultValues: {
            fullName: '',
            workEmail: '',
            company: '',
            industry: '',
            usage: '',
            receiveUpdates: false,
            agreeToTerms: false
        }
    });

    const watchedValues = watch();

    const onSubmit = (data: WaitlistFormData) => {
        // Here you would typically send the data to your backend
        console.log('Waitlist form submitted:', data);
        setStep('success');
    };

    const handleClose = () => {
        setStep('form');
        reset();
        onClose();
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            handleClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                {step === 'form' ? (
                    <>
                        <DialogHeader>
                            <DialogTitle className="text-xl font-semibold text-gray-900">
                                NexusForge AI – Early Access Waitlist Form
                            </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4">
                            {/* Full Name */}
                            <div className="space-y-2">
                                <Label htmlFor="fullName" className="text-sm text-[#5D6679]">
                                    Full name*
                                </Label>
                                <Input
                                    id="fullName"
                                    placeholder="Enter Full name"
                                    {...register('fullName')}
                                    className={`w-full ${errors.fullName ? 'border-red-500' : ''}`}
                                />
                                {errors.fullName && (
                                    <p className="text-sm text-red-600">{errors.fullName.message}</p>
                                )}
                            </div>

                            {/* Work Email */}
                            <div className="space-y-2">
                                <Label htmlFor="workEmail" className="text-sm text-[#5D6679]">
                                    Work Email Address*
                                </Label>
                                <Input
                                    id="workEmail"
                                    type="email"
                                    placeholder="chioma@kargoo.io"
                                    {...register('workEmail')}
                                    className={`w-full ${errors.workEmail ? 'border-red-500' : ''}`}
                                />
                                {errors.workEmail && (
                                    <p className="text-sm text-red-600">{errors.workEmail.message}</p>
                                )}
                            </div>

                            {/* Company */}
                            <div className="space-y-2">
                                <Label htmlFor="company" className="text-sm text-[#5D6679]">
                                    Company / Organization*
                                </Label>
                                <Input
                                    id="company"
                                    placeholder="Enter company name"
                                    {...register('company')}
                                    className={`w-full ${errors.company ? 'border-red-500' : ''}`}
                                />
                                {errors.company && (
                                    <p className="text-sm text-red-600">{errors.company.message}</p>
                                )}
                            </div>

                            {/* Industry */}
                            <div className="space-y-2">
                                <Label htmlFor="industry" className="text-sm text-[#5D6679]">
                                    Industry / Sector*
                                </Label>
                                <Input
                                    id="industry"
                                    placeholder="Enter industry"
                                    {...register('industry')}
                                    className={`w-full ${errors.industry ? 'border-red-500' : ''}`}
                                />
                                {errors.industry && (
                                    <p className="text-sm text-red-600">{errors.industry.message}</p>
                                )}
                            </div>

                            {/* Usage Description */}
                            <div className="space-y-2">
                                <Label htmlFor="usage" className="text-sm text-[#5D6679]">
                                    How do you plan to use NexusForge AI?
                                </Label>
                                <Textarea
                                    id="usage"
                                    placeholder="Enter description..."
                                    {...register('usage')}
                                    rows={4}
                                    className="w-full resize-none"
                                />
                                {errors.usage && (
                                    <p className="text-sm text-red-600">{errors.usage.message}</p>
                                )}
                            </div>

                            {/* Receive Updates Checkbox */}
                            <div className="flex items-start space-x-3 pt-2">
                                <Checkbox
                                    id="receiveUpdates"
                                    checked={watchedValues.receiveUpdates}
                                    onCheckedChange={(checked) => setValue('receiveUpdates', !!checked)}
                                />
                                <Label htmlFor="receiveUpdates" className="text-sm text-gray-700">
                                    I would like to receive updates & resources
                                </Label>
                            </div>

                            {/* Terms Agreement Checkbox */}
                            <div className="flex items-start space-x-3">
                                <Checkbox
                                    id="agreeToTerms"
                                    checked={watchedValues.agreeToTerms}
                                    onCheckedChange={(checked) => setValue('agreeToTerms', !!checked)}
                                    className={errors.agreeToTerms ? 'border-red-500' : ''}
                                />
                                <div className="space-y-1">
                                    <Label htmlFor="agreeToTerms" className="text-sm text-gray-700">
                                        I agree to the{' '}
                                        <a href="#" className="text-[#1A4A7A] underline">
                                            Terms of Service
                                        </a>{' '}
                                        and{' '}
                                        <a href="#" className="text-[#1A4A7A] underline">
                                            Privacy Policy
                                        </a>
                                        .*
                                    </Label>
                                    {errors.agreeToTerms && (
                                        <p className="text-sm text-red-600">{errors.agreeToTerms.message}</p>
                                    )}
                                </div>
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="button"
                                onClick={handleSubmit(onSubmit)}
                                className="w-full py-5 px-4 rounded-md cursor-pointer font-medium text-white mt-6 bg-[#1A4A7A] hover:bg-[#1A4A7A] transition-colors"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Submitting...' : 'Join Waitlist'}
                            </Button>
                        </div>
                    </>
                ) : (
                    // Success Screen
                    <div className="p-4 text-center">
                        {/* Success Icon */}
                        <div className="mb-6">
                            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                <Check className="h-8 w-8 text-green-600" />
                            </div>
                            <DialogTitle className="text-3xl font-bold text-gray-900 mb-2">You&apos;re In!</DialogTitle>
                            <h3 className="text-lg text-gray-600 mb-4">Welcome to NexusForge AI Early Access</h3>
                            <p className="text-gray-600 text-sm mb-6">
                                Congratulations! You&apos;ve officially secured your spot on our waitlist.
                            </p>
                            <p className="text-gray-500 text-sm mb-8">
                                We can&apos;t wait to show you how we&apos;re turning uncertainty into clarity with AI-powered simulations.
                            </p>
                        </div>

                        {/* What's Next */}
                        <div className="mb-8">
                            <h4 className="text-xl font-semibold text-gray-900 mb-6">What&apos;s Next?</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-[#E8EDF2] rounded-lg p-4">
                                    <p className="text-sm text-gray-700">
                                        Keep an eye on your inbox for exclusive updates
                                    </p>
                                </div>
                                <div className="bg-[#E8EDF2] rounded-lg p-4">
                                    <p className="text-sm text-gray-700">
                                        Be among the first to explore our platform when we launch
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Share Button */}
                        <Button
                            onClick={() => {/* Handle share functionality */ }}
                            className="w-full bg-[#1A4A7A] text-white py-3 px-4 rounded-md font-medium mb-2 transition-colors"
                        >
                            Share with friends
                        </Button>
                        <p className="text-sm text-gray-500">
                            Invite others to join and be part of the future
                        </p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default WaitlistModal;
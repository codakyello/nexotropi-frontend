"use client"
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Mail, Phone, MapPin } from 'lucide-react'

const contactSchema = z.object({
    full_name: z.string().min(1, 'Full name is required'),
    email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
    company: z.string().optional(),
    message: z.string().min(10, 'Message must be at least 10 characters'),
})

type ContactFormData = z.infer<typeof contactSchema>

const ContactSection = () => {
    const [submitted, setSubmitted] = useState(false)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<ContactFormData>({
        resolver: zodResolver(contactSchema),
    })

    const onSubmit = async (data: ContactFormData) => {
        try {
            const res = await fetch('/api/v1/contact/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })
            if (!res.ok) throw new Error('Failed to send message')
            setSubmitted(true)
            reset()
            toast.success('Message sent! We\'ll be in touch shortly.')
        } catch {
            toast.error('Something went wrong. Please try again.')
        }
    }

    return (
        <section className="py-16 px-6 bg-white">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
                {/* Contact info */}
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Get in touch</h2>
                    <p className="text-gray-500 mb-10 leading-relaxed">
                        Have a question or want to learn more about Nexotropi? Fill out the form and our team will get back to you within one business day.
                    </p>
                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <Mail size={20} className="text-primary" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">Email</p>
                                <p className="text-gray-500 text-sm">hello@nexotropi.com</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <Phone size={20} className="text-primary" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">Phone</p>
                                <p className="text-gray-500 text-sm">Available on request</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <MapPin size={20} className="text-primary" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">Location</p>
                                <p className="text-gray-500 text-sm">Remote-first, global team</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="bg-gray-50 rounded-2xl p-8">
                    {submitted ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Mail size={28} className="text-green-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Message sent!</h3>
                            <p className="text-gray-500">We&apos;ll get back to you within one business day.</p>
                            <Button
                                className="mt-6"
                                variant="outline"
                                onClick={() => setSubmitted(false)}
                            >
                                Send another message
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            <div>
                                <Label htmlFor="full_name">Full name</Label>
                                <Input
                                    id="full_name"
                                    placeholder="Jane Smith"
                                    className="mt-1"
                                    {...register('full_name')}
                                />
                                {errors.full_name && (
                                    <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="email">Work email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="jane@company.com"
                                    className="mt-1"
                                    {...register('email')}
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="company">Company <span className="text-gray-400">(optional)</span></Label>
                                <Input
                                    id="company"
                                    placeholder="Acme Corp"
                                    className="mt-1"
                                    {...register('company')}
                                />
                            </div>
                            <div>
                                <Label htmlFor="message">Message</Label>
                                <Textarea
                                    id="message"
                                    placeholder="Tell us how we can help..."
                                    rows={5}
                                    className="mt-1"
                                    {...register('message')}
                                />
                                {errors.message && (
                                    <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>
                                )}
                            </div>
                            <Button
                                type="submit"
                                className="w-full bg-primary text-white"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Sending...' : 'Send message'}
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        </section>
    )
}

export default ContactSection

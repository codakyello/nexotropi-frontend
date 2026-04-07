"use client"
import NegotiationsGrid from '@/components/users/negotiation/NegotiationsGrid'
import NegotiationTable from '@/components/users/negotiation/NegotiationTable'
import SearchNegotiation from '@/components/users/negotiation/SearchNegotiation'
import Link from 'next/link'
import React from 'react'
import { useNylasConnect, useNylasStatus } from '@/services/requests/negotiation'
import { AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const Page = () => {
    const { data: nylas, isLoading, isError } = useNylasStatus()
    const connectNylas = useNylasConnect()
    const isConnected = Boolean(nylas?.grant_id)

    const handleConnect = async (provider: 'google' | 'microsoft') => {
        try {
            const result = await connectNylas.mutateAsync(provider)
            if (result?.url) {
                window.location.href = result.url
                return
            }
            toast.error('No auth URL returned from server')
        } catch (err: any) {
            toast.error(err?.response?.data?.detail || 'Failed to initiate email connection')
        }
    }

    return (
        <div className='w-full pb-10'>
            {!isLoading && !isError && !isConnected && (
                <div className="mb-8 p-6 bg-destructive/5 backdrop-blur-xl border border-destructive/20 rounded-2xl flex items-center justify-between shadow-[0_8px_32px_0_rgba(0,0,0,0.05)]">
                    <div className="flex items-center gap-4 text-destructive">
                        <AlertCircle className="w-6 h-6 animate-pulse" />
                        <div>
                            <h3 className="font-mono text-sm uppercase tracking-wider font-bold mb-1">Email Engine Offline</h3>
                            <p className="text-[13px] text-destructive/80">Critical system failure: Telecom array disconnected. Establish uplink to process RFQs.</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            disabled={connectNylas.isPending}
                            onClick={() => handleConnect('google')}
                            className="border-destructive/20 hover:bg-destructive/10 text-destructive"
                        >
                            {connectNylas.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Uplink Workspace
                        </Button>
                        <Button
                            variant="outline"
                            disabled={connectNylas.isPending}
                            onClick={() => handleConnect('microsoft')}
                            className="border-destructive/20 hover:bg-destructive/10 text-destructive"
                        >
                            {connectNylas.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Uplink Outlook
                        </Button>
                    </div>
                </div>
            )}
            {!isLoading && isError && (
                <div className="mb-8 p-6 bg-orange-500/5 backdrop-blur-xl border border-orange-500/20 rounded-2xl flex items-center gap-4 text-orange-500 shadow-[0_8px_32px_0_rgba(0,0,0,0.05)]">
                    <AlertCircle className="w-6 h-6" />
                    <div>
                        <h3 className="font-mono text-sm uppercase tracking-wider font-bold mb-1">Telemetry unavailable</h3>
                        <p className="text-[13px] text-orange-500/80">Comm array interference detected. Refresh diagnostics.</p>
                    </div>
                </div>
            )}
            <div className="relative mb-12 mt-4">
                <div className="flex items-end justify-between">
                    {/* Left Content */}
                    <div className="flex-1 max-w-3xl">
                        <h1 className="text-[40px] md:text-[56px] font-serif font-light text-foreground mb-4 leading-[1.1] tracking-tight">
                            Negotiation Engine
                        </h1>
                        <p className="text-[16px] md:text-[18px] text-muted-foreground font-light leading-relaxed max-w-2xl">
                            Monitor, control, and override autonomous procurement negotiations in real-time.
                        </p>
                    </div>

                    {/* Right CTA Button */}
                    <div className="flex-shrink-0 ml-8 mb-2">
                        <Link href="/user/negotiation/new">
                            <Button size="lg" className="font-mono uppercase tracking-widest font-bold">
                                Initialize Session
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
            <SearchNegotiation />
        </div>
    )
}

export default Page

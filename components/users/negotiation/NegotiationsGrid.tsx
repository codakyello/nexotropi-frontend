"use client"
import React from 'react';
import { Clock, EllipsisVertical, Eye, Plus, Loader2 } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from 'next/navigation';
import { useSessions, Session } from '@/services/requests/negotiation';

const STATUS_COLOR: Record<string, string> = {
    active: 'border-primary/30 bg-primary/10 text-primary shadow-[0_0_10px_0_var(--color-primary)]/10',
    paused: 'border-orange-500/30 bg-orange-500/10 text-orange-500',
    ended: 'border-green-500/30 bg-green-500/10 text-green-500',
    cancelled: 'border-destructive/30 bg-destructive/10 text-destructive',
    awaiting_constraints: 'border-muted-foreground/30 bg-muted-foreground/10 text-muted-foreground',
}

const PROGRESS_COLOR: Record<string, string> = {
    active: 'bg-primary shadow-[0_0_10px_0_var(--color-primary)]',
    paused: 'bg-orange-500',
    ended: 'bg-green-500',
    cancelled: 'bg-destructive',
    awaiting_constraints: 'bg-muted-foreground',
}

const PHASE_PROGRESS: Record<string, number> = {
    collection: 25,
    negotiating: 60,
    bafo: 85,
}

const NegotiationsGrid = () => {
    const router = useRouter()
    const { data: sessions, isLoading } = useSessions()

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-24 gap-3 text-muted-foreground font-mono animate-pulse">
                <Loader2 className="h-6 w-6 animate-spin text-primary" /> Initializing engine…
            </div>
        )
    }

    if (!sessions?.length) {
        return (
            <div className="text-center py-24 bg-background/40 backdrop-blur-3xl border border-white/5 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] ring-1 ring-inset ring-white/5">
                <p className="text-muted-foreground font-mono text-[11px] uppercase tracking-[0.2em] mb-4 opacity-50">Engine Idle</p>
                <p className="text-foreground text-xl font-serif mb-8">No active negotiations</p>
                <button
                    onClick={() => router.push('/user/negotiation/new')}
                    className="inline-flex items-center gap-2 text-sm font-medium hover:bg-primary/20 backdrop-blur-md text-primary border border-primary/30 rounded-lg px-6 py-3 transition-all duration-300 hover:shadow-[0_0_15px_var(--color-primary)]/20 hover:-translate-y-1"
                >
                    <Plus className="h-4 w-4" /> Initialize Session
                </button>
            </div>
        )
    }

    return (
        <div className="w-full">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {sessions.map((session: Session) => {
                        const progress = session.status === 'ended' ? 100
                            : session.status === 'cancelled' ? 100
                            : PHASE_PROGRESS[session.negotiation_phase] ?? 10

                        return (
                            <div key={session.id} className="group relative bg-card/40 backdrop-blur-3xl rounded-2xl p-7 border border-white/5 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] ring-1 ring-inset ring-white/5 transition-all duration-500 hover:bg-white/5 hover:-translate-y-2 hover:shadow-[0_16px_40px_rgba(0,0,0,0.2)]">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none" />
                                
                                <div className="flex items-center justify-between mb-6 relative z-10">
                                    <span className={`px-4 py-1.5 rounded-full font-mono text-[10px] uppercase font-bold tracking-widest border transition-all duration-300 ${STATUS_COLOR[session.status] ?? 'border-muted-foreground/30 bg-muted-foreground/10 text-muted-foreground'}`}>
                                        {session.status.replace(/_/g, ' ')}
                                    </span>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger>
                                            <EllipsisVertical className="w-5 h-5 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="bg-background/95 backdrop-blur-xl border-border/50 shadow-2xl rounded-xl">
                                            <DropdownMenuItem onClick={() => router.push(`/user/negotiation/${session.id}`)} className="flex cursor-pointer items-center gap-2 hover:bg-accent/50">
                                                <Eye className="w-4 h-4" /> View telemetry
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <h3 className="text-xl font-serif text-foreground mb-3 leading-tight tracking-tight relative z-10 group-hover:text-primary transition-colors duration-300">{session.title}</h3>

                                {session.description && (
                                    <p className="text-muted-foreground text-[14px] leading-relaxed mb-6 line-clamp-2 relative z-10">{session.description}</p>
                                )}

                                <div className="flex items-center text-[12px] font-mono text-muted-foreground/70 mb-8 relative z-10">
                                    <Clock className="w-3.5 h-3.5 mr-2 opacity-50" />
                                    <span>T-{new Date(session.created_at).toLocaleDateString()}</span>
                                </div>

                                <div className="mb-6 relative z-10">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-muted-foreground font-mono text-[11px] uppercase tracking-widest">{session.negotiation_phase} phase</span>
                                        <span className="text-[11px] font-mono font-bold text-foreground">{progress}%</span>
                                    </div>
                                    <div className="w-full bg-black/20 rounded-full h-1.5 overflow-hidden box-border border-b border-white/5">
                                        <div
                                            className={`${PROGRESS_COLOR[session.status] ?? 'bg-muted-foreground'} h-full transition-all duration-1000 ease-out`}
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={() => router.push(`/user/negotiation/${session.id}`)}
                                    className="relative z-10 w-full py-3.5 cursor-pointer font-mono text-[11px] uppercase tracking-widest font-bold border rounded-xl text-foreground bg-white/5 border-white/10 hover:bg-primary/20 hover:border-primary/30 hover:text-primary transition-all duration-300"
                                >
                                    Analyze
                                </button>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};

export default NegotiationsGrid;

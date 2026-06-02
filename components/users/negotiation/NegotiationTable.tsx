"use client"
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, Eye, Loader2, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSessions, Session } from '@/services/requests/negotiation';

const STATUS_BADGE: Record<string, string> = {
    awaiting_rfq: 'border-sky-500/30 bg-sky-500/10 text-sky-600',
    active: 'border-primary/30 bg-primary/10 text-primary',
    paused: 'border-orange-500/30 bg-orange-500/10 text-orange-500',
    ended: 'border-green-500/30 bg-green-500/10 text-green-500',
    cancelled: 'border-destructive/30 bg-destructive/10 text-destructive',
    awaiting_constraints: 'border-muted-foreground/30 bg-muted-foreground/10 text-muted-foreground',
}

const PHASE_PROGRESS: Record<string, number> = {
    collection: 25,
    negotiating: 60,
    bafo: 85,
}

const sessionProgress = (session: Session) => {
    if (session.status === 'awaiting_rfq') return 5
    if (session.status === 'awaiting_constraints') return 15
    if (session.status === 'ended' || session.status === 'cancelled') return 100
    return PHASE_PROGRESS[session.negotiation_phase] ?? 10
}

const NegotiationTable = () => {
    const router = useRouter()
    const { data: sessions, isLoading } = useSessions()
    const sessionTarget = (session: Session) =>
        session.status === 'awaiting_rfq' || session.status === 'awaiting_constraints'
            ? `/user/negotiation/new?session=${session.id}`
            : `/user/negotiation/${session.id}`

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-24 gap-3 text-muted-foreground font-mono animate-pulse">
                <Loader2 className="h-6 w-6 animate-spin text-primary" /> Initializing table data…
            </div>
        )
    }

    if (!sessions?.length) {
        return (
            <div className="text-center py-24 bg-background/40 backdrop-blur-3xl border border-white/5 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] ring-1 ring-inset ring-white/5">
                <p className="text-muted-foreground font-mono text-[11px] uppercase tracking-[0.2em] mb-4 opacity-50">Engine Idle</p>
                <p className="text-foreground text-xl font-serif mb-8">No active negotiations</p>
                <Button size="lg" onClick={() => router.push('/user/negotiation/new')} className="font-mono uppercase tracking-widest font-bold">
                    <Plus className="h-4 w-4 mr-2" /> Initialize Session
                </Button>
            </div>
        )
    }

    return (
        <div className="w-full bg-card/40 backdrop-blur-3xl border border-white/5 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="border-b border-border/40 hover:bg-transparent">
                        <TableHead className="text-foreground font-serif tracking-wide text-[15px]">Session Identifier</TableHead>
                        <TableHead className="text-foreground font-serif tracking-wide text-[15px]">Status</TableHead>
                        <TableHead className="text-foreground font-serif tracking-wide text-[15px]">Active Phase</TableHead>
                        <TableHead className="text-foreground font-serif tracking-wide text-[15px]">Telemetry</TableHead>
                        <TableHead className="text-foreground font-serif tracking-wide text-[15px]">Timestamp</TableHead>
                        <TableHead className="text-foreground font-serif tracking-wide text-[15px] pt-4">Options</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sessions.map((s: Session) => {
                        const progress = sessionProgress(s)

                        return (
                            <TableRow key={s.id} className="border-b border-border/20 hover:bg-white/5 cursor-pointer transition-colors group" onClick={() => router.push(sessionTarget(s))}>
                                <TableCell className="py-4">
                                    <p className="font-medium text-foreground text-[14px] group-hover:text-primary transition-colors">{s.title}</p>
                                    {s.description && (
                                        <p className="text-[12px] text-muted-foreground truncate max-w-xs opacity-70">{s.description}</p>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary" className={`font-mono text-[10px] uppercase font-bold tracking-widest shadow-none border ${STATUS_BADGE[s.status] ?? 'border-muted-foreground/30 bg-muted-foreground/10 text-muted-foreground'}`}>
                                        {s.status.replace(/_/g, ' ')}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground font-mono text-[11px] uppercase tracking-wider">
                                    {s.negotiation_phase}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="w-24 h-1.5 bg-black/20 rounded-full overflow-hidden border border-white/5">
                                            <div 
                                                className={`h-full ${s.status === 'active' ? 'bg-primary' : s.status === 'ended' ? 'bg-green-500' : 'bg-muted-foreground'} transition-all duration-1000 ease-out`}
                                                style={{ width: `${progress}%` }} 
                                            />
                                        </div>
                                        <span className="text-[11px] font-mono text-muted-foreground">{progress}%</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground font-mono text-[12px]">
                                    T-{new Date(s.created_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell onClick={e => e.stopPropagation()}>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-accent/50 text-muted-foreground hover:text-foreground">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-44 bg-background/95 backdrop-blur-xl border-border/50 shadow-2xl rounded-xl">
                                            <DropdownMenuItem onClick={() => router.push(sessionTarget(s))} className="flex items-center gap-2 text-foreground font-mono text-[12px] uppercase tracking-wider hover:bg-accent/50 cursor-pointer">
                                                <Eye className="h-4 w-4" /> {s.status === 'awaiting_rfq' ? 'Upload RFQ' : s.status === 'awaiting_constraints' ? 'Resume setup' : 'View log'}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>

            <div className="flex items-center justify-between px-6 py-4 border-t border-border/40 bg-white/5">
                <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">{sessions.length} RECORD{sessions.length !== 1 ? 'S' : ''} DETECTED</p>
            </div>
        </div>
    );
};

export default NegotiationTable;

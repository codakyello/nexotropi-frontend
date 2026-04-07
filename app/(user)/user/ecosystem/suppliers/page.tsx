"use client"
import React, { useState } from 'react'
import { Plus, Search, MoreVertical, Pencil, Trash2, Loader2, Star, Clock, Building2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import {
    useSuppliers, useCreateSupplier, useUpdateSupplier, useDeleteSupplier,
    useIndustries, useCreateIndustry,
    Supplier, Industry,
} from '@/services/requests/negotiation'

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS: Record<string, { label: string; className: string }> = {
    active: { label: 'Active', className: 'bg-green-50 text-green-700' },
    inactive: { label: 'Inactive', className: 'bg-gray-100 text-gray-500' },
    blocked: { label: 'Blocked', className: 'bg-red-50 text-red-600' },
}

// ── Supplier form dialog ──────────────────────────────────────────────────────

interface FormState {
    name: string
    email: string
    company: string
    phone: string
    notes: string
    industry_id: string
    status: string
}

const EMPTY_FORM: FormState = {
    name: '', email: '', company: '', phone: '', notes: '', industry_id: '', status: 'active',
}

function SupplierDialog({
    open, onClose, supplier,
}: {
    open: boolean
    onClose: () => void
    supplier: Supplier | null
}) {
    const isEdit = !!supplier
    const { data: industries = [], isLoading: loadingIndustries } = useIndustries()
    const createSupplier = useCreateSupplier()
    const updateSupplier = useUpdateSupplier()
    const createIndustry = useCreateIndustry()

    const [form, setForm] = useState<FormState>(EMPTY_FORM)
    const [newIndustry, setNewIndustry] = useState('')
    const [showNewIndustry, setShowNewIndustry] = useState(false)

    // Sync form when supplier changes
    React.useEffect(() => {
        if (supplier) {
            setForm({
                name: supplier.name,
                email: supplier.email,
                company: supplier.company ?? '',
                phone: supplier.phone ?? '',
                notes: supplier.notes ?? '',
                industry_id: supplier.industry_id ?? '',
                status: supplier.status,
            })
        } else {
            setForm(EMPTY_FORM)
        }
        setNewIndustry('')
        setShowNewIndustry(false)
    }, [supplier, open])

    const set = (k: keyof FormState, v: string) => setForm(f => ({ ...f, [k]: v }))

    const handleAddIndustry = async () => {
        if (!newIndustry.trim()) return
        try {
            const ind = await createIndustry.mutateAsync(newIndustry.trim())
            set('industry_id', ind.id)
            setNewIndustry('')
            setShowNewIndustry(false)
            toast.success(`Industry "${ind.name}" created`)
        } catch (e: any) {
            toast.error(e?.response?.data?.detail || 'Failed to create industry')
        }
    }

    const handleSubmit = async () => {
        if (!form.name.trim()) return toast.error('Name is required')
        if (!form.email.trim()) return toast.error('Email is required')
        if (!form.industry_id) return toast.error('Industry is required')

        const payload = {
            name: form.name.trim(),
            email: form.email.trim(),
            company: form.company.trim() || undefined,
            phone: form.phone.trim() || undefined,
            notes: form.notes.trim() || undefined,
            industry_id: form.industry_id,
            ...(isEdit ? { status: form.status } : {}),
        }

        try {
            if (isEdit) {
                await updateSupplier.mutateAsync({ id: supplier!.id, data: payload })
                toast.success('Supplier updated')
            } else {
                await createSupplier.mutateAsync(payload as any)
                toast.success('Supplier added')
            }
            onClose()
        } catch (e: any) {
            toast.error(e?.response?.data?.detail || 'Failed to save supplier')
        }
    }

    const saving = createSupplier.isPending || updateSupplier.isPending

    return (
        <Dialog open={open} onOpenChange={v => !v && onClose()}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Edit Supplier' : 'Add Supplier'}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-2">
                    {/* Basic info */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                            <Label className="text-xs text-gray-600">Name <span className="text-red-500">*</span></Label>
                            <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. John Mensah" className="mt-1" />
                        </div>
                        <div className="col-span-2">
                            <Label className="text-xs text-gray-600">Email <span className="text-red-500">*</span></Label>
                            <Input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="supplier@company.com" className="mt-1" />
                        </div>
                        <div>
                            <Label className="text-xs text-gray-600">Company</Label>
                            <Input value={form.company} onChange={e => set('company', e.target.value)} placeholder="Company Ltd." className="mt-1" />
                        </div>
                        <div>
                            <Label className="text-xs text-gray-600">Phone</Label>
                            <Input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+234 800 000 0000" className="mt-1" />
                        </div>
                    </div>

                    {/* Industry */}
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <Label className="text-xs text-gray-600">Industry <span className="text-red-500">*</span></Label>
                            <button
                                onClick={() => setShowNewIndustry(v => !v)}
                                className="text-xs text-[#1A4A7A] hover:underline"
                            >
                                {showNewIndustry ? 'Cancel' : '+ New industry'}
                            </button>
                        </div>

                        {showNewIndustry ? (
                            <div className="flex gap-2">
                                <Input
                                    value={newIndustry}
                                    onChange={e => setNewIndustry(e.target.value)}
                                    placeholder="e.g. Electronics"
                                    onKeyDown={e => e.key === 'Enter' && handleAddIndustry()}
                                    autoFocus
                                />
                                <Button
                                    size="sm"
                                    onClick={handleAddIndustry}
                                    disabled={createIndustry.isPending}
                                    className="bg-[#1A4A7A] shrink-0"
                                >
                                    {createIndustry.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Add'}
                                </Button>
                            </div>
                        ) : (
                            <select
                                value={form.industry_id}
                                onChange={e => set('industry_id', e.target.value)}
                                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1A4A7A]"
                            >
                                <option value="">Select industry…</option>
                                {loadingIndustries
                                    ? <option disabled>Loading…</option>
                                    : industries.map((i: Industry) => (
                                        <option key={i.id} value={i.id}>{i.name}</option>
                                    ))
                                }
                            </select>
                        )}
                    </div>

                    {/* Status (edit only) */}
                    {isEdit && (
                        <div>
                            <Label className="text-xs text-gray-600">Status</Label>
                            <select
                                value={form.status}
                                onChange={e => set('status', e.target.value)}
                                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1A4A7A]"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    )}

                    {/* Notes */}
                    <div>
                        <Label className="text-xs text-gray-600">Notes</Label>
                        <textarea
                            value={form.notes}
                            onChange={e => set('notes', e.target.value)}
                            placeholder="Any notes about this supplier…"
                            rows={3}
                            className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1A4A7A] resize-none"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={saving} className="bg-[#1A4A7A]">
                            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            {isEdit ? 'Save changes' : 'Add supplier'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function SuppliersPage() {
    const { data: suppliers = [], isLoading } = useSuppliers()
    const deleteSupplier = useDeleteSupplier()

    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editing, setEditing] = useState<Supplier | null>(null)
    const [confirmDelete, setConfirmDelete] = useState<Supplier | null>(null)

    const filtered = suppliers.filter((s: Supplier) => {
        const q = search.toLowerCase()
        const matchSearch = !q || s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || (s.company ?? '').toLowerCase().includes(q)
        const matchStatus = statusFilter === 'all' || s.status === statusFilter
        return matchSearch && matchStatus
    })

    const handleDelete = async () => {
        if (!confirmDelete) return
        try {
            await deleteSupplier.mutateAsync(confirmDelete.id)
            toast.success(`${confirmDelete.name} removed`)
            setConfirmDelete(null)
        } catch (e: any) {
            toast.error(e?.response?.data?.detail || 'Failed to remove supplier')
        }
    }

    const openAdd = () => { setEditing(null); setDialogOpen(true) }
    const openEdit = (s: Supplier) => { setEditing(s); setDialogOpen(true) }

    const activeCount = suppliers.filter((s: Supplier) => s.status === 'active').length

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Suppliers</h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        {suppliers.length} total · {activeCount} active
                    </p>
                </div>
                <Button onClick={openAdd} className="bg-[#1A4A7A] gap-2">
                    <Plus className="h-4 w-4" /> Add Supplier
                </Button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 mb-5">
                <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search suppliers…"
                        className="pl-9"
                    />
                </div>
                <div className="flex gap-1 border border-gray-200 rounded-lg p-1 bg-white">
                    {['all', 'active', 'inactive'].map(s => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors capitalize ${statusFilter === s ? 'bg-[#1A4A7A] text-white' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            {s === 'all' ? 'All' : s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center py-16 gap-2 text-gray-400">
                        <Loader2 className="h-5 w-5 animate-spin" /> Loading suppliers…
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16">
                        <Building2 className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm font-medium">
                            {search || statusFilter !== 'all' ? 'No suppliers match your filters' : 'No suppliers yet'}
                        </p>
                        {!search && statusFilter === 'all' && (
                            <Button onClick={openAdd} size="sm" className="mt-4 bg-[#1A4A7A] gap-1.5">
                                <Plus className="h-4 w-4" /> Add your first supplier
                            </Button>
                        )}
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50">
                                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Supplier</th>
                                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Industry</th>
                                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Contact</th>
                                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Status</th>
                                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Reliability</th>
                                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Avg Response</th>
                                <th className="px-5 py-3" />
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((s: Supplier) => {
                                const statusCfg = STATUS[s.status] ?? STATUS.inactive
                                const reliability = s.reliability_score != null
                                    ? Math.round(s.reliability_score * 100)
                                    : null
                                const reliabilityColor = reliability == null ? 'text-gray-400'
                                    : reliability >= 80 ? 'text-green-600'
                                    : reliability >= 60 ? 'text-amber-600'
                                    : 'text-red-500'

                                return (
                                    <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-[#1A4A7A]/10 flex items-center justify-center shrink-0">
                                                    <span className="text-xs font-semibold text-[#1A4A7A]">
                                                        {s.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{s.name}</p>
                                                    {s.company && <p className="text-xs text-gray-400">{s.company}</p>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className="text-sm text-gray-600">
                                                {s.industry?.name ?? <span className="text-gray-300 italic">—</span>}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <p className="text-sm text-gray-600">{s.email}</p>
                                            {s.phone && <p className="text-xs text-gray-400">{s.phone}</p>}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <Badge className={`text-xs ${statusCfg.className}`}>
                                                {statusCfg.label}
                                            </Badge>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-1.5">
                                                <Star className={`h-3.5 w-3.5 ${reliabilityColor}`} />
                                                <span className={`text-sm font-medium ${reliabilityColor}`}>
                                                    {reliability != null ? `${reliability}%` : '—'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-1.5 text-gray-500">
                                                <Clock className="h-3.5 w-3.5" />
                                                <span className="text-sm">
                                                    {s.avg_response_hours != null
                                                        ? `${Math.round(s.avg_response_hours)}h`
                                                        : '—'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        <MoreVertical className="h-4 w-4 text-gray-400" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-40">
                                                    <DropdownMenuItem onClick={() => openEdit(s)} className="gap-2 text-gray-700">
                                                        <Pencil className="h-3.5 w-3.5" /> Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => setConfirmDelete(s)}
                                                        className="gap-2 text-red-600 focus:text-red-600 focus:bg-red-50"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" /> Remove
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {!isLoading && filtered.length > 0 && (
                <p className="text-xs text-gray-400 mt-3 px-1">
                    Showing {filtered.length} of {suppliers.length} suppliers
                </p>
            )}

            {/* Add/Edit dialog */}
            <SupplierDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                supplier={editing}
            />

            {/* Delete confirm dialog */}
            <Dialog open={!!confirmDelete} onOpenChange={v => !v && setConfirmDelete(null)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Remove supplier?</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-gray-600 mt-1">
                        <strong>{confirmDelete?.name}</strong> will be removed from your supplier list. Any active negotiations will be unaffected.
                    </p>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancel</Button>
                        <Button
                            onClick={handleDelete}
                            disabled={deleteSupplier.isPending}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {deleteSupplier.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                            Remove
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

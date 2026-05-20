"use client"
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

// This page is superseded by /user/negotiation/[id] which shows real live data.
// Redirect anyone who lands here to the sessions list.
export default function LiveNegotiations() {
    const router = useRouter()
    useEffect(() => { router.replace('/user/negotiation') }, [])
    return (
        <div className="flex items-center justify-center h-64 gap-2 text-gray-400">
            <Loader2 className="h-5 w-5 animate-spin" /> Redirecting…
        </div>
    )
}

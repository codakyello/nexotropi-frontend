import React from 'react'
import { ShieldCheck, AlertTriangle, LogIn, Lock } from 'lucide-react'

const metrics = [
    {
        label: 'Total Events',
        value: '—',
        icon: ShieldCheck,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
    },
    {
        label: 'Failed Logins',
        value: '—',
        icon: LogIn,
        color: 'text-red-600',
        bg: 'bg-red-50',
    },
    {
        label: 'Permission Changes',
        value: '—',
        icon: Lock,
        color: 'text-yellow-600',
        bg: 'bg-yellow-50',
    },
    {
        label: 'Alerts',
        value: '—',
        icon: AlertTriangle,
        color: 'text-orange-600',
        bg: 'bg-orange-50',
    },
]

const LogMetric = () => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-8 pb-6">
            {metrics.map((metric) => {
                const Icon = metric.icon
                return (
                    <div
                        key={metric.label}
                        className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4"
                    >
                        <div className={`p-3 rounded-lg ${metric.bg}`}>
                            <Icon size={20} className={metric.color} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                            <p className="text-sm text-gray-500">{metric.label}</p>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default LogMetric

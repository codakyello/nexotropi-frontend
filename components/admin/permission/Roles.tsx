import React from 'react';
import { Edit } from 'lucide-react';

const RolesPermissions = () => {
    const roles = [
        {
            title: 'Super Admin',
            description: 'Full access to all system features and settings',
            users: null,
            color: 'border-[#1A4A7A]'
        },
        {
            title: 'Admin',
            description: 'Broad permissions across most system features',
            users: 8,
            color: 'border-green-500'
        },
        {
            title: 'Content Manager',
            description: 'Focused on content and visual management',
            users: 12,
            color: 'border-[#F59E0B]'
        },
        {
            title: 'Founding Engineer',
            description: 'User management and testing capabilities',
            users: 5,
            color: 'border-[#1A4A7A]'
        },
        {
            title: 'Read-Only User',
            description: 'View-only access to system features',
            users: 24,
            color: 'border-[#D92D20]'
        }
    ];

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roles.map((role, index) => (
                    <div key={index} className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
                        <div className={`border-2 ${role.color}`}></div>
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{role.title}</h3>
                            <p className="text-gray-600 text-base mb-6 min-h-[48px]">
                                {role.description}
                            </p>
                            <div className="flex items-center justify-between">
                                {role.users !== null && (
                                    <span className="text-gray-500 text-sm">{role.users} users</span>
                                )}
                                <button className="ml-auto cursor-pointer flex items-center gap-2 text-[#1A4A7A] hover:text-[#153a5f] transition-colors">
                                    <Edit size={16} />
                                    <span className="font-medium">Edit Role</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RolesPermissions;
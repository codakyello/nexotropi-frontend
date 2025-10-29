import React, { useState } from 'react';
import { FileText, Users, Activity, Settings } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

const CreateNewRole = ({ open, onOpenChange }: any) => {
    const [roleName, setRoleName] = useState('');
    const [description, setDescription] = useState('');
    const [permissions, setPermissions] = useState({
        contentManagement: true,
        userManagement: true,
        auditLogs: true,
        settingsSecurity: true,
    });

    const togglePermission = (key: any) => {
        setPermissions((prev: any) => ({ ...prev, [key]: !prev[key] }));
    };

    const handleCreateRole = () => {
        console.log({ roleName, description, permissions });
        // Add your API call here
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
                <div className="sticky top-0 bg-white z-10 border-b px-6 py-4">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold">Create New Role</DialogTitle>
                    </DialogHeader>
                </div>

                <div className="px-6 py-4 space-y-6">
                    {/* Role Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Role Name
                        </label>
                        <input
                            type="text"
                            placeholder="Enter role name"
                            value={roleName}
                            onChange={(e) => setRoleName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <input
                            type="text"
                            placeholder="Enter short description of the role"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Assign users */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Assign users
                        </label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white">
                            <option>Select below</option>
                        </select>
                    </div>

                    {/* Assign Default Permissions */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-4">
                            Assign Default Permissions
                        </label>

                        {/* Content Management */}
                        <div className="border border-gray-200 rounded-lg mb-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <FileText className="w-5 h-5 text-gray-600" />
                                    <span className="font-medium text-gray-900">Content Management</span>
                                </div>
                                <button
                                    onClick={() => togglePermission('contentManagement')}
                                    className={`relative w-11 h-6 rounded-full transition-colors ${permissions.contentManagement ? 'bg-emerald-500' : 'bg-gray-300'
                                        }`}
                                >
                                    <span
                                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${permissions.contentManagement ? 'translate-x-5' : 'translate-x-0'
                                            }`}
                                    />
                                </button>
                            </div>
                            <div className="p-4 space-y-2">
                                <PermissionItem text="Edit Hero Section (headline, sub-headline, CTA buttons)" />
                                <PermissionItem text="Edit Problem/Solution Section (headlines & 3 pillars)" />
                                <PermissionItem text="Upload & Manage Visual Assets (logos, icons, images)" />
                                <PermissionItem text="Save Drafts" />
                                <PermissionItem text="Publish Changes" />
                            </div>
                        </div>

                        {/* User Management */}
                        <div className="border border-gray-200 rounded-lg mb-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <Users className="w-5 h-5 text-gray-600" />
                                    <span className="font-medium text-gray-900">User Management</span>
                                </div>
                                <button
                                    onClick={() => togglePermission('userManagement')}
                                    className={`relative w-11 h-6 rounded-full transition-colors ${permissions.userManagement ? 'bg-emerald-500' : 'bg-gray-300'
                                        }`}
                                >
                                    <span
                                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${permissions.userManagement ? 'translate-x-5' : 'translate-x-0'
                                            }`}
                                    />
                                </button>
                            </div>
                            <div className="p-4 space-y-2">
                                <PermissionItem text="Approve/Reject Users from Waitlist" />
                                <PermissionItem text="Assign User Roles (cannot assign Super Admin)" />
                                <PermissionItem text="Deactivate/Reactivate Users" />
                                <PermissionItem text="Search Users & View Directory" />
                            </div>
                        </div>

                        {/* Audit & Logs */}
                        <div className="border border-gray-200 rounded-lg mb-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <Activity className="w-5 h-5 text-gray-600" />
                                    <span className="font-medium text-gray-900">Audit & Logs</span>
                                </div>
                                <button
                                    onClick={() => togglePermission('auditLogs')}
                                    className={`relative w-11 h-6 rounded-full transition-colors ${permissions.auditLogs ? 'bg-emerald-500' : 'bg-gray-300'
                                        }`}
                                >
                                    <span
                                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${permissions.auditLogs ? 'translate-x-5' : 'translate-x-0'
                                            }`}
                                    />
                                </button>
                            </div>
                            <div className="p-4 space-y-2">
                                <PermissionItem text="View Audit Logs" />
                                <PermissionItem text="Export Audit Logs" />
                            </div>
                        </div>

                        {/* Settings & Security */}
                        <div className="border border-gray-200 rounded-lg">
                            <div className="flex items-center justify-between p-4 bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <Settings className="w-5 h-5 text-gray-600" />
                                    <span className="font-medium text-gray-900">Settings & Security</span>
                                </div>
                                <button
                                    onClick={() => togglePermission('settingsSecurity')}
                                    className={`relative w-11 h-6 rounded-full transition-colors ${permissions.settingsSecurity ? 'bg-emerald-500' : 'bg-gray-300'
                                        }`}
                                >
                                    <span
                                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${permissions.settingsSecurity ? 'translate-x-5' : 'translate-x-0'
                                            }`}
                                    />
                                </button>
                            </div>
                            <div className="p-4 space-y-2">
                                <PermissionItem text="Manage Branding (logo, company name, etc.)" />
                                <PermissionItem text="Configure Platform Settings (currency, timezone, etc.)" />
                                <PermissionItem text="Access Security Settings (password policies, MFA, etc.)" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex gap-3 justify-end">
                    <button
                        onClick={() => onOpenChange(false)}
                        className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCreateRole}
                        className="px-6 py-2.5 bg-[#1A4A7A] text-white rounded-lg font-medium hover:bg-[#153d66] transition-colors"
                    >
                        Create role
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

const PermissionItem = ({ text }: any) => (
    <div className="flex items-start gap-2">
        <svg
            className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
            />
        </svg>
        <span className="text-sm text-gray-700">{text}</span>
    </div>
);

export default CreateNewRole;
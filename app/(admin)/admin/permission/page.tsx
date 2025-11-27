'use client'

import CreateNewRole from '@/components/admin/permission/CreateRoleDialog'
import PermissionsMatrix from '@/components/admin/permission/PermissionMatrix'
import RolesPermissions from '@/components/admin/permission/Roles'
import React, { useState } from 'react'

const Page = () => {
    const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);

    return (
        <div className='bg-gray-50'>
            <div className="relative p-8 ">
                <div className="flex items-center justify-between">
                    {/* Left Content */}
                    <div className="flex-1 max-w-3xl">
                        <h1 className="text-2xl font-bold text-gray-900 mb-6 leading-tight">
                            Roles & Permissions
                        </h1>
                        <p className="text-base text-[#475467] leading-relaxed max-w-2xl">
                            Manage user roles and access control
                        </p>
                    </div>
                    <div className="flex-shrink-0 ml-8">
                        <button
                            onClick={() => setIsCreateRoleOpen(true)}
                            className="cursor-pointer gap-2 bg-[#1A4A7A] text-white px-6 py-3 rounded-lg font-normal text-base transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center"
                        >
                            Create new role
                        </button>
                    </div>
                </div>
            </div>
            <RolesPermissions />
            <PermissionsMatrix />

            <CreateNewRole
                open={isCreateRoleOpen}
                onOpenChange={setIsCreateRoleOpen}
            />
        </div>
    )
}

export default Page
"use client"
import React, { useState } from 'react';
import { Search, Plus, MoreVertical, ChevronDown, Eye, Edit, Trash2, UserCheck, UserX } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const UserManagement = () => {
    const [activeTab, setActiveTab] = useState('admin');
    const [showCreateAdminDialog, setShowCreateAdminDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showViewDialog, setShowViewDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        company: '',
        role: 'Founding Engineer'
    });

    const [editFormData, setEditFormData] = useState({
        fullName: '',
        email: '',
        company: '',
        role: ''
    });

    const [admins, setAdmins] = useState([
        {
            id: 1,
            name: 'Jenny Wilson',
            email: 'jessica.hanson@example.com',
            role: 'Admin',
            status: 'Active',
            lastLogin: '01:34 pm',
            company: 'Tech Corp'
        },
        {
            id: 2,
            name: 'Kristin Watson',
            email: 'nathan.roberts@example.com',
            role: 'Founding Engineer',
            status: 'Inactive',
            lastLogin: '01:55 pm',
            company: 'Innovation Labs'
        },
        {
            id: 3,
            name: 'Savannah Nguyen',
            email: 'debra.holt@example.com',
            role: 'Founding Engineer',
            status: 'Active',
            lastLogin: '05:36 pm',
            company: 'StartUp Inc'
        },
        {
            id: 4,
            name: 'Dianne Russell',
            email: 'georgia.young@example.com',
            role: 'Founding Engineer',
            status: 'Active',
            lastLogin: '02:30 pm',
            company: 'Digital Solutions'
        },
        {
            id: 5,
            name: 'Robert Fox',
            email: 'robert.fox@example.com',
            role: 'Admin',
            status: 'Active',
            lastLogin: '03:20 pm',
            company: 'Global Systems'
        },
        {
            id: 6,
            name: 'Jane Cooper',
            email: 'jane.cooper@example.com',
            role: 'Founding Engineer',
            status: 'Inactive',
            lastLogin: '04:15 pm',
            company: 'Creative Co'
        },
        {
            id: 7,
            name: 'Brooklyn Simmons',
            email: 'brooklyn.simmons@example.com',
            role: 'Admin',
            status: 'Active',
            lastLogin: '11:45 am',
            company: 'Enterprise Tech'
        },
        {
            id: 8,
            name: 'Leslie Alexander',
            email: 'leslie.alexander@example.com',
            role: 'Founding Engineer',
            status: 'Active',
            lastLogin: '09:30 am',
            company: 'Future Systems'
        }
    ]);

    const [users, setUsers] = useState([
        {
            id: 1,
            name: 'Wade Warren',
            email: 'wade.warren@example.com',
            role: 'User',
            status: 'Active',
            lastLogin: '10:20 am',
            company: 'User Company A'
        },
        {
            id: 2,
            name: 'Esther Howard',
            email: 'esther.howard@example.com',
            role: 'User',
            status: 'Active',
            lastLogin: '02:15 pm',
            company: 'User Company B'
        }
    ]);

    const totalAdmins = admins.length;
    const activeAdmins = admins.filter(a => a.status === 'Active').length;
    const inactiveAdmins = admins.filter(a => a.status === 'Inactive').length;

    const handleCreateAdmin = () => {
        const newAdmin = {
            id: admins.length + 1,
            name: formData.fullName,
            email: formData.email,
            role: formData.role,
            status: 'Active',
            lastLogin: 'Just now',
            company: formData.company
        };
        setAdmins([...admins, newAdmin]);
        setShowCreateAdminDialog(false);
        setFormData({
            fullName: '',
            email: '',
            company: '',
            role: 'Founding Engineer'
        });
    };

    const handleViewUser = (user: any) => {
        setSelectedUser(user);
        setShowViewDialog(true);
    };

    const handleEditUser = (user: any) => {
        setSelectedUser(user);
        setEditFormData({
            fullName: user.name,
            email: user.email,
            company: user.company || '',
            role: user.role
        });
        setShowEditDialog(true);
    };

    const handleUpdateUser = () => {
        if (activeTab === 'admin') {
            setAdmins(admins.map(admin =>
                admin.id === selectedUser.id
                    ? { ...admin, name: editFormData.fullName, email: editFormData.email, company: editFormData.company, role: editFormData.role }
                    : admin
            ));
        } else {
            setUsers(users.map(user =>
                user.id === selectedUser.id
                    ? { ...user, name: editFormData.fullName, email: editFormData.email, company: editFormData.company, role: editFormData.role }
                    : user
            ));
        }
        setShowEditDialog(false);
        setSelectedUser(null);
    };

    const handleDeleteUser = (user: any) => {
        setSelectedUser(user);
        setShowDeleteDialog(true);
    };

    const confirmDeleteUser = () => {
        if (activeTab === 'admin') {
            setAdmins(admins.filter(admin => admin.id !== selectedUser.id));
        } else {
            setUsers(users.filter(user => user.id !== selectedUser.id));
        }
        setShowDeleteDialog(false);
        setSelectedUser(null);
    };

    const filteredAdmins = admins.filter(admin => {
        const matchesSearch = admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            admin.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'active' && admin.status === 'Active') ||
            (filterStatus === 'inactive' && admin.status === 'Inactive');
        return matchesSearch && matchesStatus;
    });

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const currentData = activeTab === 'admin' ? filteredAdmins : filteredUsers;
    const totalPages = Math.ceil(currentData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const displayData = currentData.slice(startIndex, endIndex);

    const handlePageChange = (page: any) => {
        setCurrentPage(page);
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            setActiveTab('users');
                            setCurrentPage(1);
                        }}
                        className={`px-6 py-2 cursor-pointer rounded-lg font-medium transition-colors ${activeTab === 'users'
                            ? 'bg-gray-200 text-gray-900'
                            : 'bg-white text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        Users
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('admin');
                            setCurrentPage(1);
                        }}
                        className={`px-6 py-2 cursor-pointer rounded-lg font-medium transition-colors ${activeTab === 'admin'
                            ? 'bg-gray-200 text-gray-900'
                            : 'bg-white text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        Admin
                    </button>
                </div>

                {activeTab === 'admin' && (
                    <button
                        onClick={() => setShowCreateAdminDialog(true)}
                        className="flex cursor-pointer items-center gap-2 px-6 py-2 bg-[#1A4A7A] text-white rounded-lg hover:bg-[#153a5f] transition-colors"
                    >
                        <Plus size={20} />
                        Create admin
                    </button>
                )}
            </div>

            {/* Stats Cards */}
            {activeTab === 'admin' && (
                <div className="grid grid-cols-3 gap-6 mb-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <p className="text-sm text-gray-600 mb-2">Total Admin</p>
                        <p className="text-4xl font-bold text-gray-900">{totalAdmins}</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <p className="text-sm text-gray-600 mb-2">Active</p>
                        <p className="text-4xl font-bold text-gray-900">{activeAdmins}</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <p className="text-sm text-gray-600 mb-2">Inactive</p>
                        <p className="text-4xl font-bold text-gray-900">{inactiveAdmins}</p>
                    </div>
                </div>
            )}

            {/* Admin List */}
            <div className="bg-white border border-gray-200 rounded-lg">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        {activeTab === 'admin' ? 'Admin List' : 'User List'}
                    </h2>

                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder={`Search ${activeTab} from list`}
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {activeTab === 'admin' && (
                            <div className="relative">
                                <select
                                    value={filterStatus}
                                    onChange={(e) => {
                                        setFilterStatus(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
                                >
                                    <option value="all">All Admin</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-white border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                                    {activeTab === 'admin' ? 'Admin' : 'User'}
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Role</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Status</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Last Login</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayData.map((item) => (
                                <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-medium text-gray-900">{item.name}</p>
                                            <p className="text-sm text-gray-500">{item.email}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-700">{item.role}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-sm ${item.status === 'Active' ? 'text-green-600' : 'text-gray-500'
                                            }`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-700">{item.lastLogin}</td>
                                    <td className="px-6 py-4">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button className="text-gray-600 hover:text-gray-900">
                                                    <MoreVertical size={20} />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48">
                                                <DropdownMenuItem onClick={() => handleViewUser(item)} className="cursor-pointer">
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View User details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleEditUser(item)} className="cursor-pointer">
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit User
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDeleteUser(item)} className="cursor-pointer text-red-600">
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete User
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {activeTab === 'admin' && (
                    <div className="px-6 py-4 flex justify-between items-center">
                        <p className="text-sm text-gray-600">
                            Showing {startIndex + 1} to {Math.min(endIndex, currentData.length)} of {currentData.length} entries
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => handlePageChange(i + 1)}
                                    className={`px-4 py-2 text-sm rounded-lg ${currentPage === i + 1
                                        ? 'bg-[#1A4A7A] text-white'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Admin Dialog */}
            <Dialog open={showCreateAdminDialog} onOpenChange={setShowCreateAdminDialog}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <div className="flex justify-between items-center">
                            <DialogTitle className="text-2xl font-bold">Create Admin</DialogTitle>
                        </div>
                    </DialogHeader>

                    <div className="space-y-6 mt-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Full name<span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Enter Full name"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Work Email Address<span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                placeholder="chioma@kargoo.io"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Company / Organization<span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="chioma@kargoo.io"
                                value={formData.company}
                                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Role
                            </label>
                            <div className="relative">
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full appearance-none px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
                                >
                                    <option>Founding Engineer</option>
                                    <option>Admin</option>
                                    <option>Manager</option>
                                    <option>Developer</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 mt-8 pt-6 border-t">
                        <button
                            onClick={() => setShowCreateAdminDialog(false)}
                            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCreateAdmin}
                            disabled={!formData.fullName || !formData.email}
                            className="flex-1 px-6 py-3 bg-[#1A4A7A] text-white rounded-lg hover:bg-[#153a5f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Create admin
                        </button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* View User Dialog */}
            <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">User Details</DialogTitle>
                    </DialogHeader>

                    {selectedUser && (
                        <div className="space-y-4 mt-6">
                            <div className="flex items-center justify-center mb-6">
                                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-2xl font-bold text-blue-600">
                                        {selectedUser.name.charAt(0)}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Full Name</p>
                                    <p className="text-base font-medium text-gray-900">{selectedUser.name}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Email Address</p>
                                    <p className="text-base font-medium text-gray-900">{selectedUser.email}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Company / Organization</p>
                                    <p className="text-base font-medium text-gray-900">{selectedUser.company}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Role</p>
                                    <p className="text-base font-medium text-gray-900">{selectedUser.role}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Status</p>
                                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${selectedUser.status === 'Active'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-gray-100 text-gray-700'
                                        }`}>
                                        {selectedUser.status}
                                    </span>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Last Login</p>
                                    <p className="text-base font-medium text-gray-900">{selectedUser.lastLogin}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-4 mt-6 pt-6 border-t">
                        <button
                            onClick={() => setShowViewDialog(false)}
                            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit User Dialog */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">Edit User</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6 mt-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Full name<span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Enter Full name"
                                value={editFormData.fullName}
                                onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Work Email Address<span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                placeholder="email@example.com"
                                value={editFormData.email}
                                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Company / Organization<span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Company name"
                                value={editFormData.company}
                                onChange={(e) => setEditFormData({ ...editFormData, company: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Role
                            </label>
                            <div className="relative">
                                <select
                                    value={editFormData.role}
                                    onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                                    className="w-full appearance-none px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
                                >
                                    <option>Founding Engineer</option>
                                    <option>Admin</option>
                                    <option>Manager</option>
                                    <option>Developer</option>
                                    <option>User</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 mt-8 pt-6 border-t">
                        <button
                            onClick={() => setShowEditDialog(false)}
                            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleUpdateUser}
                            disabled={!editFormData.fullName || !editFormData.email}
                            className="flex-1 px-6 py-3 bg-[#1A4A7A] text-white rounded-lg hover:bg-[#153a5f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Update User
                        </button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete User Alert Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <div className="flex items-center justify-center mb-4">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                                <Trash2 className="w-8 h-8 text-red-600" />
                            </div>
                        </div>
                        <AlertDialogTitle className="text-center text-xl font-bold">
                            Delete {selectedUser?.name}?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-center">
                            Are you sure you want to delete this user? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex gap-4 sm:gap-4">
                        <AlertDialogCancel
                            onClick={() => setShowDeleteDialog(false)}
                            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDeleteUser}
                            className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default UserManagement;
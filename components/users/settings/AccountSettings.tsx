import { useState } from 'react';
import { Eye, EyeOff, Pencil, X } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

export default function AccountSettings() {
    const [isEditing, setIsEditing] = useState(false);
    const [showDeactivateModal, setShowDeactivateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    const [formData, setFormData] = useState({
        name: 'John Doe',
        email: 'debbie.baker@example.com',
        role: 'Procurement Manager',
        company: 'Procurement Manager',
    });

    const [editData, setEditData] = useState(formData);

    const handleEdit = () => {
        setIsEditing(true);
        setEditData(formData);
    };

    const handleSaveChanges = () => {
        setFormData(editData);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

    const handleInputChange = (e: any) => {
        const { name, value } = e.target;
        setEditData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="max-w-7xl mx-auto mb-3 bg-white p-6">
            {/* Profile Information Section */}
            <div className="bg-white rounded-lg p-8 mb-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Profile Information</h1>
                        <p className="text-gray-600 mt-1">Update your personal details and professional information</p>
                    </div>
                    <button
                        onClick={handleEdit}
                        className="flex cursor-pointer items-center gap-2 text-gray-700 hover:text-gray-900 transition"
                    >
                        <Pencil size={15} />
                        <span>Edit</span>
                    </button>
                </div>

                {/* Profile Avatar */}
                <div className="mb-8">
                    <img
                        src="/profile.png"
                        alt="Profile"
                        className="w-12 h-12 object-contain"
                    />
                </div>

                {/* Profile Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm text-gray-700 mb-2">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={isEditing ? editData.name : formData.name}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 disabled:bg-gray-50 disabled:cursor-default focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-700 mb-2">Contact Email</label>
                        <input
                            type="email"
                            name="email"
                            value={isEditing ? editData.email : formData.email}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 disabled:bg-gray-50 disabled:cursor-default focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-700 mb-2">Role</label>
                        <input
                            type="text"
                            name="role"
                            value={isEditing ? editData.role : formData.role}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 disabled:bg-gray-50 disabled:cursor-default focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-700 mb-2">Company/Organisation</label>
                        <input
                            type="text"
                            name="company"
                            value={isEditing ? editData.company : formData.company}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 disabled:bg-gray-50 disabled:cursor-default focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Edit Buttons */}
                {isEditing && (
                    <div className="flex justify-end gap-3 mt-8">
                        <button
                            onClick={handleCancel}
                            className="px-6 py-2 border cursor-pointer border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSaveChanges}
                            className="px-6 py-2 bg-[#1A4A7A] cursor-pointer text-white rounded-lg transition"
                        >
                            Save changes
                        </button>
                    </div>
                )}
            </div>

            {/* Password Management Section */}
            <div className="bg-white rounded-lg p-8 mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Password Management</h2>
                <p className="text-sm text-gray-600 mb-4">Last updated: 2 hours ago</p>
                <p className="text-gray-700 mb-6">Keep your account secure with a strong password</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm text-gray-700 mb-2">Old password</label>
                        <div className="relative">
                            <input
                                type={showOldPassword ? 'text' : 'password'}
                                value="••••••••••••"
                                readOnly
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none"
                            />
                            <button
                                onClick={() => setShowOldPassword(!showOldPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showOldPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm text-gray-700 mb-2">New password</label>
                        <div className="relative">
                            <input
                                type={showNewPassword ? 'text' : 'password'}
                                value="••••••••••••"
                                readOnly
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none"
                            />
                            <button
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <button className="px-6 py-2 cursor-pointer border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium">
                        Change password
                    </button>
                    <button className="px-6 py-2 border cursor-pointer border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium">
                        Enable 2FA
                    </button>
                </div>
            </div>

            {/* Deactivate/Delete Section */}
            <div className="bg-white rounded-lg p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Deactivate/ Permanently Delete Account</h2>
                <p className="text-gray-700 mb-6">You can choose to either temporarily deactivate or permanently delete your account.</p>

                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={() => setShowDeactivateModal(true)}
                        className="px-6 py-2 border-2 cursor-pointer border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition font-medium"
                    >
                        Deactivate account
                    </button>
                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="px-6 py-2 bg-red-600 cursor-pointer text-white rounded-lg hover:bg-red-700 transition font-medium"
                    >
                        Delete account permanently
                    </button>
                </div>
            </div>

            {/* Deactivate Account Modal */}
            <Dialog open={showDeactivateModal} onOpenChange={setShowDeactivateModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">Deactivate account</DialogTitle>
                    </DialogHeader>
                    <DialogDescription className="text-base text-gray-700">
                        Deactivating your account will temporarily hide your profile, posts, and activity from other users. You can reactivate anytime by simply logging back in with your email and password.
                    </DialogDescription>
                    <div className="flex gap-3 mt-6">
                        <button
                            onClick={() => setShowDeactivateModal(false)}
                            className="flex-1 px-4 py-2 cursor-pointer border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => setShowDeactivateModal(false)}
                            className="flex-1 px-4 cursor-pointer py-2 bg-red-600 text-nowrap text-white rounded-lg hover:bg-red-700 transition font-medium"
                        >
                            Proceed with Deactivation
                        </button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Account Modal */}
            <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">Delete account permanently</DialogTitle>
                    </DialogHeader>
                    <DialogDescription className="text-base text-gray-700">
                        If you choose to delete your account, all of your data will be permanently removed and cannot be restored. Make sure you've saved anything important before continuing
                    </DialogDescription>
                    <div className="flex gap-3 mt-6">
                        <button
                            onClick={() => setShowDeleteModal(false)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => setShowDeleteModal(false)}
                            className="flex-1 cursor-pointer px-4 py-2 bg-red-600 text-nowrap text-white rounded-lg hover:bg-red-700 transition font-medium"
                        >
                            I Understand, Delete Permanently
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
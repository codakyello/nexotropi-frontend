"use client";
import AdminSidebar from "./AdminSidebar";
import UserNavbar from "./UserNavbar";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {

    return (
        <div className="flex h-screen bg-gray-50">
            <AdminSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <UserNavbar />
                <main className="flex-1 overflow-y-auto p-6">{children}</main>
            </div>
        </div>
    );
}

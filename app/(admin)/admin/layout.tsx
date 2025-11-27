import AdminDashboardLayout from "@/components/layout/AdminDashboardLayout";


export default function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <body>
            <AdminDashboardLayout>{children}</AdminDashboardLayout>
        </body>
    );
}

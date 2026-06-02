import UserDashboardLayout from "@/components/layout/UserDashboardLayout";
import UserPrivateRoute from "@/components/layout/UserPrivateRoute";


export default function UserLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <UserPrivateRoute>
            <UserDashboardLayout>{children}</UserDashboardLayout>
        </UserPrivateRoute>
    );
}

'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

interface PrivateProps {
    children: React.ReactNode;
}

const AdminPrivateRoute: React.FC<PrivateProps> = ({ children }) => {
    const router = useRouter();
    const pathname = usePathname();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        const token = Cookies.get("access_token");
        
        if (!token) {
            setIsAuthenticated(false);
            router.push('/auth/admin/sign-in');
        } else {
            setIsAuthenticated(true);
        }
    }, [router, pathname]);

    // Still checking authentication
    if (isAuthenticated === null) {
        return null; // Or return a loading spinner
    }

    // Not authenticated, don't render children while redirecting
    if (!isAuthenticated) {
        return null;
    }

    // Authenticated, render children
    return <>{children}</>;
};

export default AdminPrivateRoute;
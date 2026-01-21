'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

interface PrivateProps {
    children: React.ReactNode;
}

const AdminPrivateRoute: React.FC<PrivateProps> = ({
    children,
}) => {
    const router = useRouter();
    const pathname = usePathname();
    const [isChecking, setIsChecking] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = Cookies.get("access_token") ?? null;
        setIsAuthenticated(Boolean(token));
        setIsChecking(false);
        if (!token) {
            router.push('/auth');
        }
    }, [router, pathname]);

    if (isChecking) return null;

    return isAuthenticated ? <>{children}</> : null;
};

export default AdminPrivateRoute;

'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

interface PrivateProps {
    children: React.ReactNode;
}

const UserPrivateRoute: React.FC<PrivateProps> = ({ children }) => {
    const router = useRouter();
    const pathname = usePathname();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        const token = Cookies.get('access_token');
        if (!token) {
            setIsAuthenticated(false);
            router.push('/auth/sign-in');
        } else {
            setIsAuthenticated(true);
        }
    }, [router, pathname]);

    if (isAuthenticated === null) return null;
    if (!isAuthenticated) return null;

    return <>{children}</>;
};

export default UserPrivateRoute;

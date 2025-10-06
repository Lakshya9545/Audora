'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const withAuth = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
  const ComponentWithAuth = (props: P) => {
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    useEffect(() => {
      const checkAuth = async () => {
        try {
          const res = await fetch('http://localhost:5000/api/auth/check', {
            method: 'GET',
            credentials: 'include', // important to send cookies
          });

          if (res.status === 200) {
            setIsAuthenticated(true);
          } else {
            router.push('/login');
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          router.push('/login');
        } finally {
          setLoading(false);
        }
      };

      checkAuth();
    }, [router]);

    if (loading) return <div className="text-center p-10 text-white">Checking auth...</div>;
    if (!isAuthenticated) return null; // Optionally add fallback

    return <WrappedComponent {...props} />;
  };

  return ComponentWithAuth;
};

export default withAuth;

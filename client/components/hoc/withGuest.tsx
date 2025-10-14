// hoc/withGuest.tsx or hoc/withGuest.jsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const withGuest = (WrappedComponent: React.ComponentType) => {
  const GuestOnly: React.FC = (props) => {
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const apiUrl = process.env.NEXT_API_PUBLIC_URL
    useEffect(() => {
      const checkAuth = async () => {
        try {
          const res = await fetch(`${apiUrl}/api/auth/check`, {
            credentials: 'include', // Important for cookies
          });

          if (res.ok) {
            const data = await res.json();
            if (data.authenticated) {
              router.replace('/dashboard'); // Redirect if already logged in
              return;
            }
          }
        } catch (err) {
          console.error('Error checking auth:', err);
        }

        setLoading(false); // If not authenticated, allow render
      };

      checkAuth();
    }, [router]);

    if (loading) return null; // Or a loading spinner if you want

    return <WrappedComponent {...props} />;
  };

  return GuestOnly;
};

export default withGuest;

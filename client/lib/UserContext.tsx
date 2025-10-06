// lib/UserContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiClient from './axios'; // Using our configured axios instance

interface UserContextType {
  userId: string | null;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType>({ userId: null, isLoading: true });

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUserAuthentication = async () => {
      try {
        // This endpoint reads the httpOnly cookie on the server and returns user data
        const response = await apiClient.get('/auth/check');
        if (response.data.authenticated && response.data.user) {
          setUserId(response.data.user.id);
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        setUserId(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserAuthentication();
  }, []);

  return (
    <UserContext.Provider value={{ userId, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};

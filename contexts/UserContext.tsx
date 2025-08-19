'use client';
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

interface User {
  fullName: string;
  email: string;
  profilePicture: string;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  useEffect(() => {
    // 🔹 Mock user data for now
    const storedUser: User = {
      fullName: 'John Doe',
      email: 'john@example.com',
      profilePicture: '/default-avatar.png',
    };
    setUser(storedUser);
    setLoading(false);
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, isSidebarOpen, toggleSidebar }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

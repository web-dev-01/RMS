'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const storedUser = {
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

export const useUser = () => useContext(UserContext);

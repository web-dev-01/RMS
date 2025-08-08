'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Avatar } from '@mui/material';
import { Home, Users, Server, Settings } from 'lucide-react';
import { ThemeProvider } from '@/components/theme-provider';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Tenants', href: '/tenants', icon: <Home className="w-4 h-4" /> },
    { label: 'Users', href: '/dashboard/users', icon: <Users className="w-4 h-4" /> },
    { label: 'Assets', href: '/dashboard/assets', icon: <Server className="w-4 h-4" /> },
    { label: 'Settings', href: '/dashboard/settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <div className="flex min-h-screen bg-[#e6f2e6]">
        {/* Sidebar */}
        <aside className="w-[220px] bg-[#15803d] text-white shadow-lg">
          <div className="p-4 text-xl font-bold tracking-wide">Portal Admin</div>
          <nav className="flex flex-col gap-1 px-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-md px-3 py-2 transition-all ${
                  pathname.startsWith(item.href)
                    ? 'bg-white text-green-800 font-semibold'
                    : 'hover:bg-green-700'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex flex-col flex-1">
          {/* Navbar */}
          <header className="flex items-center justify-between px-6 py-3 shadow-md bg-white">
            <h1 className="text-lg font-semibold text-green-800">Dashboard</h1>
            <Avatar sx={{ width: 32, height: 32 }} />
          </header>

          {/* Page Content */}
          <main className="p-6">{children}</main>
        </div>
      </div>
    </ThemeProvider>
  );
}

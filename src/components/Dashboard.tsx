'use client';

import { useState } from 'react';
import { 
  BarChart3, 
  Users, 
  ShoppingCart, 
  DollarSign, 
  Menu,
  X,
  Home,
  TrendingUp,
  Settings,
  Bell,
  MessageCircle
} from 'lucide-react';
import StatsCard from '@/components/StatsCard';
import Chart from '@/components/Chart';
import RecentActivity from '@/components/RecentActivity';
import Link from 'next/link';

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const stats = [
    {
      title: 'Total Revenue',
      value: '$45,231.89',
      change: '+20.1%',
      changeType: 'positive' as const,
      icon: DollarSign,
    },
    {
      title: 'Active Users',
      value: '2,350',
      change: '+180.1%',
      changeType: 'positive' as const,
      icon: Users,
    },
    {
      title: 'Sales',
      value: '+12,234',
      change: '+19%',
      changeType: 'positive' as const,
      icon: ShoppingCart,
    },
    {
      title: 'Conversion Rate',
      value: '3.2%',
      change: '+201',
      changeType: 'positive' as const,
      icon: BarChart3,
    },
  ];

  const navigation = [
    { name: 'Dashboard', icon: Home, current: true, href: '/' },
    { name: 'AI Chat', icon: MessageCircle, current: false, href: '/chat' },
    { name: 'Analytics', icon: TrendingUp, current: false, href: '#' },
    { name: 'Settings', icon: Settings, current: false, href: '#' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex-shrink-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="mt-6">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-6 py-3 text-sm font-medium ${
                  item.current
                    ? 'bg-blue-50 border-r-2 border-blue-500 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1"></div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <button type="button" className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500">
                <Bell className="h-6 w-6" />
              </button>
              <div className="h-6 w-px bg-gray-200" />
              <div className="flex items-center gap-x-4">
                <div className="h-8 w-8 rounded-full bg-gray-300"></div>
                <span className="text-sm font-semibold text-gray-900">Admin User</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard content */}
        <main className="flex-1 py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Page header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
              <p className="mt-2 text-sm text-gray-600">
                Welcome back! Here&apos;s what&apos;s happening with your business today.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              {stats.map((stat, index) => (
                <StatsCard key={index} {...stat} />
              ))}
            </div>

            {/* Charts and activity */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Chart />
              <RecentActivity />
            </div>
          </div>
        </main>
      </div>

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
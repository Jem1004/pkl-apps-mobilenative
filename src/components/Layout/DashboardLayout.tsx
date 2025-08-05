/**
 * Dashboard Layout Component
 * Provides common layout structure for all dashboard pages
 */
import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  Home,
  Users,
  MapPin,
  Clock,
  BookOpen,
  FileText,
  Settings,
  LogOut,
  User,
  Bell,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: ReactNode;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: ('admin' | 'guru' | 'siswa')[];
}

const navigation: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    roles: ['admin', 'guru', 'siswa']
  },
  {
    name: 'Manajemen User',
    href: '/admin/users',
    icon: Users,
    roles: ['admin']
  },
  {
    name: 'Tempat PKL',
    href: '/admin/tempat-pkl',
    icon: MapPin,
    roles: ['admin', 'guru']
  },
  {
    name: 'Absensi',
    href: '/absensi',
    icon: Clock,
    roles: ['admin', 'guru', 'siswa']
  },
  {
    name: 'Jurnal',
    href: '/jurnal',
    icon: BookOpen,
    roles: ['admin', 'guru', 'siswa']
  },
  {
    name: 'Laporan',
    href: '/reports',
    icon: FileText,
    roles: ['admin', 'guru']
  },
  {
    name: 'Pengaturan',
    href: '/settings',
    icon: Settings,
    roles: ['admin']
  }
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMinimized, setSidebarMinimized] = useState(false);
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  // Filter navigation based on user role
  const filteredNavigation = navigation.filter(item => 
    user && item.roles.includes(user.role)
  );
  
  // Adjust href based on user role
  const getNavHref = (href: string) => {
    if (href === '/dashboard') {
      return `/${user?.role}/dashboard`;
    }
    if (href.startsWith('/admin/') && user?.role !== 'admin') {
      return href.replace('/admin/', `/${user?.role}/`);
    }
    if (!href.startsWith('/admin/') && !href.startsWith('/guru/') && !href.startsWith('/siswa/')) {
      return `/${user?.role}${href}`;
    }
    return href;
  };
  
  const isCurrentPath = (href: string) => {
    const adjustedHref = getNavHref(href);
    return location.pathname === adjustedHref || location.pathname.startsWith(adjustedHref + '/');
  };
  
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-900 bg-opacity-50 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 bg-white shadow-2xl transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:relative lg:flex lg:flex-col border-r border-gray-100",
        sidebarMinimized ? "lg:w-20" : "lg:w-72",
        "w-72",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-20 px-6 bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg">
            <div className={cn(
              "flex items-center transition-all duration-300",
              sidebarMinimized ? "justify-center w-full" : "space-x-3"
            )}>
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Clock className="w-6 h-6 text-white" />
              </div>
              {!sidebarMinimized && (
                <div>
                  <span className="text-xl font-bold text-white">PKL System</span>
                  <p className="text-xs text-blue-100">Management Portal</p>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {/* Minimize/Expand button - only on desktop */}
              <button
                onClick={() => setSidebarMinimized(!sidebarMinimized)}
                className="hidden lg:block p-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors"
                title={sidebarMinimized ? "Expand Sidebar" : "Minimize Sidebar"}
              >
                {sidebarMinimized ? (
                  <ChevronRight className="w-5 h-5 text-white" />
                ) : (
                  <ChevronLeft className="w-5 h-5 text-white" />
                )}
              </button>
              {/* Close button - only on mobile */}
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {filteredNavigation.map((item) => {
              const Icon = item.icon;
              const href = getNavHref(item.href);
              const isActive = isCurrentPath(item.href);
              
              return (
                <Link
                  key={item.name}
                  to={href}
                  className={cn(
                    "group flex items-center text-sm font-medium rounded-xl transition-all duration-200 transform hover:scale-105 relative",
                    sidebarMinimized ? "px-3 py-3 justify-center" : "px-4 py-3",
                    isActive
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  )}
                  onClick={() => setSidebarOpen(false)}
                  title={sidebarMinimized ? item.name : undefined}
                >
                  <Icon className={cn(
                    "h-5 w-5 transition-colors",
                    sidebarMinimized ? "mr-0" : "mr-4",
                    isActive ? "text-white" : "text-gray-400 group-hover:text-gray-600"
                  )} />
                  {!sidebarMinimized && (
                    <>
                      <span className="font-medium">{item.name}</span>
                      {isActive && (
                        <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </>
                  )}
                  {sidebarMinimized && isActive && (
                    <div className="absolute right-1 w-2 h-2 bg-white rounded-full"></div>
                  )}
                </Link>
              );
            })}
          </nav>
          
          {/* User info and logout */}
          <div className="border-t border-gray-100 p-4 bg-gray-50">
            <div className={cn(
              "flex items-center mb-4 p-3 bg-white rounded-xl shadow-sm",
              sidebarMinimized ? "justify-center" : "space-x-3"
            )}>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              {!sidebarMinimized && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {user?.nama}
                  </p>
                  <p className="text-xs text-gray-500 capitalize bg-gray-100 px-2 py-1 rounded-full inline-block">
                    {user?.role}
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={handleLogout}
              className={cn(
                "w-full flex items-center text-sm font-medium text-gray-700 rounded-xl hover:bg-red-50 hover:text-red-700 transition-all duration-200 group",
                sidebarMinimized ? "px-3 py-3 justify-center" : "px-4 py-3"
              )}
              title={sidebarMinimized ? "Keluar" : undefined}
            >
              <LogOut className={cn(
                "h-4 w-4 text-gray-400 group-hover:text-red-500",
                sidebarMinimized ? "mr-0" : "mr-3"
              )} />
              {!sidebarMinimized && <span>Keluar</span>}
            </button>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-100">
          <div className="flex items-center justify-between h-16 px-6 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors group">
                <Bell className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              <div className="flex items-center space-x-3 bg-gray-50 rounded-xl p-2 hover:bg-gray-100 transition-colors">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-gray-900">{user?.nama}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Page content */}
        <main className="flex-1 p-6 lg:p-8 space-y-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
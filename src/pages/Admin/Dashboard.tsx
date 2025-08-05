/**
 * Admin Dashboard Page
 * Displays overview statistics and quick actions for administrators
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  MapPin,
  Clock,
  BookOpen,
  TrendingUp,
  AlertCircle,
  Plus,
  FileText,
  Calendar
} from 'lucide-react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

interface DashboardStats {
  total_students: number;
  attendance_today: {
    hadir: number;
    terlambat: number;
    alpha: number;
  };
  journal_this_month: {
    pending: number;
    approved: number;
    rejected: number;
  };
  pkl_locations: Array<{
    _id: string;
    count: number;
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuthStore();
  
  useEffect(() => {
    fetchDashboardStats();
  }, []);
  
  const fetchDashboardStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/reports/dashboard-stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch dashboard stats');
      }
      
      setStats(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard stats');
    } finally {
      setIsLoading(false);
    }
  };
  
  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color, 
    trend, 
    description 
  }: {
    title: string;
    value: string | number;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    trend?: string;
    description?: string;
  }) => (
    <div className="group bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-gray-200 transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-3 mb-1">{value}</p>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>
        <div className={cn("p-4 rounded-xl shadow-sm group-hover:shadow-md transition-shadow duration-300", color)}>
          <Icon className="h-7 w-7 text-white" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center bg-green-50 rounded-lg px-3 py-2">
          <TrendingUp className="h-4 w-4 text-green-600 mr-2" />
          <span className="text-sm font-medium text-green-700">{trend}</span>
        </div>
      )}
    </div>
  );
  
  const QuickActionCard = ({ 
    title, 
    description, 
    icon: Icon, 
    href, 
    color 
  }: {
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    href: string;
    color: string;
  }) => (
    <Link
      to={href}
      className="group block bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-gray-200 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
    >
      <div className="flex items-start space-x-4">
        <div className={cn("p-3 rounded-xl shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:scale-110", color)}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">{title}</h3>
          <p className="text-sm text-gray-600 mt-1 leading-relaxed">{description}</p>
        </div>
      </div>
    </Link>
  );
  
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 bg-blue-600 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  if (error) {
    return (
      <DashboardLayout>
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-6 shadow-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-red-800">Terjadi Kesalahan</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <button 
                onClick={fetchDashboardStats}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Muat Ulang
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 -m-4 p-4">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Dashboard Admin
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Selamat datang! Berikut adalah ringkasan sistem PKL hari ini.
              </p>
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-3 rounded-xl shadow-sm">
              <p className="text-sm font-medium">
                {new Date().toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <StatCard
            title="Total Siswa"
            value={stats?.total_students || 0}
            icon={Users}
            color="bg-gradient-to-r from-blue-500 to-blue-600"
            description="Siswa aktif"
          />
          
          <StatCard
            title="Hadir Hari Ini"
            value={stats?.attendance_today.hadir || 0}
            icon={Clock}
            color="bg-gradient-to-r from-green-500 to-emerald-600"
            description="Siswa hadir"
          />
          
          <StatCard
            title="Terlambat"
            value={stats?.attendance_today.terlambat || 0}
            icon={AlertCircle}
            color="bg-gradient-to-r from-yellow-500 to-amber-600"
            description="Siswa terlambat"
          />
          
          <StatCard
            title="Alpha"
            value={stats?.attendance_today.alpha || 0}
            icon={Users}
            color="bg-gradient-to-r from-red-500 to-rose-600"
            description="Siswa tidak hadir"
          />
        </div>
          
          {/* Journal Stats */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Statistik Jurnal</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              <StatCard
                title="Jurnal Pending"
                value={stats?.journal_this_month.pending || 0}
                icon={BookOpen}
                color="bg-gradient-to-r from-orange-500 to-amber-500"
                description="Menunggu review"
              />
              
              <StatCard
                title="Jurnal Disetujui"
                value={stats?.journal_this_month.approved || 0}
                icon={BookOpen}
                color="bg-gradient-to-r from-green-500 to-emerald-500"
                description="Bulan ini"
              />
              
              <StatCard
                title="Jurnal Ditolak"
                value={stats?.journal_this_month.rejected || 0}
                icon={BookOpen}
                color="bg-gradient-to-r from-red-500 to-rose-500"
                description="Perlu perbaikan"
              />
            </div>
          </div>
          
          {/* Quick Actions */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Aksi Cepat</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 lg:gap-6">
            <QuickActionCard
              title="Tambah User"
              description="Tambah siswa, guru, atau admin baru"
              icon={Plus}
              href="/admin/users/create"
              color="bg-gradient-to-r from-blue-500 to-blue-600"
            />
            
            <QuickActionCard
              title="Kelola Tempat PKL"
              description="Tambah atau edit tempat PKL"
              icon={MapPin}
              href="/admin/tempat-pkl"
              color="bg-gradient-to-r from-green-500 to-emerald-600"
            />
            
            <QuickActionCard
              title="Lihat Laporan"
              description="Export laporan absensi dan jurnal"
              icon={FileText}
              href="/admin/reports"
              color="bg-gradient-to-r from-purple-500 to-violet-600"
            />
            
            <QuickActionCard
              title="Review Jurnal"
              description="Review jurnal siswa yang pending"
              icon={BookOpen}
              href="/admin/jurnal?status=pending"
              color="bg-gradient-to-r from-orange-500 to-amber-600"
            />
            
            <QuickActionCard
              title="Absensi Hari Ini"
              description="Lihat absensi siswa hari ini"
              icon={Calendar}
              href="/admin/absensi?date=today"
              color="bg-gradient-to-r from-indigo-500 to-blue-600"
            />
            
            <QuickActionCard
              title="Pengaturan"
              description="Konfigurasi sistem dan jam kerja"
              icon={Users}
              href="/admin/settings"
              color="bg-gradient-to-r from-gray-500 to-slate-600"
            />
          </div>
        </div>
          
          {/* PKL Locations */}
          {stats?.pkl_locations && stats.pkl_locations.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Distribusi Tempat PKL</h2>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8">
                <div className="space-y-4">
                  {stats.pkl_locations.slice(0, 5).map((location, index) => (
                    <div key={location._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                          <span className="text-sm font-bold text-white">{index + 1}</span>
                        </div>
                        <span className="text-gray-900 font-medium">{location._id || 'Belum ditentukan'}</span>
                      </div>
                      <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                        <span className="text-sm font-medium">
                          {location.count} siswa
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
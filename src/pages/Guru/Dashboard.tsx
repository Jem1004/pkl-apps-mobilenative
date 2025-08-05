/**
 * Guru Dashboard Page
 * Displays overview statistics and quick actions for teachers
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Clock,
  BookOpen,
  TrendingUp,
  AlertCircle,
  FileText,
  Calendar,
  CheckCircle,
  XCircle
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

export default function GuruDashboard() {
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
        </div>
        <div className={cn("p-3 rounded-full", color)}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center">
          <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
          <span className="text-sm text-green-600">{trend}</span>
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
      className="block bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center space-x-4">
        <div className={cn("p-3 rounded-full", color)}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </Link>
  );
  
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  if (error) {
    return (
      <DashboardLayout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-6 w-6 text-red-500" />
            <div>
              <h3 className="text-lg font-semibold text-red-800">Error</h3>
              <p className="text-red-700">{error}</p>
              <button
                onClick={fetchDashboardStats}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Coba lagi
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  const attendancePercentage = stats ? 
    Math.round((stats.attendance_today.hadir / stats.total_students) * 100) : 0;
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Guru</h1>
            <p className="text-gray-600 mt-1">
              Pantau perkembangan siswa PKL dan kelola jurnal harian.
            </p>
          </div>
          <div className="text-sm text-gray-500">
            {new Date().toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>
        
        {/* Attendance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Siswa"
            value={stats?.total_students || 0}
            icon={Users}
            color="bg-blue-500"
            description="Siswa bimbingan"
          />
          
          <StatCard
            title="Tingkat Kehadiran"
            value={`${attendancePercentage}%`}
            icon={TrendingUp}
            color="bg-green-500"
            description="Hari ini"
          />
          
          <StatCard
            title="Hadir Hari Ini"
            value={stats?.attendance_today.hadir || 0}
            icon={CheckCircle}
            color="bg-emerald-500"
            description="Siswa hadir"
          />
          
          <StatCard
            title="Perlu Perhatian"
            value={(stats?.attendance_today.terlambat || 0) + (stats?.attendance_today.alpha || 0)}
            icon={AlertCircle}
            color="bg-red-500"
            description="Terlambat + Alpha"
          />
        </div>
        
        {/* Journal Review Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Jurnal Pending"
            value={stats?.journal_this_month.pending || 0}
            icon={BookOpen}
            color="bg-orange-500"
            description="Menunggu review"
          />
          
          <StatCard
            title="Jurnal Disetujui"
            value={stats?.journal_this_month.approved || 0}
            icon={CheckCircle}
            color="bg-green-500"
            description="Bulan ini"
          />
          
          <StatCard
            title="Jurnal Ditolak"
            value={stats?.journal_this_month.rejected || 0}
            icon={XCircle}
            color="bg-red-500"
            description="Perlu perbaikan"
          />
        </div>
        
        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Aksi Cepat</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <QuickActionCard
              title="Review Jurnal"
              description="Review jurnal siswa yang pending"
              icon={BookOpen}
              href="/guru/jurnal?status=pending"
              color="bg-orange-500"
            />
            
            <QuickActionCard
              title="Absensi Hari Ini"
              description="Lihat dan kelola absensi siswa"
              icon={Calendar}
              href="/guru/absensi?date=today"
              color="bg-blue-500"
            />
            
            <QuickActionCard
              title="Input Absensi Manual"
              description="Tambah absensi untuk siswa"
              icon={Clock}
              href="/guru/absensi/manual"
              color="bg-green-500"
            />
            
            <QuickActionCard
              title="Lihat Laporan"
              description="Export laporan absensi dan jurnal"
              icon={FileText}
              href="/guru/reports"
              color="bg-purple-500"
            />
            
            <QuickActionCard
              title="Data Siswa"
              description="Lihat profil dan data siswa"
              icon={Users}
              href="/guru/students"
              color="bg-indigo-500"
            />
            
            <QuickActionCard
              title="Tempat PKL"
              description="Kelola data tempat PKL"
              icon={Users}
              href="/guru/tempat-pkl"
              color="bg-teal-500"
            />
          </div>
        </div>
        
        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Attendance Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan Absensi Hari Ini</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Hadir</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {stats?.attendance_today.hadir || 0} siswa
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Terlambat</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {stats?.attendance_today.terlambat || 0} siswa
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Alpha</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {stats?.attendance_today.alpha || 0} siswa
                </span>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <Link
                to="/guru/absensi?date=today"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Lihat detail absensi &rarr;
              </Link>
            </div>
          </div>
          
          {/* Journal Review Queue */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Antrian Review Jurnal</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Pending</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {stats?.journal_this_month.pending || 0} jurnal
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Disetujui</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {stats?.journal_this_month.approved || 0} jurnal
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Ditolak</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {stats?.journal_this_month.rejected || 0} jurnal
                </span>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <Link
                to="/guru/jurnal?status=pending"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Review jurnal pending &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
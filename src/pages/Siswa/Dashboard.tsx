/**
 * Siswa Dashboard Page
 * Displays personal attendance stats, journal status, and quick actions for students
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  BookOpen,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  MapPin,
  TrendingUp,
  Plus,
  Eye
} from 'lucide-react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

interface StudentDashboardStats {
  attendance_this_month: {
    hadir: number;
    terlambat: number;
    alpha: number;
    total_days: number;
  };
  journal_this_month: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  };
  today_attendance: {
    status: 'hadir' | 'terlambat' | 'alpha' | null;
    check_in_time?: string;
    check_out_time?: string;
  };
  pkl_location: {
    nama: string;
    alamat: string;
    pembimbing: string;
  } | null;
}

export default function SiswaDashboard() {
  const [stats, setStats] = useState<StudentDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token, user } = useAuthStore();
  
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
    description,
    trend 
  }: {
    title: string;
    value: string | number;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    description?: string;
    trend?: string;
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
    color,
    disabled = false
  }: {
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    href: string;
    color: string;
    disabled?: boolean;
  }) => {
    if (disabled) {
      return (
        <div
          className={cn(
            "block bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-shadow opacity-50 cursor-not-allowed"
          )}
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
        </div>
      );
    }
    
    return (
      <Link
        to={href}
        className={cn(
          "block bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-shadow hover:shadow-md cursor-pointer"
        )}
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
  };
  
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
  
  const attendancePercentage = stats && stats.attendance_this_month.total_days > 0 ? 
    Math.round((stats.attendance_this_month.hadir / stats.attendance_this_month.total_days) * 100) : 0;
  
  const journalCompletionRate = stats && stats.journal_this_month.total > 0 ?
    Math.round((stats.journal_this_month.approved / stats.journal_this_month.total) * 100) : 0;
  
  const todayStatus = stats?.today_attendance.status;
  const hasCheckedIn = todayStatus && ['hadir', 'terlambat'].includes(todayStatus);
  const hasCheckedOut = stats?.today_attendance.check_out_time;
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Siswa</h1>
            <p className="text-gray-600 mt-1">
              Selamat datang, {user?.nama}! Pantau kehadiran dan jurnal PKL Anda.
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
        
        {/* Today's Status */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <h2 className="text-xl font-semibold mb-4">Status Hari Ini</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span className="font-medium">Absensi</span>
              </div>
              <p className="text-2xl font-bold mt-2">
                {todayStatus ? (
                  todayStatus === 'hadir' ? 'Hadir' :
                  todayStatus === 'terlambat' ? 'Terlambat' : 'Alpha'
                ) : 'Belum Absen'}
              </p>
              {stats?.today_attendance.check_in_time && (
                <p className="text-sm opacity-90">
                  Masuk: {new Date(stats.today_attendance.check_in_time).toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              )}
            </div>
            
            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Check Out</span>
              </div>
              <p className="text-2xl font-bold mt-2">
                {hasCheckedOut ? 'Selesai' : 'Belum'}
              </p>
              {stats?.today_attendance.check_out_time && (
                <p className="text-sm opacity-90">
                  Keluar: {new Date(stats.today_attendance.check_out_time).toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              )}
            </div>
            
            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5" />
                <span className="font-medium">Jurnal Hari Ini</span>
              </div>
              <p className="text-2xl font-bold mt-2">-</p>
              <p className="text-sm opacity-90">Belum dibuat</p>
            </div>
          </div>
        </div>
        
        {/* Monthly Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Tingkat Kehadiran"
            value={`${attendancePercentage}%`}
            icon={TrendingUp}
            color="bg-green-500"
            description="Bulan ini"
          />
          
          <StatCard
            title="Hari Hadir"
            value={stats?.attendance_this_month.hadir || 0}
            icon={CheckCircle}
            color="bg-blue-500"
            description={`dari ${stats?.attendance_this_month.total_days || 0} hari`}
          />
          
          <StatCard
            title="Jurnal Disetujui"
            value={`${journalCompletionRate}%`}
            icon={BookOpen}
            color="bg-emerald-500"
            description="Tingkat persetujuan"
          />
          
          <StatCard
            title="Jurnal Pending"
            value={stats?.journal_this_month.pending || 0}
            icon={AlertCircle}
            color="bg-orange-500"
            description="Menunggu review"
          />
        </div>
        
        {/* PKL Location Info */}
        {stats?.pkl_location && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-blue-500" />
              Tempat PKL
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Nama Tempat</p>
                <p className="text-gray-900 mt-1">{stats.pkl_location.nama}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Alamat</p>
                <p className="text-gray-900 mt-1">{stats.pkl_location.alamat}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Pembimbing</p>
                <p className="text-gray-900 mt-1">{stats.pkl_location.pembimbing}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Aksi Cepat</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <QuickActionCard
              title="Absen Masuk"
              description="Check in untuk hari ini"
              icon={Clock}
              href="/siswa/absensi/checkin"
              color="bg-green-500"
              disabled={hasCheckedIn}
            />
            
            <QuickActionCard
              title="Absen Keluar"
              description="Check out setelah selesai PKL"
              icon={CheckCircle}
              href="/siswa/absensi/checkout"
              color="bg-blue-500"
              disabled={!hasCheckedIn || !!hasCheckedOut}
            />
            
            <QuickActionCard
              title="Tulis Jurnal"
              description="Buat jurnal kegiatan hari ini"
              icon={Plus}
              href="/siswa/jurnal/create"
              color="bg-purple-500"
            />
            
            <QuickActionCard
              title="Lihat Jurnal"
              description="Lihat semua jurnal yang telah dibuat"
              icon={Eye}
              href="/siswa/jurnal"
              color="bg-indigo-500"
            />
            
            <QuickActionCard
              title="Riwayat Absensi"
              description="Lihat riwayat kehadiran"
              icon={Calendar}
              href="/siswa/absensi/history"
              color="bg-teal-500"
            />
            
            <QuickActionCard
              title="Profil"
              description="Lihat dan edit profil"
              icon={Eye}
              href="/siswa/profile"
              color="bg-gray-500"
            />
          </div>
        </div>
        
        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Attendance Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan Absensi Bulan Ini</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Hadir</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {stats?.attendance_this_month.hadir || 0} hari
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Terlambat</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {stats?.attendance_this_month.terlambat || 0} hari
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Alpha</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {stats?.attendance_this_month.alpha || 0} hari
                </span>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <Link
                to="/siswa/absensi/history"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Lihat riwayat lengkap &rarr;
              </Link>
            </div>
          </div>
          
          {/* Journal Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Jurnal Bulan Ini</h3>
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
                to="/siswa/jurnal"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Lihat semua jurnal &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
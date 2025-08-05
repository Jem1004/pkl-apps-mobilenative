import { useState, useEffect } from 'react';
import {
  Settings,
  User,
  Bell,
  Shield,
  Database,
  Mail,
  Globe,
  Save,
  Eye,
  EyeOff,
  Upload,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  School,
  Calendar,
  Clock
} from 'lucide-react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';

interface AdminProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: string;
  last_login: string;
}

interface SystemSettings {
  school_name: string;
  school_address: string;
  school_phone: string;
  school_email: string;
  academic_year: string;
  semester: string;
  pkl_start_date: string;
  pkl_end_date: string;
  working_hours_start: string;
  working_hours_end: string;
  timezone: string;
  date_format: string;
  language: string;
}

interface NotificationSettings {
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  daily_reports: boolean;
  weekly_reports: boolean;
  absence_alerts: boolean;
  journal_alerts: boolean;
  system_maintenance: boolean;
}

interface SecuritySettings {
  two_factor_auth: boolean;
  session_timeout: number;
  password_expiry: number;
  login_attempts: number;
  ip_whitelist: string[];
  backup_frequency: string;
  data_retention: number;
}

// Mock data untuk development
const mockAdminProfile: AdminProfile = {
  id: '1',
  name: 'Administrator',
  email: 'admin@smkn1.sch.id',
  phone: '+62812345678',
  role: 'Super Admin',
  last_login: '2024-01-15 08:30:00'
};

const mockSystemSettings: SystemSettings = {
  school_name: 'SMK Negeri 1 Jakarta',
  school_address: 'Jl. Pendidikan No. 123, Jakarta Pusat',
  school_phone: '+62211234567',
  school_email: 'info@smkn1.sch.id',
  academic_year: '2023/2024',
  semester: 'Ganjil',
  pkl_start_date: '2024-01-15',
  pkl_end_date: '2024-06-15',
  working_hours_start: '08:00',
  working_hours_end: '16:00',
  timezone: 'Asia/Jakarta',
  date_format: 'DD/MM/YYYY',
  language: 'id'
};

const mockNotificationSettings: NotificationSettings = {
  email_notifications: true,
  sms_notifications: false,
  push_notifications: true,
  daily_reports: true,
  weekly_reports: true,
  absence_alerts: true,
  journal_alerts: true,
  system_maintenance: true
};

const mockSecuritySettings: SecuritySettings = {
  two_factor_auth: false,
  session_timeout: 30,
  password_expiry: 90,
  login_attempts: 5,
  ip_whitelist: ['192.168.1.0/24'],
  backup_frequency: 'daily',
  data_retention: 365
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [adminProfile, setAdminProfile] = useState<AdminProfile>(mockAdminProfile);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(mockSystemSettings);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(mockNotificationSettings);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>(mockSecuritySettings);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { token } = useAuthStore();

  useEffect(() => {
    // Uncomment when API is ready
    // fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAdminProfile(data.profile || mockAdminProfile);
        setSystemSettings(data.system || mockSystemSettings);
        setNotificationSettings(data.notifications || mockNotificationSettings);
        setSecuritySettings(data.security || mockSecuritySettings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Gagal memuat pengaturan');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (type: string, data: any) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/settings/${type}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        toast.success('Pengaturan berhasil disimpan');
      } else {
        toast.error('Gagal menyimpan pengaturan');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Gagal menyimpan pengaturan');
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Konfirmasi password tidak cocok');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password minimal 8 karakter');
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch('/api/admin/change-password', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ new_password: newPassword })
      });
      
      if (response.ok) {
        toast.success('Password berhasil diubah');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error('Gagal mengubah password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Gagal mengubah password');
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/export-data', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup-${new Date().toISOString().split('T')[0]}.zip`;
        a.click();
        toast.success('Data berhasil diekspor');
      } else {
        toast.error('Gagal mengekspor data');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Gagal mengekspor data');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profil Admin', icon: User },
    { id: 'system', label: 'Sistem', icon: Settings },
    { id: 'notifications', label: 'Notifikasi', icon: Bell },
    { id: 'security', label: 'Keamanan', icon: Shield },
    { id: 'data', label: 'Data &amp; Backup', icon: Database }
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat pengaturan...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pengaturan</h1>
          <p className="text-gray-600 mt-1">Kelola pengaturan sistem dan profil administrator</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Profil Administrator</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
                    <input
                      type="text"
                      value={adminProfile.name}
                      onChange={(e) => setAdminProfile({...adminProfile, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={adminProfile.email}
                      onChange={(e) => setAdminProfile({...adminProfile, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nomor Telepon</label>
                    <input
                      type="tel"
                      value={adminProfile.phone}
                      onChange={(e) => setAdminProfile({...adminProfile, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password Baru</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Masukkan password baru"
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Konfirmasi Password</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Konfirmasi password baru"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Informasi Login Terakhir:</p>
                    <p className="text-sm font-medium text-gray-900">{adminProfile.last_login}</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => saveSettings('profile', adminProfile)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Simpan Profil
                </button>
                {newPassword && (
                  <button
                    onClick={changePassword}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Ubah Password
                  </button>
                )}
              </div>
            </div>
          )}

          {/* System Tab */}
          {activeTab === 'system' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Pengaturan Sistem</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 flex items-center">
                    <School className="w-4 h-4 mr-2" />
                    Informasi Sekolah
                  </h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nama Sekolah</label>
                    <input
                      type="text"
                      value={systemSettings.school_name}
                      onChange={(e) => setSystemSettings({...systemSettings, school_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Alamat</label>
                    <textarea
                      value={systemSettings.school_address}
                      onChange={(e) => setSystemSettings({...systemSettings, school_address: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Telepon</label>
                    <input
                      type="tel"
                      value={systemSettings.school_phone}
                      onChange={(e) => setSystemSettings({...systemSettings, school_phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={systemSettings.school_email}
                      onChange={(e) => setSystemSettings({...systemSettings, school_email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Pengaturan Akademik
                  </h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tahun Ajaran</label>
                    <input
                      type="text"
                      value={systemSettings.academic_year}
                      onChange={(e) => setSystemSettings({...systemSettings, academic_year: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
                    <select
                      value={systemSettings.semester}
                      onChange={(e) => setSystemSettings({...systemSettings, semester: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Ganjil">Ganjil</option>
                      <option value="Genap">Genap</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Mulai PKL</label>
                    <input
                      type="date"
                      value={systemSettings.pkl_start_date}
                      onChange={(e) => setSystemSettings({...systemSettings, pkl_start_date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Selesai PKL</label>
                    <input
                      type="date"
                      value={systemSettings.pkl_end_date}
                      onChange={(e) => setSystemSettings({...systemSettings, pkl_end_date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Jam Masuk</label>
                      <input
                        type="time"
                        value={systemSettings.working_hours_start}
                        onChange={(e) => setSystemSettings({...systemSettings, working_hours_start: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Jam Pulang</label>
                      <input
                        type="time"
                        value={systemSettings.working_hours_end}
                        onChange={(e) => setSystemSettings({...systemSettings, working_hours_end: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <button
                  onClick={() => saveSettings('system', systemSettings)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Simpan Pengaturan
                </button>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Pengaturan Notifikasi</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Metode Notifikasi</h4>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={notificationSettings.email_notifications}
                        onChange={(e) => setNotificationSettings({...notificationSettings, email_notifications: e.target.checked})}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Notifikasi Email</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={notificationSettings.sms_notifications}
                        onChange={(e) => setNotificationSettings({...notificationSettings, sms_notifications: e.target.checked})}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Notifikasi SMS</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={notificationSettings.push_notifications}
                        onChange={(e) => setNotificationSettings({...notificationSettings, push_notifications: e.target.checked})}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Push Notification</span>
                    </label>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Jenis Notifikasi</h4>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={notificationSettings.daily_reports}
                        onChange={(e) => setNotificationSettings({...notificationSettings, daily_reports: e.target.checked})}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Laporan Harian</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={notificationSettings.weekly_reports}
                        onChange={(e) => setNotificationSettings({...notificationSettings, weekly_reports: e.target.checked})}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Laporan Mingguan</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={notificationSettings.absence_alerts}
                        onChange={(e) => setNotificationSettings({...notificationSettings, absence_alerts: e.target.checked})}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Alert Ketidakhadiran</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={notificationSettings.journal_alerts}
                        onChange={(e) => setNotificationSettings({...notificationSettings, journal_alerts: e.target.checked})}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Alert Jurnal Baru</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={notificationSettings.system_maintenance}
                        onChange={(e) => setNotificationSettings({...notificationSettings, system_maintenance: e.target.checked})}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Maintenance Sistem</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <button
                  onClick={() => saveSettings('notifications', notificationSettings)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Simpan Pengaturan
                </button>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Pengaturan Keamanan</h3>
              <div className="space-y-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex">
                    <AlertTriangle className="w-5 h-5 text-yellow-400 mr-2" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800">Peringatan Keamanan</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Pengaturan keamanan yang salah dapat mengakibatkan sistem tidak dapat diakses.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Autentikasi</h4>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={securitySettings.two_factor_auth}
                        onChange={(e) => setSecuritySettings({...securitySettings, two_factor_auth: e.target.checked})}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Two-Factor Authentication</span>
                    </label>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (menit)</label>
                      <input
                        type="number"
                        value={securitySettings.session_timeout}
                        onChange={(e) => setSecuritySettings({...securitySettings, session_timeout: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Password Expiry (hari)</label>
                      <input
                        type="number"
                        value={securitySettings.password_expiry}
                        onChange={(e) => setSecuritySettings({...securitySettings, password_expiry: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Max Login Attempts</label>
                      <input
                        type="number"
                        value={securitySettings.login_attempts}
                        onChange={(e) => setSecuritySettings({...securitySettings, login_attempts: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Backup &amp; Data</h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Frekuensi Backup</label>
                      <select
                        value={securitySettings.backup_frequency}
                        onChange={(e) => setSecuritySettings({...securitySettings, backup_frequency: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="daily">Harian</option>
                        <option value="weekly">Mingguan</option>
                        <option value="monthly">Bulanan</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Data Retention (hari)</label>
                      <input
                        type="number"
                        value={securitySettings.data_retention}
                        onChange={(e) => setSecuritySettings({...securitySettings, data_retention: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">IP Whitelist</label>
                      <textarea
                        value={securitySettings.ip_whitelist.join('\n')}
                        onChange={(e) => setSecuritySettings({...securitySettings, ip_whitelist: e.target.value.split('\n').filter(ip => ip.trim())})}
                        rows={4}
                        placeholder="192.168.1.0/24\n10.0.0.0/8"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">Satu IP/CIDR per baris</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <button
                  onClick={() => saveSettings('security', securitySettings)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Simpan Pengaturan
                </button>
              </div>
            </div>
          )}

          {/* Data & Backup Tab */}
          {activeTab === 'data' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Data &amp; Backup</h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-center mb-4">
                      <Download className="w-6 h-6 text-blue-600 mr-3" />
                      <h4 className="font-medium text-blue-900">Export Data</h4>
                    </div>
                    <p className="text-sm text-blue-700 mb-4">
                      Ekspor semua data sistem untuk backup atau migrasi.
                    </p>
                    <button
                      onClick={exportData}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export Data
                    </button>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <div className="flex items-center mb-4">
                      <Upload className="w-6 h-6 text-green-600 mr-3" />
                      <h4 className="font-medium text-green-900">Import Data</h4>
                    </div>
                    <p className="text-sm text-green-700 mb-4">
                      Import data dari file backup sebelumnya.
                    </p>
                    <input
                      type="file"
                      accept=".zip,.sql"
                      className="hidden"
                      id="import-file"
                    />
                    <label
                      htmlFor="import-file"
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center cursor-pointer"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Import Data
                    </label>
                  </div>
                </div>
                
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                    <Database className="w-5 h-5 mr-2" />
                    Status Database
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">99.9%</p>
                      <p className="text-sm text-gray-600">Uptime</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">2.3GB</p>
                      <p className="text-sm text-gray-600">Database Size</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">1,247</p>
                      <p className="text-sm text-gray-600">Total Records</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <RefreshCw className="w-6 h-6 text-yellow-600 mr-3" />
                    <h4 className="font-medium text-yellow-900">Maintenance Mode</h4>
                  </div>
                  <p className="text-sm text-yellow-700 mb-4">
                    Aktifkan mode maintenance untuk melakukan pemeliharaan sistem.
                  </p>
                  <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Enable Maintenance
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
import { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Users,
  TrendingUp,
  FileText,
  Download,
  Filter,
  BarChart3,
  PieChart,
  User,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  BookOpen,
  Building
} from 'lucide-react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

interface ReportData {
  overview: {
    total_siswa: number;
    hadir_hari_ini: number;
    tidak_hadir_hari_ini: number;
    tingkat_kehadiran: number;
    jurnal_pending: number;
    jurnal_approved: number;
  };
  attendance_chart: {
    tanggal: string;
    hadir: number;
    tidak_hadir: number;
    izin: number;
    sakit: number;
  }[];
  jurnal_status: {
    name: string;
    value: number;
    color: string;
  }[];
  siswa_per_tempat: {
    tempat_pkl: string;
    jumlah_siswa: number;
    tingkat_kehadiran: number;
  }[];
  monthly_trends: {
    bulan: string;
    kehadiran: number;
    jurnal_approved: number;
  }[];
}

// Mock data untuk development
const mockReportData: ReportData = {
  overview: {
    total_siswa: 45,
    hadir_hari_ini: 38,
    tidak_hadir_hari_ini: 7,
    tingkat_kehadiran: 84.4,
    jurnal_pending: 12,
    jurnal_approved: 156
  },
  attendance_chart: [
    { tanggal: '2024-01-08', hadir: 42, tidak_hadir: 2, izin: 1, sakit: 0 },
    { tanggal: '2024-01-09', hadir: 40, tidak_hadir: 3, izin: 1, sakit: 1 },
    { tanggal: '2024-01-10', hadir: 43, tidak_hadir: 1, izin: 1, sakit: 0 },
    { tanggal: '2024-01-11', hadir: 39, tidak_hadir: 4, izin: 2, sakit: 0 },
    { tanggal: '2024-01-12', hadir: 41, tidak_hadir: 2, izin: 1, sakit: 1 },
    { tanggal: '2024-01-15', hadir: 38, tidak_hadir: 5, izin: 2, sakit: 0 },
    { tanggal: '2024-01-16', hadir: 44, tidak_hadir: 1, izin: 0, sakit: 0 }
  ],
  jurnal_status: [
    { name: 'Approved', value: 156, color: '#10B981' },
    { name: 'Pending', value: 12, color: '#F59E0B' },
    { name: 'Rejected', value: 8, color: '#EF4444' }
  ],
  siswa_per_tempat: [
    { tempat_pkl: 'PT. Teknologi Maju', jumlah_siswa: 15, tingkat_kehadiran: 88.5 },
    { tempat_pkl: 'CV. Digital Kreatif', jumlah_siswa: 12, tingkat_kehadiran: 82.1 },
    { tempat_pkl: 'PT. Inovasi Sistem', jumlah_siswa: 10, tingkat_kehadiran: 90.2 },
    { tempat_pkl: 'CV. Media Interaktif', jumlah_siswa: 8, tingkat_kehadiran: 75.8 }
  ],
  monthly_trends: [
    { bulan: 'Sep 2023', kehadiran: 82.5, jurnal_approved: 145 },
    { bulan: 'Okt 2023', kehadiran: 85.2, jurnal_approved: 162 },
    { bulan: 'Nov 2023', kehadiran: 83.8, jurnal_approved: 158 },
    { bulan: 'Des 2023', kehadiran: 87.1, jurnal_approved: 171 },
    { bulan: 'Jan 2024', kehadiran: 84.4, jurnal_approved: 156 }
  ]
};

export default function GuruReportsPage() {
  const [reportData, setReportData] = useState<ReportData>(mockReportData);
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('7days');
  const [selectedKelas, setSelectedKelas] = useState('all');
  const { token } = useAuthStore();

  useEffect(() => {
    // Uncomment when API is ready
    // fetchReportData();
  }, [selectedPeriod, selectedKelas]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/guru/reports?period=${selectedPeriod}&kelas=${selectedKelas}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setReportData(data || mockReportData);
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast.error('Gagal memuat data laporan');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    const reportContent = [
      'LAPORAN KEHADIRAN DAN JURNAL PKL',
      `Periode: ${selectedPeriod}`,
      `Tanggal Export: ${new Date().toLocaleDateString('id-ID')}`,
      '',
      'RINGKASAN:',
      `Total Siswa: ${reportData.overview.total_siswa}`,
      `Tingkat Kehadiran: ${reportData.overview.tingkat_kehadiran}%`,
      `Hadir Hari Ini: ${reportData.overview.hadir_hari_ini}`,
      `Tidak Hadir Hari Ini: ${reportData.overview.tidak_hadir_hari_ini}`,
      `Jurnal Pending: ${reportData.overview.jurnal_pending}`,
      `Jurnal Approved: ${reportData.overview.jurnal_approved}`,
      '',
      'DISTRIBUSI SISWA PER TEMPAT PKL:',
      ...reportData.siswa_per_tempat.map(item => 
        `${item.tempat_pkl}: ${item.jumlah_siswa} siswa (${item.tingkat_kehadiran}% kehadiran)`
      )
    ].join('\n');
    
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan-pkl-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    toast.success('Laporan berhasil diekspor');
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data laporan...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Laporan PKL</h1>
            <p className="text-gray-600 mt-1">Analisis kehadiran dan aktivitas siswa PKL</p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button 
              onClick={exportReport}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Laporan
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Periode</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7days">7 Hari Terakhir</option>
                <option value="30days">30 Hari Terakhir</option>
                <option value="3months">3 Bulan Terakhir</option>
                <option value="6months">6 Bulan Terakhir</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kelas</label>
              <select
                value={selectedKelas}
                onChange={(e) => setSelectedKelas(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Semua Kelas</option>
                <option value="XII RPL 1">XII RPL 1</option>
                <option value="XII RPL 2">XII RPL 2</option>
                <option value="XII TKJ 1">XII TKJ 1</option>
                <option value="XII TKJ 2">XII TKJ 2</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedPeriod('7days');
                  setSelectedKelas('all');
                }}
                className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Reset Filter
              </button>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Total Siswa</p>
                <p className="text-lg font-semibold text-gray-900">{reportData.overview.total_siswa}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Hadir Hari Ini</p>
                <p className="text-lg font-semibold text-gray-900">{reportData.overview.hadir_hari_ini}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Tidak Hadir</p>
                <p className="text-lg font-semibold text-gray-900">{reportData.overview.tidak_hadir_hari_ini}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Kehadiran</p>
                <p className="text-lg font-semibold text-gray-900">{reportData.overview.tingkat_kehadiran}%</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Jurnal Pending</p>
                <p className="text-lg font-semibold text-gray-900">{reportData.overview.jurnal_pending}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Jurnal Approved</p>
                <p className="text-lg font-semibold text-gray-900">{reportData.overview.jurnal_approved}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Attendance Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Tren Kehadiran Harian</h3>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData.attendance_chart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="tanggal" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' })}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString('id-ID')}
                />
                <Legend />
                <Bar dataKey="hadir" stackId="a" fill="#10B981" name="Hadir" />
                <Bar dataKey="tidak_hadir" stackId="a" fill="#EF4444" name="Tidak Hadir" />
                <Bar dataKey="izin" stackId="a" fill="#F59E0B" name="Izin" />
                <Bar dataKey="sakit" stackId="a" fill="#3B82F6" name="Sakit" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Jurnal Status Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Status Jurnal</h3>
              <PieChart className="w-5 h-5 text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={reportData.jurnal_status}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {reportData.jurnal_status.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Siswa per Tempat PKL */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Distribusi Siswa per Tempat PKL</h3>
            <Building className="w-5 h-5 text-gray-400" />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tempat PKL</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah Siswa</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tingkat Kehadiran</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.siswa_per_tempat.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building className="w-4 h-4 text-gray-400 mr-2" />
                        <div className="text-sm font-medium text-gray-900">{item.tempat_pkl}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 text-gray-400 mr-2" />
                        <div className="text-sm text-gray-900">{item.jumlah_siswa} siswa</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${item.tingkat_kehadiran}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900">{item.tingkat_kehadiran}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.tingkat_kehadiran >= 85 
                          ? 'bg-green-100 text-green-800' 
                          : item.tingkat_kehadiran >= 70 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.tingkat_kehadiran >= 85 ? 'Baik' : item.tingkat_kehadiran >= 70 ? 'Cukup' : 'Perlu Perhatian'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Monthly Trends */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Tren Bulanan</h3>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={reportData.monthly_trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="bulan" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="kehadiran" 
                stroke="#3B82F6" 
                strokeWidth={2}
                name="Tingkat Kehadiran (%)"
              />
              <Line 
                type="monotone" 
                dataKey="jurnal_approved" 
                stroke="#10B981" 
                strokeWidth={2}
                name="Jurnal Approved"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardLayout>
  );
}
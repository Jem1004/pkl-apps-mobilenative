import { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  Download,
  Filter,
  FileText,
  PieChart,
  Activity,
  Building,
  Clock,
  CheckCircle
} from 'lucide-react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { useAuthStore } from '@/stores/authStore';

interface ReportData {
  absensi: {
    total_hari: number;
    hadir: number;
    tidak_hadir: number;
    izin: number;
    sakit: number;
    tingkat_kehadiran: number;
  };
  jurnal: {
    total_jurnal: number;
    approved: number;
    pending: number;
    rejected: number;
    rata_rata_per_siswa: number;
  };
  siswa: {
    total_siswa: number;
    aktif: number;
    tidak_aktif: number;
    per_kelas: { kelas: string; jumlah: number }[];
  };
  tempat_pkl: {
    total_tempat: number;
    aktif: number;
    kuota_total: number;
    terisi: number;
    per_bidang: { bidang: string; jumlah: number }[];
  };
  trend_bulanan: {
    bulan: string;
    absensi: number;
    jurnal: number;
  }[];
}

// Mock data untuk development
const mockReportData: ReportData = {
  absensi: {
    total_hari: 20,
    hadir: 85,
    tidak_hadir: 5,
    izin: 8,
    sakit: 2,
    tingkat_kehadiran: 85
  },
  jurnal: {
    total_jurnal: 120,
    approved: 95,
    pending: 15,
    rejected: 10,
    rata_rata_per_siswa: 6
  },
  siswa: {
    total_siswa: 20,
    aktif: 18,
    tidak_aktif: 2,
    per_kelas: [
      { kelas: 'XII RPL 1', jumlah: 12 },
      { kelas: 'XII RPL 2', jumlah: 8 }
    ]
  },
  tempat_pkl: {
    total_tempat: 8,
    aktif: 6,
    kuota_total: 45,
    terisi: 20,
    per_bidang: [
      { bidang: 'Software Development', jumlah: 3 },
      { bidang: 'Web Development', jumlah: 2 },
      { bidang: 'Mobile Development', jumlah: 2 },
      { bidang: 'System Administration', jumlah: 1 }
    ]
  },
  trend_bulanan: [
    { bulan: 'Sep 2023', absensi: 78, jurnal: 45 },
    { bulan: 'Okt 2023', absensi: 82, jurnal: 52 },
    { bulan: 'Nov 2023', absensi: 85, jurnal: 58 },
    { bulan: 'Des 2023', absensi: 88, jurnal: 65 },
    { bulan: 'Jan 2024', absensi: 85, jurnal: 62 }
  ]
};

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData>(mockReportData);
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('bulan_ini');
  const [selectedKelas, setSelectedKelas] = useState('all');
  const { token } = useAuthStore();

  useEffect(() => {
    // Uncomment when API is ready
    // fetchReportData();
  }, [selectedPeriod, selectedKelas]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/reports?period=${selectedPeriod}&kelas=${selectedKelas}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setReportData(data.report || mockReportData);
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = (format: 'pdf' | 'excel') => {
    // Implement export functionality
    console.log(`Exporting report as ${format}`);
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
            <h1 className="text-2xl font-bold text-gray-900">Laporan &amp; Analitik</h1>
            <p className="text-gray-600 mt-1">Dashboard analitik komprehensif untuk monitoring PKL</p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button 
              onClick={() => exportReport('excel')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Excel
            </button>
            <button 
              onClick={() => exportReport('pdf')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              <FileText className="w-4 h-4 mr-2" />
              Export PDF
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
                <option value="hari_ini">Hari Ini</option>
                <option value="minggu_ini">Minggu Ini</option>
                <option value="bulan_ini">Bulan Ini</option>
                <option value="semester_ini">Semester Ini</option>
                <option value="tahun_ini">Tahun Ini</option>
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
                {reportData.siswa.per_kelas.map(item => (
                  <option key={item.kelas} value={item.kelas}>{item.kelas}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedPeriod('bulan_ini');
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Siswa</p>
                <p className="text-2xl font-semibold text-gray-900">{reportData.siswa.total_siswa}</p>
                <p className="text-xs text-green-600">+2 dari bulan lalu</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tingkat Kehadiran</p>
                <p className="text-2xl font-semibold text-gray-900">{reportData.absensi.tingkat_kehadiran}%</p>
                <p className="text-xs text-green-600">+3% dari bulan lalu</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Jurnal</p>
                <p className="text-2xl font-semibold text-gray-900">{reportData.jurnal.total_jurnal}</p>
                <p className="text-xs text-green-600">+15 dari bulan lalu</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Building className="w-5 h-5 text-orange-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tempat PKL Aktif</p>
                <p className="text-2xl font-semibold text-gray-900">{reportData.tempat_pkl.aktif}</p>
                <p className="text-xs text-gray-500">dari {reportData.tempat_pkl.total_tempat} total</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Absensi Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Statistik Absensi</h3>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Hadir</span>
                </div>
                <span className="text-sm font-semibold">{reportData.absensi.hadir}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${(reportData.absensi.hadir / 100) * 100}%` }}
                ></div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Tidak Hadir</span>
                </div>
                <span className="text-sm font-semibold">{reportData.absensi.tidak_hadir}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full" 
                  style={{ width: `${(reportData.absensi.tidak_hadir / 100) * 100}%` }}
                ></div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Izin</span>
                </div>
                <span className="text-sm font-semibold">{reportData.absensi.izin}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full" 
                  style={{ width: `${(reportData.absensi.izin / 100) * 100}%` }}
                ></div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Sakit</span>
                </div>
                <span className="text-sm font-semibold">{reportData.absensi.sakit}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${(reportData.absensi.sakit / 100) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Jurnal Status Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Status Jurnal</h3>
              <PieChart className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Disetujui</span>
                </div>
                <span className="text-sm font-semibold">{reportData.jurnal.approved}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${(reportData.jurnal.approved / reportData.jurnal.total_jurnal) * 100}%` }}
                ></div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Menunggu</span>
                </div>
                <span className="text-sm font-semibold">{reportData.jurnal.pending}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full" 
                  style={{ width: `${(reportData.jurnal.pending / reportData.jurnal.total_jurnal) * 100}%` }}
                ></div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Ditolak</span>
                </div>
                <span className="text-sm font-semibold">{reportData.jurnal.rejected}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full" 
                  style={{ width: `${(reportData.jurnal.rejected / reportData.jurnal.total_jurnal) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Rata-rata jurnal per siswa: <span className="font-semibold">{reportData.jurnal.rata_rata_per_siswa}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Siswa per Kelas */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Distribusi Siswa per Kelas</h3>
              <Users className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {reportData.siswa.per_kelas.map((item, index) => (
                <div key={item.kelas}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">{item.kelas}</span>
                    <span className="text-sm font-semibold">{item.jumlah} siswa</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        index === 0 ? 'bg-blue-500' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${(item.jumlah / reportData.siswa.total_siswa) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tempat PKL per Bidang */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Tempat PKL per Bidang</h3>
              <Building className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {reportData.tempat_pkl.per_bidang.map((item, index) => (
                <div key={item.bidang}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">{item.bidang}</span>
                    <span className="text-sm font-semibold">{item.jumlah} tempat</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        ['bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500'][index % 4]
                      }`}
                      style={{ width: `${(item.jumlah / reportData.tempat_pkl.total_tempat) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Kuota terisi: <span className="font-semibold">{reportData.tempat_pkl.terisi}/{reportData.tempat_pkl.kuota_total}</span>
                <span className="ml-2 text-xs text-gray-500">
                  ({((reportData.tempat_pkl.terisi / reportData.tempat_pkl.kuota_total) * 100).toFixed(1)}%)
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Trend Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Trend Bulanan</h3>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-sm font-medium text-gray-600">Bulan</th>
                  <th className="text-center py-2 text-sm font-medium text-gray-600">Absensi (%)</th>
                  <th className="text-center py-2 text-sm font-medium text-gray-600">Jurnal</th>
                  <th className="text-center py-2 text-sm font-medium text-gray-600">Trend</th>
                </tr>
              </thead>
              <tbody>
                {reportData.trend_bulanan.map((item, index) => {
                  const prevItem = reportData.trend_bulanan[index - 1];
                  const absensiTrend = prevItem ? item.absensi - prevItem.absensi : 0;
                  const jurnalTrend = prevItem ? item.jurnal - prevItem.jurnal : 0;
                  
                  return (
                    <tr key={item.bulan} className="border-b border-gray-100">
                      <td className="py-3 text-sm text-gray-900">{item.bulan}</td>
                      <td className="py-3 text-center">
                        <span className="text-sm font-semibold">{item.absensi}%</span>
                      </td>
                      <td className="py-3 text-center">
                        <span className="text-sm font-semibold">{item.jurnal}</span>
                      </td>
                      <td className="py-3 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          {absensiTrend > 0 && (
                            <span className="text-xs text-green-600 flex items-center">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              +{absensiTrend}%
                            </span>
                          )}
                          {absensiTrend < 0 && (
                            <span className="text-xs text-red-600 flex items-center">
                              <TrendingUp className="w-3 h-3 mr-1 rotate-180" />
                              {absensiTrend}%
                            </span>
                          )}
                          {jurnalTrend > 0 && (
                            <span className="text-xs text-blue-600 flex items-center">
                              <Activity className="w-3 h-3 mr-1" />
                              +{jurnalTrend}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Performa Keseluruhan</p>
                <p className="text-2xl font-bold">Baik</p>
                <p className="text-blue-100 text-sm mt-1">Tingkat kehadiran di atas target 80%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Produktivitas Jurnal</p>
                <p className="text-2xl font-bold">Tinggi</p>
                <p className="text-green-100 text-sm mt-1">Rata-rata 6 jurnal per siswa</p>
              </div>
              <FileText className="w-8 h-8 text-green-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Kapasitas PKL</p>
                <p className="text-2xl font-bold">{((reportData.tempat_pkl.terisi / reportData.tempat_pkl.kuota_total) * 100).toFixed(0)}%</p>
                <p className="text-purple-100 text-sm mt-1">Masih tersedia {reportData.tempat_pkl.kuota_total - reportData.tempat_pkl.terisi} slot</p>
              </div>
              <Building className="w-8 h-8 text-purple-200" />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
import { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Users,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  MapPin,
  FileText
} from 'lucide-react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { useAuthStore } from '@/stores/authStore';

interface AbsensiRecord {
  _id: string;
  siswa: {
    _id: string;
    nama: string;
    kelas: string;
    tempat_pkl: string;
  };
  tanggal: string;
  jam_masuk?: string;
  jam_keluar?: string;
  status: 'hadir' | 'tidak_hadir' | 'izin' | 'sakit';
  lokasi?: {
    latitude: number;
    longitude: number;
    alamat: string;
  };
  keterangan?: string;
  foto_masuk?: string;
  foto_keluar?: string;
  createdAt: string;
}

// Mock data untuk development
const mockAbsensi: AbsensiRecord[] = [
  {
    _id: '1',
    siswa: {
      _id: 's1',
      nama: 'Siti Nurhaliza',
      kelas: 'XII RPL 1',
      tempat_pkl: 'PT. Teknologi Maju'
    },
    tanggal: '2024-01-15',
    jam_masuk: '08:00',
    jam_keluar: '17:00',
    status: 'hadir',
    lokasi: {
      latitude: -6.2088,
      longitude: 106.8456,
      alamat: 'Jl. Sudirman No. 123, Jakarta Pusat'
    },
    createdAt: '2024-01-15T08:00:00Z'
  },
  {
    _id: '2',
    siswa: {
      _id: 's2',
      nama: 'Ahmad Wijaya',
      kelas: 'XII RPL 2',
      tempat_pkl: 'CV. Digital Solutions'
    },
    tanggal: '2024-01-15',
    jam_masuk: '08:15',
    status: 'hadir',
    lokasi: {
      latitude: -6.2297,
      longitude: 106.8175,
      alamat: 'Jl. Gatot Subroto No. 456, Jakarta Selatan'
    },
    keterangan: 'Terlambat 15 menit karena macet',
    createdAt: '2024-01-15T08:15:00Z'
  },
  {
    _id: '3',
    siswa: {
      _id: 's3',
      nama: 'Budi Santoso',
      kelas: 'XII RPL 1',
      tempat_pkl: 'PT. Inovasi Kreatif'
    },
    tanggal: '2024-01-15',
    status: 'sakit',
    keterangan: 'Demam tinggi, ada surat dokter',
    createdAt: '2024-01-15T07:30:00Z'
  },
  {
    _id: '4',
    siswa: {
      _id: 's4',
      nama: 'Rina Sari',
      kelas: 'XII RPL 2',
      tempat_pkl: 'PT. Sistem Informasi Global'
    },
    tanggal: '2024-01-14',
    jam_masuk: '07:45',
    jam_keluar: '16:45',
    status: 'hadir',
    lokasi: {
      latitude: -6.2297,
      longitude: 106.8331,
      alamat: 'Jl. Rasuna Said No. 321, Jakarta Selatan'
    },
    createdAt: '2024-01-14T07:45:00Z'
  }
];

export default function AbsensiPage() {
  const [absensi, setAbsensi] = useState<AbsensiRecord[]>(mockAbsensi);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [kelasFilter, setKelasFilter] = useState<string>('all');
  const [tanggalFilter, setTanggalFilter] = useState<string>('');
  const { token } = useAuthStore();

  useEffect(() => {
    // Uncomment when API is ready
    // fetchAbsensi();
  }, []);

  const fetchAbsensi = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/absensi', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAbsensi(data.absensi || []);
      }
    } catch (error) {
      console.error('Error fetching absensi:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAbsensi = absensi.filter(record => {
    const matchesSearch = record.siswa.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.siswa.kelas.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.siswa.tempat_pkl.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    const matchesKelas = kelasFilter === 'all' || record.siswa.kelas === kelasFilter;
    const matchesTanggal = !tanggalFilter || record.tanggal === tanggalFilter;
    
    return matchesSearch && matchesStatus && matchesKelas && matchesTanggal;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'hadir':
        return {
          color: 'bg-green-100 text-green-800',
          icon: CheckCircle,
          text: 'Hadir'
        };
      case 'tidak_hadir':
        return {
          color: 'bg-red-100 text-red-800',
          icon: XCircle,
          text: 'Tidak Hadir'
        };
      case 'izin':
        return {
          color: 'bg-yellow-100 text-yellow-800',
          icon: AlertCircle,
          text: 'Izin'
        };
      case 'sakit':
        return {
          color: 'bg-blue-100 text-blue-800',
          icon: AlertCircle,
          text: 'Sakit'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: AlertCircle,
          text: 'Unknown'
        };
    }
  };

  const uniqueKelas = [...new Set(absensi.map(record => record.siswa.kelas))];
  const todayDate = new Date().toISOString().split('T')[0];
  const todayAbsensi = absensi.filter(record => record.tanggal === todayDate);
  const hadirToday = todayAbsensi.filter(record => record.status === 'hadir').length;
  const totalSiswa = new Set(absensi.map(record => record.siswa._id)).size;
  const absensiRate = totalSiswa > 0 ? ((hadirToday / totalSiswa) * 100).toFixed(1) : '0';

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data absensi...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Manajemen Absensi</h1>
            <p className="text-gray-600 mt-1">Pantau kehadiran siswa PKL secara real-time</p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Download className="w-4 h-4 mr-2" />
              Export Laporan
            </button>
            <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              <FileText className="w-4 h-4 mr-2" />
              Rekap Bulanan
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Hadir Hari Ini</p>
                <p className="text-2xl font-semibold text-gray-900">{hadirToday}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Siswa</p>
                <p className="text-2xl font-semibold text-gray-900">{totalSiswa}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tingkat Kehadiran</p>
                <p className="text-2xl font-semibold text-gray-900">{absensiRate}%</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Record</p>
                <p className="text-2xl font-semibold text-gray-900">{absensi.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Cari siswa, kelas, atau tempat PKL..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Semua Status</option>
              <option value="hadir">Hadir</option>
              <option value="tidak_hadir">Tidak Hadir</option>
              <option value="izin">Izin</option>
              <option value="sakit">Sakit</option>
            </select>

            {/* Kelas Filter */}
            <select
              value={kelasFilter}
              onChange={(e) => setKelasFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Semua Kelas</option>
              {uniqueKelas.map(kelas => (
                <option key={kelas} value={kelas}>{kelas}</option>
              ))}
            </select>

            {/* Date Filter */}
            <input
              type="date"
              value={tanggalFilter}
              onChange={(e) => setTanggalFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            {/* Reset Filters */}
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setKelasFilter('all');
                setTanggalFilter('');
              }}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Reset Filter
            </button>
          </div>
        </div>

        {/* Absensi Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Siswa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jam Masuk/Keluar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lokasi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Keterangan
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAbsensi.map((record) => {
                  const statusBadge = getStatusBadge(record.status);
                  const StatusIcon = statusBadge.icon;
                  
                  return (
                    <tr key={record._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{record.siswa.nama}</div>
                          <div className="text-sm text-gray-500">{record.siswa.kelas}</div>
                          <div className="text-xs text-gray-400">{record.siswa.tempat_pkl}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(record.tanggal).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          {record.jam_masuk && (
                            <div className="flex items-center">
                              <Clock className="w-3 h-3 mr-1 text-green-500" />
                              <span>Masuk: {record.jam_masuk}</span>
                            </div>
                          )}
                          {record.jam_keluar && (
                            <div className="flex items-center mt-1">
                              <Clock className="w-3 h-3 mr-1 text-red-500" />
                              <span>Keluar: {record.jam_keluar}</span>
                            </div>
                          )}
                          {!record.jam_masuk && !record.jam_keluar && (
                            <span className="text-gray-400">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${statusBadge.color}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusBadge.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.lokasi ? (
                          <div className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            <span className="truncate max-w-32" title={record.lokasi.alamat}>
                              {record.lokasi.alamat}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="truncate max-w-32" title={record.keterangan || ''}>
                          {record.keterangan || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredAbsensi.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada data absensi</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== 'all' || kelasFilter !== 'all' || tanggalFilter
                  ? 'Tidak ada data absensi yang sesuai dengan filter.'
                  : 'Belum ada data absensi yang tercatat.'}
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredAbsensi.length > 0 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow-sm">
            <div className="flex-1 flex justify-between sm:hidden">
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Previous
              </button>
              <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Menampilkan <span className="font-medium">1</span> sampai{' '}
                  <span className="font-medium">{filteredAbsensi.length}</span> dari{' '}
                  <span className="font-medium">{filteredAbsensi.length}</span> hasil
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    Previous
                  </button>
                  <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                    1
                  </button>
                  <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
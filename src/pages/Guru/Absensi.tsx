import { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Building,
  Phone,
  Camera,
  Navigation
} from 'lucide-react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';

interface AbsensiRecord {
  id: string;
  siswa_id: string;
  siswa_nama: string;
  siswa_kelas: string;
  tempat_pkl: string;
  tanggal: string;
  jam_masuk: string;
  jam_keluar?: string;
  lokasi_masuk: string;
  lokasi_keluar?: string;
  foto_masuk?: string;
  foto_keluar?: string;
  status: 'hadir' | 'tidak_hadir' | 'izin' | 'sakit' | 'terlambat';
  keterangan?: string;
  jarak_masuk: number; // dalam meter
  jarak_keluar?: number;
  created_at: string;
  updated_at: string;
}

interface AbsensiStats {
  total_hari: number;
  hadir: number;
  tidak_hadir: number;
  izin: number;
  sakit: number;
  terlambat: number;
  tingkat_kehadiran: number;
}

// Mock data untuk development
const mockAbsensiData: AbsensiRecord[] = [
  {
    id: '1',
    siswa_id: '1',
    siswa_nama: 'Ahmad Rizki',
    siswa_kelas: 'XII RPL 1',
    tempat_pkl: 'PT. Teknologi Maju',
    tanggal: '2024-01-15',
    jam_masuk: '08:00',
    jam_keluar: '17:00',
    lokasi_masuk: 'Jl. Sudirman No. 123, Jakarta Pusat',
    lokasi_keluar: 'Jl. Sudirman No. 123, Jakarta Pusat',
    foto_masuk: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20student%20selfie%20at%20office&image_size=square',
    foto_keluar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=student%20leaving%20office%20selfie&image_size=square',
    status: 'hadir',
    jarak_masuk: 15,
    jarak_keluar: 12,
    created_at: '2024-01-15 08:00:00',
    updated_at: '2024-01-15 17:00:00'
  },
  {
    id: '2',
    siswa_id: '2',
    siswa_nama: 'Siti Nurhaliza',
    siswa_kelas: 'XII RPL 1',
    tempat_pkl: 'PT. Teknologi Maju',
    tanggal: '2024-01-15',
    jam_masuk: '08:15',
    jam_keluar: '17:00',
    lokasi_masuk: 'Jl. Sudirman No. 123, Jakarta Pusat',
    lokasi_keluar: 'Jl. Sudirman No. 123, Jakarta Pusat',
    foto_masuk: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=female%20student%20selfie%20at%20workplace&image_size=square',
    foto_keluar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=female%20student%20end%20of%20day%20selfie&image_size=square',
    status: 'terlambat',
    keterangan: 'Terlambat 15 menit karena macet',
    jarak_masuk: 8,
    jarak_keluar: 10,
    created_at: '2024-01-15 08:15:00',
    updated_at: '2024-01-15 17:00:00'
  },
  {
    id: '3',
    siswa_id: '3',
    siswa_nama: 'Dedi Kurniawan',
    siswa_kelas: 'XII RPL 2',
    tempat_pkl: 'PT. Teknologi Maju',
    tanggal: '2024-01-15',
    jam_masuk: '-',
    lokasi_masuk: '-',
    status: 'sakit',
    keterangan: 'Sakit demam, ada surat dokter',
    jarak_masuk: 0,
    created_at: '2024-01-15 00:00:00',
    updated_at: '2024-01-15 00:00:00'
  },
  {
    id: '4',
    siswa_id: '4',
    siswa_nama: 'Maya Sari',
    siswa_kelas: 'XII RPL 2',
    tempat_pkl: 'CV. Digital Kreatif',
    tanggal: '2024-01-15',
    jam_masuk: '09:00',
    jam_keluar: '18:00',
    lokasi_masuk: 'Jl. Gatot Subroto No. 456, Jakarta Selatan',
    lokasi_keluar: 'Jl. Gatot Subroto No. 456, Jakarta Selatan',
    foto_masuk: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=student%20morning%20selfie%20at%20creative%20agency&image_size=square',
    foto_keluar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=student%20evening%20selfie%20at%20office&image_size=square',
    status: 'hadir',
    jarak_masuk: 5,
    jarak_keluar: 7,
    created_at: '2024-01-15 09:00:00',
    updated_at: '2024-01-15 18:00:00'
  },
  {
    id: '5',
    siswa_id: '5',
    siswa_nama: 'Roni Pratama',
    siswa_kelas: 'XII RPL 1',
    tempat_pkl: 'CV. Digital Kreatif',
    tanggal: '2024-01-14',
    jam_masuk: '-',
    lokasi_masuk: '-',
    status: 'izin',
    keterangan: 'Izin keperluan keluarga',
    jarak_masuk: 0,
    created_at: '2024-01-14 00:00:00',
    updated_at: '2024-01-14 00:00:00'
  }
];

const mockStats: AbsensiStats = {
  total_hari: 20,
  hadir: 85,
  tidak_hadir: 5,
  izin: 8,
  sakit: 2,
  terlambat: 10,
  tingkat_kehadiran: 85
};

export default function GuruAbsensiPage() {
  const [absensiData, setAbsensiData] = useState<AbsensiRecord[]>(mockAbsensiData);
  const [stats, setStats] = useState<AbsensiStats>(mockStats);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedKelas, setSelectedKelas] = useState('all');
  const [selectedAbsensi, setSelectedAbsensi] = useState<AbsensiRecord | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const { token } = useAuthStore();

  useEffect(() => {
    // Uncomment when API is ready
    // fetchAbsensiData();
  }, [selectedDate, selectedStatus, selectedKelas]);

  const fetchAbsensiData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/guru/absensi?date=${selectedDate}&status=${selectedStatus}&kelas=${selectedKelas}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAbsensiData(data.absensi || mockAbsensiData);
        setStats(data.stats || mockStats);
      }
    } catch (error) {
      console.error('Error fetching absensi data:', error);
      toast.error('Gagal memuat data absensi');
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    const csvContent = [
      ['Tanggal', 'Nama Siswa', 'Kelas', 'Tempat PKL', 'Jam Masuk', 'Jam Keluar', 'Status', 'Keterangan'].join(','),
      ...absensiData.map(record => [
        record.tanggal,
        record.siswa_nama,
        record.siswa_kelas,
        record.tempat_pkl,
        record.jam_masuk,
        record.jam_keluar || '-',
        record.status,
        record.keterangan || '-'
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `absensi-${selectedDate}.csv`;
    a.click();
    toast.success('Data berhasil diekspor');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      hadir: { bg: 'bg-green-100', text: 'text-green-800', label: 'Hadir' },
      tidak_hadir: { bg: 'bg-red-100', text: 'text-red-800', label: 'Tidak Hadir' },
      izin: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Izin' },
      sakit: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Sakit' },
      terlambat: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Terlambat' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.tidak_hadir;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const filteredAbsensiData = absensiData.filter(record => {
    const matchesSearch = record.siswa_nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.siswa_kelas.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.tempat_pkl.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || record.status === selectedStatus;
    const matchesKelas = selectedKelas === 'all' || record.siswa_kelas === selectedKelas;
    
    return matchesSearch && matchesStatus && matchesKelas;
  });

  const kelasOptions = [...new Set(absensiData.map(record => record.siswa_kelas))];

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
            <h1 className="text-2xl font-bold text-gray-900">Absensi Siswa PKL</h1>
            <p className="text-gray-600 mt-1">Pantau kehadiran dan aktivitas siswa PKL</p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button 
              onClick={exportData}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Hadir</p>
                <p className="text-lg font-semibold text-gray-900">{stats.hadir}</p>
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
                <p className="text-lg font-semibold text-gray-900">{stats.tidak_hadir}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Izin</p>
                <p className="text-lg font-semibold text-gray-900">{stats.izin}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Sakit</p>
                <p className="text-lg font-semibold text-gray-900">{stats.sakit}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Terlambat</p>
                <p className="text-lg font-semibold text-gray-900">{stats.terlambat}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Kehadiran</p>
                <p className="text-lg font-semibold text-gray-900">{stats.tingkat_kehadiran}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cari Siswa</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Nama, kelas, tempat PKL..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Semua Status</option>
                <option value="hadir">Hadir</option>
                <option value="tidak_hadir">Tidak Hadir</option>
                <option value="izin">Izin</option>
                <option value="sakit">Sakit</option>
                <option value="terlambat">Terlambat</option>
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
                {kelasOptions.map(kelas => (
                  <option key={kelas} value={kelas}>{kelas}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedStatus('all');
                  setSelectedKelas('all');
                  setSelectedDate(new Date().toISOString().split('T')[0]);
                }}
                className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Reset Filter
              </button>
            </div>
          </div>
        </div>

        {/* Absensi Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Siswa</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tempat PKL</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jam Masuk</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jam Keluar</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAbsensiData.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{record.siswa_nama}</div>
                          <div className="text-sm text-gray-500">{record.siswa_kelas}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building className="w-4 h-4 text-gray-400 mr-2" />
                        <div className="text-sm text-gray-900">{record.tempat_pkl}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <div className="text-sm text-gray-900">{record.tanggal}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-gray-400 mr-2" />
                        <div className="text-sm text-gray-900">{record.jam_masuk}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-gray-400 mr-2" />
                        <div className="text-sm text-gray-900">{record.jam_keluar || '-'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(record.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedAbsensi(record);
                          setShowDetailModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredAbsensiData.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada data absensi</h3>
            <p className="text-gray-600">Coba ubah filter pencarian Anda</p>
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedAbsensi && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Detail Absensi</h2>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Informasi Siswa</h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Nama:</span> {selectedAbsensi.siswa_nama}</p>
                        <p><span className="font-medium">Kelas:</span> {selectedAbsensi.siswa_kelas}</p>
                        <p><span className="font-medium">Tempat PKL:</span> {selectedAbsensi.tempat_pkl}</p>
                        <p><span className="font-medium">Status:</span> {getStatusBadge(selectedAbsensi.status)}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Waktu &amp; Lokasi</h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Tanggal:</span> {selectedAbsensi.tanggal}</p>
                        <p><span className="font-medium">Jam Masuk:</span> {selectedAbsensi.jam_masuk}</p>
                        <p><span className="font-medium">Jam Keluar:</span> {selectedAbsensi.jam_keluar || 'Belum absen keluar'}</p>
                        <p><span className="font-medium">Lokasi Masuk:</span> {selectedAbsensi.lokasi_masuk}</p>
                        {selectedAbsensi.lokasi_keluar && (
                          <p><span className="font-medium">Lokasi Keluar:</span> {selectedAbsensi.lokasi_keluar}</p>
                        )}
                        <p><span className="font-medium">Jarak Masuk:</span> {selectedAbsensi.jarak_masuk}m dari lokasi PKL</p>
                        {selectedAbsensi.jarak_keluar && (
                          <p><span className="font-medium">Jarak Keluar:</span> {selectedAbsensi.jarak_keluar}m dari lokasi PKL</p>
                        )}
                      </div>
                    </div>
                    
                    {selectedAbsensi.keterangan && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Keterangan</h3>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                          {selectedAbsensi.keterangan}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Foto Absensi</h3>
                      <div className="space-y-4">
                        {selectedAbsensi.foto_masuk && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Foto Masuk</p>
                            <div className="relative">
                              <img
                                src={selectedAbsensi.foto_masuk}
                                alt="Foto Masuk"
                                className="w-full h-48 object-cover rounded-lg border border-gray-200"
                              />
                              <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                {selectedAbsensi.jam_masuk}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {selectedAbsensi.foto_keluar && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Foto Keluar</p>
                            <div className="relative">
                              <img
                                src={selectedAbsensi.foto_keluar}
                                alt="Foto Keluar"
                                className="w-full h-48 object-cover rounded-lg border border-gray-200"
                              />
                              <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                {selectedAbsensi.jam_keluar}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {!selectedAbsensi.foto_masuk && !selectedAbsensi.foto_keluar && (
                          <div className="text-center py-8 text-gray-500">
                            <Camera className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                            <p className="text-sm">Tidak ada foto absensi</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Tutup
                  </button>
                  {selectedAbsensi.lokasi_masuk !== '-' && (
                    <button
                      onClick={() => {
                        const url = `https://maps.google.com/maps?q=${encodeURIComponent(selectedAbsensi.lokasi_masuk)}`;
                        window.open(url, '_blank');
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                    >
                      <Navigation className="w-4 h-4 mr-2" />
                      Lihat Lokasi
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
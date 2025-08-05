import { useState, useEffect } from 'react';
import {
  BookOpen,
  Calendar,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Building,
  FileText
} from 'lucide-react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { useAuthStore } from '@/stores/authStore';

interface JurnalEntry {
  _id: string;
  siswa: {
    _id: string;
    nama: string;
    kelas: string;
    tempat_pkl: string;
  };
  tanggal: string;
  kegiatan: string;
  deskripsi: string;
  jam_mulai: string;
  jam_selesai: string;
  status: 'pending' | 'approved' | 'rejected';
  feedback?: string;
  approved_by?: {
    _id: string;
    nama: string;
  };
  foto_kegiatan?: string[];
  createdAt: string;
  updatedAt: string;
}

// Mock data untuk development
const mockJurnal: JurnalEntry[] = [
  {
    _id: '1',
    siswa: {
      _id: 's1',
      nama: 'Siti Nurhaliza',
      kelas: 'XII RPL 1',
      tempat_pkl: 'PT. Teknologi Maju'
    },
    tanggal: '2024-01-15',
    kegiatan: 'Pengembangan Fitur Login',
    deskripsi: 'Membuat sistem autentikasi menggunakan JWT, implementasi form login dan validasi input user. Melakukan testing untuk memastikan keamanan sistem.',
    jam_mulai: '08:00',
    jam_selesai: '12:00',
    status: 'approved',
    feedback: 'Pekerjaan bagus! Dokumentasi code sudah rapi.',
    approved_by: {
      _id: 'g1',
      nama: 'Budi Santoso'
    },
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T14:00:00Z'
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
    kegiatan: 'Desain Database',
    deskripsi: 'Merancang struktur database untuk sistem inventory, membuat ERD dan normalisasi tabel. Implementasi menggunakan MySQL.',
    jam_mulai: '08:30',
    jam_selesai: '16:30',
    status: 'pending',
    createdAt: '2024-01-15T08:30:00Z',
    updatedAt: '2024-01-15T08:30:00Z'
  },
  {
    _id: '3',
    siswa: {
      _id: 's3',
      nama: 'Budi Santoso',
      kelas: 'XII RPL 1',
      tempat_pkl: 'PT. Inovasi Kreatif'
    },
    tanggal: '2024-01-14',
    kegiatan: 'Testing Aplikasi Mobile',
    deskripsi: 'Melakukan unit testing dan integration testing pada aplikasi mobile e-commerce. Menemukan dan memperbaiki 5 bug.',
    jam_mulai: '09:00',
    jam_selesai: '17:00',
    status: 'rejected',
    feedback: 'Deskripsi kurang detail, tolong tambahkan screenshot hasil testing.',
    approved_by: {
      _id: 'g2',
      nama: 'Sari Dewi'
    },
    createdAt: '2024-01-14T09:00:00Z',
    updatedAt: '2024-01-14T16:00:00Z'
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
    kegiatan: 'Konfigurasi Server',
    deskripsi: 'Setup dan konfigurasi web server Apache, instalasi SSL certificate, dan optimasi performa server untuk handling traffic tinggi.',
    jam_mulai: '08:00',
    jam_selesai: '15:00',
    status: 'approved',
    feedback: 'Excellent work! Server performance meningkat 40%.',
    approved_by: {
      _id: 'g3',
      nama: 'Ahmad Wijaya'
    },
    createdAt: '2024-01-14T08:00:00Z',
    updatedAt: '2024-01-14T17:00:00Z'
  }
];

export default function JurnalPage() {
  const [jurnal, setJurnal] = useState<JurnalEntry[]>(mockJurnal);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [kelasFilter, setKelasFilter] = useState<string>('all');
  const [tanggalFilter, setTanggalFilter] = useState<string>('');
  const { token } = useAuthStore();

  useEffect(() => {
    // Uncomment when API is ready
    // fetchJurnal();
  }, []);

  const fetchJurnal = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/jurnal', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setJurnal(data.jurnal || []);
      }
    } catch (error) {
      console.error('Error fetching jurnal:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredJurnal = jurnal.filter(entry => {
    const matchesSearch = entry.siswa.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.kegiatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.siswa.tempat_pkl.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || entry.status === statusFilter;
    const matchesKelas = kelasFilter === 'all' || entry.siswa.kelas === kelasFilter;
    const matchesTanggal = !tanggalFilter || entry.tanggal === tanggalFilter;
    
    return matchesSearch && matchesStatus && matchesKelas && matchesTanggal;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return {
          color: 'bg-green-100 text-green-800',
          icon: CheckCircle,
          text: 'Disetujui'
        };
      case 'rejected':
        return {
          color: 'bg-red-100 text-red-800',
          icon: XCircle,
          text: 'Ditolak'
        };
      case 'pending':
        return {
          color: 'bg-yellow-100 text-yellow-800',
          icon: Clock,
          text: 'Menunggu'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: Clock,
          text: 'Unknown'
        };
    }
  };

  const handleApproveJurnal = (jurnalId: string) => {
    setJurnal(jurnal.map(entry => 
      entry._id === jurnalId 
        ? { ...entry, status: 'approved', feedback: 'Jurnal telah disetujui oleh admin.' }
        : entry
    ));
  };

  const handleRejectJurnal = (jurnalId: string) => {
    const feedback = prompt('Berikan alasan penolakan:');
    if (feedback) {
      setJurnal(jurnal.map(entry => 
        entry._id === jurnalId 
          ? { ...entry, status: 'rejected', feedback }
          : entry
      ));
    }
  };

  const handleDeleteJurnal = (jurnalId: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus jurnal ini?')) {
      setJurnal(jurnal.filter(entry => entry._id !== jurnalId));
    }
  };

  const uniqueKelas = [...new Set(jurnal.map(entry => entry.siswa.kelas))];
  const totalJurnal = jurnal.length;
  const pendingJurnal = jurnal.filter(entry => entry.status === 'pending').length;
  const approvedJurnal = jurnal.filter(entry => entry.status === 'approved').length;
  const rejectedJurnal = jurnal.filter(entry => entry.status === 'rejected').length;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data jurnal...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Manajemen Jurnal PKL</h1>
            <p className="text-gray-600 mt-1">Kelola dan review jurnal kegiatan siswa PKL</p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Download className="w-4 h-4 mr-2" />
              Export Jurnal
            </button>
            <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              <FileText className="w-4 h-4 mr-2" />
              Laporan Bulanan
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Jurnal</p>
                <p className="text-2xl font-semibold text-gray-900">{totalJurnal}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Menunggu Review</p>
                <p className="text-2xl font-semibold text-gray-900">{pendingJurnal}</p>
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
                <p className="text-sm font-medium text-gray-600">Disetujui</p>
                <p className="text-2xl font-semibold text-gray-900">{approvedJurnal}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ditolak</p>
                <p className="text-2xl font-semibold text-gray-900">{rejectedJurnal}</p>
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
                placeholder="Cari siswa, kegiatan, atau deskripsi..."
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
              <option value="pending">Menunggu</option>
              <option value="approved">Disetujui</option>
              <option value="rejected">Ditolak</option>
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

        {/* Jurnal Cards */}
        <div className="space-y-4">
          {filteredJurnal.map((entry) => {
            const statusBadge = getStatusBadge(entry.status);
            const StatusIcon = statusBadge.icon;
            
            return (
              <div key={entry._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{entry.kegiatan}</h3>
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${statusBadge.color}`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusBadge.text}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="w-4 h-4 mr-2" />
                        <span>{entry.siswa.nama} - {entry.siswa.kelas}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Building className="w-4 h-4 mr-2" />
                        <span>{entry.siswa.tempat_pkl}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{new Date(entry.tanggal).toLocaleDateString('id-ID')}</span>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>{entry.jam_mulai} - {entry.jam_selesai}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {entry.status === 'pending' && (
                      <>
                        <button 
                          onClick={() => handleApproveJurnal(entry._id)}
                          className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                          title="Setujui Jurnal"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleRejectJurnal(entry._id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          title="Tolak Jurnal"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button 
                      className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                      title="Lihat Detail"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                      title="Edit Jurnal"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteJurnal(entry._id)}
                      className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                      title="Hapus Jurnal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Deskripsi Kegiatan:</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{entry.deskripsi}</p>
                </div>

                {/* Feedback */}
                {entry.feedback && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-1">Feedback:</h4>
                    <p className="text-sm text-gray-600">{entry.feedback}</p>
                    {entry.approved_by && (
                      <p className="text-xs text-gray-500 mt-1">oleh: {entry.approved_by.nama}</p>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span className="text-xs text-gray-500">
                    Dibuat: {new Date(entry.createdAt).toLocaleDateString('id-ID')} {new Date(entry.createdAt).toLocaleTimeString('id-ID')}
                  </span>
                  {entry.updatedAt !== entry.createdAt && (
                    <span className="text-xs text-gray-500">
                      Diupdate: {new Date(entry.updatedAt).toLocaleDateString('id-ID')} {new Date(entry.updatedAt).toLocaleTimeString('id-ID')}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredJurnal.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
            <div className="text-center">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada jurnal</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== 'all' || kelasFilter !== 'all' || tanggalFilter
                  ? 'Tidak ada jurnal yang sesuai dengan filter.'
                  : 'Belum ada jurnal yang dibuat oleh siswa.'}
              </p>
            </div>
          </div>
        )}

        {/* Pagination */}
        {filteredJurnal.length > 0 && (
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
                  <span className="font-medium">{filteredJurnal.length}</span> dari{' '}
                  <span className="font-medium">{filteredJurnal.length}</span> hasil
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
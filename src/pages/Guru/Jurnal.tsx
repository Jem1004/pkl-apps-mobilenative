import { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
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
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Star,
  Activity,
  X
} from 'lucide-react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';

interface JurnalEntry {
  id: string;
  siswa_id: string;
  siswa_nama: string;
  siswa_kelas: string;
  tempat_pkl: string;
  tanggal: string;
  jam_mulai: string;
  jam_selesai: string;
  kegiatan: string;
  deskripsi: string;
  foto_kegiatan?: string;
  status: 'pending' | 'approved' | 'rejected' | 'revision';
  feedback?: string;
  rating?: number;
  created_at: string;
  updated_at: string;
}

interface JurnalStats {
  total_jurnal: number;
  pending: number;
  approved: number;
  rejected: number;
  revision: number;
  rata_rata_rating: number;
}

// Mock data untuk development
const mockJurnalData: JurnalEntry[] = [
  {
    id: '1',
    siswa_id: '1',
    siswa_nama: 'Ahmad Rizki',
    siswa_kelas: 'XII RPL 1',
    tempat_pkl: 'PT. Teknologi Maju',
    tanggal: '2024-01-15',
    jam_mulai: '08:00',
    jam_selesai: '12:00',
    kegiatan: 'Membuat Aplikasi Web',
    deskripsi: 'Hari ini saya belajar membuat aplikasi web menggunakan React.js. Saya membuat komponen untuk halaman login dan dashboard. Mentor memberikan feedback yang sangat membantu untuk perbaikan kode.',
    foto_kegiatan: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=student%20coding%20web%20application%20on%20computer&image_size=landscape_4_3',
    status: 'approved',
    feedback: 'Bagus! Terus tingkatkan kemampuan coding-mu.',
    rating: 4,
    created_at: '2024-01-15 16:00:00',
    updated_at: '2024-01-15 17:30:00'
  },
  {
    id: '2',
    siswa_id: '2',
    siswa_nama: 'Siti Nurhaliza',
    siswa_kelas: 'XII RPL 1',
    tempat_pkl: 'PT. Teknologi Maju',
    tanggal: '2024-01-15',
    jam_mulai: '08:00',
    jam_selesai: '16:00',
    kegiatan: 'Testing Aplikasi Mobile',
    deskripsi: 'Melakukan testing pada aplikasi mobile yang sedang dikembangkan. Menemukan beberapa bug dan melaporkannya kepada tim developer.',
    foto_kegiatan: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=student%20testing%20mobile%20application%20on%20smartphone&image_size=landscape_4_3',
    status: 'pending',
    created_at: '2024-01-15 16:30:00',
    updated_at: '2024-01-15 16:30:00'
  },
  {
    id: '3',
    siswa_id: '3',
    siswa_nama: 'Dedi Kurniawan',
    siswa_kelas: 'XII RPL 2',
    tempat_pkl: 'PT. Teknologi Maju',
    tanggal: '2024-01-14',
    jam_mulai: '09:00',
    jam_selesai: '15:00',
    kegiatan: 'Dokumentasi API',
    deskripsi: 'Membuat dokumentasi untuk API yang telah dikembangkan oleh tim.',
    status: 'revision',
    feedback: 'Dokumentasi perlu lebih detail, tambahkan contoh request dan response.',
    created_at: '2024-01-14 15:30:00',
    updated_at: '2024-01-14 16:45:00'
  },
  {
    id: '4',
    siswa_id: '4',
    siswa_nama: 'Maya Sari',
    siswa_kelas: 'XII RPL 2',
    tempat_pkl: 'CV. Digital Kreatif',
    tanggal: '2024-01-15',
    jam_mulai: '09:00',
    jam_selesai: '17:00',
    kegiatan: 'Desain UI/UX',
    deskripsi: 'Membuat desain interface untuk aplikasi e-commerce. Menggunakan Figma untuk membuat wireframe dan prototype.',
    foto_kegiatan: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=student%20designing%20ui%20ux%20on%20computer%20figma&image_size=landscape_4_3',
    status: 'approved',
    feedback: 'Desain sangat menarik dan user-friendly!',
    rating: 5,
    created_at: '2024-01-15 17:15:00',
    updated_at: '2024-01-15 18:00:00'
  },
  {
    id: '5',
    siswa_id: '5',
    siswa_nama: 'Roni Pratama',
    siswa_kelas: 'XII RPL 1',
    tempat_pkl: 'CV. Digital Kreatif',
    tanggal: '2024-01-13',
    jam_mulai: '08:30',
    jam_selesai: '16:30',
    kegiatan: 'Maintenance Database',
    deskripsi: 'Melakukan maintenance rutin pada database perusahaan.',
    status: 'rejected',
    feedback: 'Deskripsi terlalu singkat, jelaskan detail kegiatan yang dilakukan.',
    created_at: '2024-01-13 16:45:00',
    updated_at: '2024-01-13 17:20:00'
  }
];

const mockStats: JurnalStats = {
  total_jurnal: 45,
  pending: 8,
  approved: 32,
  rejected: 3,
  revision: 2,
  rata_rata_rating: 4.2
};

export default function GuruJurnalPage() {
  const [jurnalData, setJurnalData] = useState<JurnalEntry[]>(mockJurnalData);
  const [stats, setStats] = useState<JurnalStats>(mockStats);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedKelas, setSelectedKelas] = useState('all');
  const [selectedJurnal, setSelectedJurnal] = useState<JurnalEntry | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const { token } = useAuthStore();

  useEffect(() => {
    // Uncomment when API is ready
    // fetchJurnalData();
  }, [selectedDate, selectedStatus, selectedKelas]);

  const fetchJurnalData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/guru/jurnal?date=${selectedDate}&status=${selectedStatus}&kelas=${selectedKelas}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setJurnalData(data.jurnal || mockJurnalData);
        setStats(data.stats || mockStats);
      }
    } catch (error) {
      console.error('Error fetching jurnal data:', error);
      toast.error('Gagal memuat data jurnal');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (jurnalId: string, feedbackText: string, ratingValue: number) => {
    try {
      // Uncomment when API is ready
      // const response = await fetch(`/api/guru/jurnal/${jurnalId}/approve`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({ feedback: feedbackText, rating: ratingValue })
      // });
      
      // if (response.ok) {
        setJurnalData(prev => prev.map(jurnal => 
          jurnal.id === jurnalId 
            ? { ...jurnal, status: 'approved', feedback: feedbackText, rating: ratingValue }
            : jurnal
        ));
        toast.success('Jurnal berhasil disetujui');
      // }
    } catch (error) {
      console.error('Error approving jurnal:', error);
      toast.error('Gagal menyetujui jurnal');
    }
  };

  const handleReject = async (jurnalId: string, feedbackText: string) => {
    try {
      // Uncomment when API is ready
      // const response = await fetch(`/api/guru/jurnal/${jurnalId}/reject`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({ feedback: feedbackText })
      // });
      
      // if (response.ok) {
        setJurnalData(prev => prev.map(jurnal => 
          jurnal.id === jurnalId 
            ? { ...jurnal, status: 'rejected', feedback: feedbackText }
            : jurnal
        ));
        toast.success('Jurnal ditolak');
      // }
    } catch (error) {
      console.error('Error rejecting jurnal:', error);
      toast.error('Gagal menolak jurnal');
    }
  };

  const handleRevision = async (jurnalId: string, feedbackText: string) => {
    try {
      // Uncomment when API is ready
      // const response = await fetch(`/api/guru/jurnal/${jurnalId}/revision`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({ feedback: feedbackText })
      // });
      
      // if (response.ok) {
        setJurnalData(prev => prev.map(jurnal => 
          jurnal.id === jurnalId 
            ? { ...jurnal, status: 'revision', feedback: feedbackText }
            : jurnal
        ));
        toast.success('Jurnal perlu revisi');
      // }
    } catch (error) {
      console.error('Error requesting revision:', error);
      toast.error('Gagal meminta revisi');
    }
  };

  const exportData = () => {
    const csvContent = [
      ['Tanggal', 'Nama Siswa', 'Kelas', 'Tempat PKL', 'Kegiatan', 'Status', 'Rating', 'Feedback'].join(','),
      ...jurnalData.map(jurnal => [
        jurnal.tanggal,
        jurnal.siswa_nama,
        jurnal.siswa_kelas,
        jurnal.tempat_pkl,
        jurnal.kegiatan,
        jurnal.status,
        jurnal.rating || '-',
        jurnal.feedback || '-'
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jurnal-${selectedDate || 'all'}.csv`;
    a.click();
    toast.success('Data berhasil diekspor');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Disetujui' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Ditolak' },
      revision: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Revisi' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const filteredJurnalData = jurnalData.filter(jurnal => {
    const matchesSearch = jurnal.siswa_nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         jurnal.siswa_kelas.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         jurnal.kegiatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         jurnal.tempat_pkl.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || jurnal.status === selectedStatus;
    const matchesKelas = selectedKelas === 'all' || jurnal.siswa_kelas === selectedKelas;
    const matchesDate = !selectedDate || jurnal.tanggal === selectedDate;
    
    return matchesSearch && matchesStatus && matchesKelas && matchesDate;
  });

  const kelasOptions = [...new Set(jurnalData.map(jurnal => jurnal.siswa_kelas))];

  const submitFeedback = (action: 'approve' | 'reject' | 'revision') => {
    if (!selectedJurnal) return;
    
    if (action === 'approve') {
      handleApprove(selectedJurnal.id, feedback, rating);
    } else if (action === 'reject') {
      handleReject(selectedJurnal.id, feedback);
    } else if (action === 'revision') {
      handleRevision(selectedJurnal.id, feedback);
    }
    
    setShowFeedbackModal(false);
    setFeedback('');
    setRating(0);
    setSelectedJurnal(null);
  };

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
            <h1 className="text-2xl font-bold text-gray-900">Jurnal PKL Siswa</h1>
            <p className="text-gray-600 mt-1">Review dan berikan feedback untuk jurnal siswa</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button 
              onClick={exportData}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Total</p>
                <p className="text-lg font-semibold text-gray-900">{stats.total_jurnal}</p>
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
                <p className="text-xs font-medium text-gray-600">Pending</p>
                <p className="text-lg font-semibold text-gray-900">{stats.pending}</p>
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
                <p className="text-xs font-medium text-gray-600">Disetujui</p>
                <p className="text-lg font-semibold text-gray-900">{stats.approved}</p>
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
                <p className="text-xs font-medium text-gray-600">Ditolak</p>
                <p className="text-lg font-semibold text-gray-900">{stats.rejected}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Revisi</p>
                <p className="text-lg font-semibold text-gray-900">{stats.revision}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Star className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Rata-rata</p>
                <p className="text-lg font-semibold text-gray-900">{stats.rata_rata_rating.toFixed(1)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cari Jurnal</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Cari nama, kelas, kegiatan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Semua Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Disetujui</option>
                <option value="rejected">Ditolak</option>
                <option value="revision">Revisi</option>
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
          </div>
        </div>

        {/* Jurnal List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Siswa</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kegiatan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tempat PKL</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredJurnalData.map((jurnal) => (
                  <tr key={jurnal.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{jurnal.siswa_nama}</div>
                          <div className="text-sm text-gray-500">{jurnal.siswa_kelas}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <div className="text-sm text-gray-900">
                          {new Date(jurnal.tanggal).toLocaleDateString('id-ID')}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{jurnal.kegiatan}</div>
                      <div className="text-sm text-gray-500">
                        {jurnal.jam_mulai} - {jurnal.jam_selesai}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building className="w-4 h-4 text-gray-400 mr-2" />
                        <div className="text-sm text-gray-900">{jurnal.tempat_pkl}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(jurnal.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {jurnal.rating ? (
                        <div className="flex items-center">
                          {getRatingStars(jurnal.rating)}
                          <span className="ml-2 text-sm text-gray-600">({jurnal.rating})</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedJurnal(jurnal);
                            setShowDetailModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {jurnal.status === 'pending' && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedJurnal(jurnal);
                                setFeedback('');
                                setRating(0);
                                setShowFeedbackModal(true);
                              }}
                              className="text-green-600 hover:text-green-900"
                              title="Berikan Feedback"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredJurnalData.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada jurnal</h3>
            <p className="text-gray-600">Belum ada jurnal yang sesuai dengan filter yang dipilih</p>
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedJurnal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Detail Jurnal</h2>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Informasi Siswa</h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Nama:</span> {selectedJurnal.siswa_nama}</p>
                        <p><span className="font-medium">Kelas:</span> {selectedJurnal.siswa_kelas}</p>
                        <p><span className="font-medium">Tempat PKL:</span> {selectedJurnal.tempat_pkl}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Informasi Jurnal</h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Tanggal:</span> {new Date(selectedJurnal.tanggal).toLocaleDateString('id-ID')}</p>
                        <p><span className="font-medium">Waktu:</span> {selectedJurnal.jam_mulai} - {selectedJurnal.jam_selesai}</p>
                        <p><span className="font-medium">Status:</span> {getStatusBadge(selectedJurnal.status)}</p>
                        {selectedJurnal.rating && (
                          <p className="flex items-center">
                            <span className="font-medium mr-2">Rating:</span>
                            {getRatingStars(selectedJurnal.rating)}
                            <span className="ml-2">({selectedJurnal.rating})</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Kegiatan</h3>
                    <p className="text-lg font-medium text-gray-900 mb-2">{selectedJurnal.kegiatan}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Deskripsi</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedJurnal.deskripsi}</p>
                    </div>
                  </div>
                  
                  {selectedJurnal.foto_kegiatan && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Foto Kegiatan</h3>
                      <img 
                        src={selectedJurnal.foto_kegiatan} 
                        alt="Foto Kegiatan" 
                        className="w-full max-w-md rounded-lg shadow-sm"
                      />
                    </div>
                  )}
                  
                  {selectedJurnal.feedback && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Feedback</h3>
                      <div className={`p-4 rounded-lg ${
                        selectedJurnal.status === 'approved' ? 'bg-green-50' : 
                        selectedJurnal.status === 'rejected' ? 'bg-red-50' : 'bg-blue-50'
                      }`}>
                        <p className={`text-sm ${
                          selectedJurnal.status === 'approved' ? 'text-green-700' : 
                          selectedJurnal.status === 'rejected' ? 'text-red-700' : 'text-blue-700'
                        }`}>
                          {selectedJurnal.feedback}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Tutup
                  </button>
                  {selectedJurnal.status === 'pending' && (
                    <button
                      onClick={() => {
                        setShowDetailModal(false);
                        setFeedback('');
                        setRating(0);
                        setShowFeedbackModal(true);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Berikan Feedback
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feedback Modal */}
        {showFeedbackModal && selectedJurnal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Berikan Feedback</h2>
                  <button
                    onClick={() => setShowFeedbackModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">{selectedJurnal.kegiatan}</h3>
                    <p className="text-sm text-gray-600">oleh {selectedJurnal.siswa_nama} - {selectedJurnal.siswa_kelas}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rating (untuk approval)</label>
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <button
                          key={i}
                          onClick={() => setRating(i + 1)}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            } hover:text-yellow-400`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-sm text-gray-600">({rating}/5)</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Feedback</label>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Berikan feedback untuk jurnal ini..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={4}
                      required
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowFeedbackModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => submitFeedback('revision')}
                    disabled={!feedback.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    Minta Revisi
                  </button>
                  <button
                    onClick={() => submitFeedback('reject')}
                    disabled={!feedback.trim()}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <ThumbsDown className="w-4 h-4 mr-2" />
                    Tolak
                  </button>
                  <button
                    onClick={() => submitFeedback('approve')}
                    disabled={!feedback.trim() || rating === 0}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    Setujui
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
import { useState, useEffect } from 'react';
import {
  Building,
  MapPin,
  Phone,
  Mail,
  Users,
  Search,
  Filter,
  Eye,
  UserCheck,
  Calendar,
  Clock,
  Star,
  ExternalLink,
  Download,
  FileText
} from 'lucide-react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';

interface TempatPkl {
  id: string;
  nama: string;
  alamat: string;
  telepon: string;
  email: string;
  bidang: string;
  kuota: number;
  terisi: number;
  pembimbing: string;
  pembimbing_telepon: string;
  deskripsi: string;
  fasilitas: string[];
  jam_kerja: string;
  hari_kerja: string;
  rating: number;
  siswa_pkl: {
    id: string;
    nama: string;
    kelas: string;
    mulai_pkl: string;
    selesai_pkl: string;
    status: 'aktif' | 'selesai' | 'cuti';
  }[];
  created_at: string;
}

// Mock data untuk development
const mockTempatPkl: TempatPkl[] = [
  {
    id: '1',
    nama: 'PT. Teknologi Maju',
    alamat: 'Jl. Sudirman No. 123, Jakarta Pusat',
    telepon: '+62211234567',
    email: 'hrd@teknologimaju.com',
    bidang: 'Software Development',
    kuota: 5,
    terisi: 3,
    pembimbing: 'Budi Santoso',
    pembimbing_telepon: '+628123456789',
    deskripsi: 'Perusahaan teknologi yang bergerak di bidang pengembangan software enterprise.',
    fasilitas: ['Komputer', 'Internet', 'AC', 'Kantin', 'Parkir'],
    jam_kerja: '08:00 - 17:00',
    hari_kerja: 'Senin - Jumat',
    rating: 4.5,
    siswa_pkl: [
      {
        id: '1',
        nama: 'Ahmad Rizki',
        kelas: 'XII RPL 1',
        mulai_pkl: '2024-01-15',
        selesai_pkl: '2024-06-15',
        status: 'aktif'
      },
      {
        id: '2',
        nama: 'Siti Nurhaliza',
        kelas: 'XII RPL 1',
        mulai_pkl: '2024-01-15',
        selesai_pkl: '2024-06-15',
        status: 'aktif'
      },
      {
        id: '3',
        nama: 'Dedi Kurniawan',
        kelas: 'XII RPL 2',
        mulai_pkl: '2024-01-15',
        selesai_pkl: '2024-06-15',
        status: 'aktif'
      }
    ],
    created_at: '2023-12-01'
  },
  {
    id: '2',
    nama: 'CV. Digital Kreatif',
    alamat: 'Jl. Gatot Subroto No. 456, Jakarta Selatan',
    telepon: '+62217654321',
    email: 'info@digitalkreatif.com',
    bidang: 'Web Development',
    kuota: 3,
    terisi: 2,
    pembimbing: 'Rina Wati',
    pembimbing_telepon: '+628987654321',
    deskripsi: 'Agensi digital yang fokus pada pembuatan website dan aplikasi web.',
    fasilitas: ['Laptop', 'Internet', 'Meeting Room', 'Snack'],
    jam_kerja: '09:00 - 18:00',
    hari_kerja: 'Senin - Sabtu',
    rating: 4.2,
    siswa_pkl: [
      {
        id: '4',
        nama: 'Maya Sari',
        kelas: 'XII RPL 2',
        mulai_pkl: '2024-01-15',
        selesai_pkl: '2024-06-15',
        status: 'aktif'
      },
      {
        id: '5',
        nama: 'Roni Pratama',
        kelas: 'XII RPL 1',
        mulai_pkl: '2024-01-15',
        selesai_pkl: '2024-06-15',
        status: 'aktif'
      }
    ],
    created_at: '2023-12-01'
  },
  {
    id: '3',
    nama: 'Startup Inovasi',
    alamat: 'Jl. Kemang Raya No. 789, Jakarta Selatan',
    telepon: '+62218765432',
    email: 'career@startupinovasi.id',
    bidang: 'Mobile Development',
    kuota: 4,
    terisi: 1,
    pembimbing: 'Andi Wijaya',
    pembimbing_telepon: '+628765432109',
    deskripsi: 'Startup teknologi yang mengembangkan aplikasi mobile untuk berbagai industri.',
    fasilitas: ['MacBook', 'iPhone', 'Android', 'Internet', 'Gym'],
    jam_kerja: '10:00 - 19:00',
    hari_kerja: 'Senin - Jumat',
    rating: 4.8,
    siswa_pkl: [
      {
        id: '6',
        nama: 'Lina Marlina',
        kelas: 'XII RPL 2',
        mulai_pkl: '2024-01-15',
        selesai_pkl: '2024-06-15',
        status: 'aktif'
      }
    ],
    created_at: '2023-12-01'
  }
];

export default function GuruTempatPklPage() {
  const [tempatPkl, setTempatPkl] = useState<TempatPkl[]>(mockTempatPkl);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBidang, setSelectedBidang] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedTempat, setSelectedTempat] = useState<TempatPkl | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const { token } = useAuthStore();

  useEffect(() => {
    // Uncomment when API is ready
    // fetchTempatPkl();
  }, []);

  const fetchTempatPkl = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/guru/tempat-pkl', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTempatPkl(data.tempat_pkl || mockTempatPkl);
      }
    } catch (error) {
      console.error('Error fetching tempat PKL:', error);
      toast.error('Gagal memuat data tempat PKL');
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    const csvContent = [
      ['Nama Tempat', 'Bidang', 'Alamat', 'Pembimbing', 'Kuota', 'Terisi', 'Siswa PKL'].join(','),
      ...tempatPkl.map(tempat => [
        tempat.nama,
        tempat.bidang,
        tempat.alamat,
        tempat.pembimbing,
        tempat.kuota,
        tempat.terisi,
        tempat.siswa_pkl.map(s => s.nama).join('; ')
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tempat-pkl-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Data berhasil diekspor');
  };

  const filteredTempatPkl = tempatPkl.filter(tempat => {
    const matchesSearch = tempat.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tempat.bidang.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tempat.alamat.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBidang = selectedBidang === 'all' || tempat.bidang === selectedBidang;
    const matchesStatus = selectedStatus === 'all' || 
                         (selectedStatus === 'tersedia' && tempat.terisi < tempat.kuota) ||
                         (selectedStatus === 'penuh' && tempat.terisi >= tempat.kuota);
    
    return matchesSearch && matchesBidang && matchesStatus;
  });

  const bidangOptions = [...new Set(tempatPkl.map(tempat => tempat.bidang))];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data tempat PKL...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Tempat PKL</h1>
            <p className="text-gray-600 mt-1">Kelola dan pantau tempat PKL siswa</p>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Tempat</p>
                <p className="text-2xl font-semibold text-gray-900">{tempatPkl.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Siswa PKL</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {tempatPkl.reduce((total, tempat) => total + tempat.terisi, 0)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Kuota Tersedia</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {tempatPkl.reduce((total, tempat) => total + (tempat.kuota - tempat.terisi), 0)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Star className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rata-rata Rating</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {(tempatPkl.reduce((total, tempat) => total + tempat.rating, 0) / tempatPkl.length).toFixed(1)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cari Tempat PKL</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Nama tempat, bidang, alamat..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bidang</label>
              <select
                value={selectedBidang}
                onChange={(e) => setSelectedBidang(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Semua Bidang</option>
                {bidangOptions.map(bidang => (
                  <option key={bidang} value={bidang}>{bidang}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status Kuota</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Semua Status</option>
                <option value="tersedia">Tersedia</option>
                <option value="penuh">Penuh</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedBidang('all');
                  setSelectedStatus('all');
                }}
                className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Reset Filter
              </button>
            </div>
          </div>
        </div>

        {/* Tempat PKL Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTempatPkl.map((tempat) => (
            <div key={tempat.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{tempat.nama}</h3>
                    <p className="text-sm text-blue-600 font-medium">{tempat.bidang}</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium text-gray-600">{tempat.rating}</span>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{tempat.alamat}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>{tempat.telepon}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>Pembimbing: {tempat.pembimbing}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>{tempat.jam_kerja} ({tempat.hari_kerja})</span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Kuota PKL</span>
                    <span className="font-medium">{tempat.terisi}/{tempat.kuota}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        tempat.terisi >= tempat.kuota ? 'bg-red-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min((tempat.terisi / tempat.kuota) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                {tempat.siswa_pkl.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Siswa PKL:</p>
                    <div className="space-y-1">
                      {tempat.siswa_pkl.slice(0, 2).map((siswa) => (
                        <div key={siswa.id} className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">{siswa.nama} ({siswa.kelas})</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            siswa.status === 'aktif' ? 'bg-green-100 text-green-800' :
                            siswa.status === 'selesai' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {siswa.status}
                          </span>
                        </div>
                      ))}
                      {tempat.siswa_pkl.length > 2 && (
                        <p className="text-xs text-gray-500">+{tempat.siswa_pkl.length - 2} siswa lainnya</p>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedTempat(tempat);
                      setShowDetailModal(true);
                    }}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center justify-center"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Detail
                  </button>
                  <button
                    onClick={() => window.open(`tel:${tempat.pembimbing_telepon}`)}
                    className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 flex items-center justify-center"
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => window.open(`mailto:${tempat.email}`)}
                    className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 flex items-center justify-center"
                  >
                    <Mail className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredTempatPkl.length === 0 && (
          <div className="text-center py-12">
            <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada tempat PKL ditemukan</h3>
            <p className="text-gray-600">Coba ubah filter pencarian Anda</p>
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedTempat && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Detail Tempat PKL</h2>
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
                      <h3 className="font-semibold text-gray-900 mb-2">Informasi Umum</h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Nama:</span> {selectedTempat.nama}</p>
                        <p><span className="font-medium">Bidang:</span> {selectedTempat.bidang}</p>
                        <p><span className="font-medium">Alamat:</span> {selectedTempat.alamat}</p>
                        <p><span className="font-medium">Telepon:</span> {selectedTempat.telepon}</p>
                        <p><span className="font-medium">Email:</span> {selectedTempat.email}</p>
                        <p><span className="font-medium">Rating:</span> {selectedTempat.rating}/5</p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Pembimbing</h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Nama:</span> {selectedTempat.pembimbing}</p>
                        <p><span className="font-medium">Telepon:</span> {selectedTempat.pembimbing_telepon}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Jam Kerja</h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Jam:</span> {selectedTempat.jam_kerja}</p>
                        <p><span className="font-medium">Hari:</span> {selectedTempat.hari_kerja}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Fasilitas</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedTempat.fasilitas.map((fasilitas, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {fasilitas}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Deskripsi</h3>
                      <p className="text-sm text-gray-600">{selectedTempat.deskripsi}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Kuota PKL</h3>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span>Terisi: {selectedTempat.terisi}/{selectedTempat.kuota}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          selectedTempat.terisi >= selectedTempat.kuota ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {selectedTempat.terisi >= selectedTempat.kuota ? 'Penuh' : 'Tersedia'}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            selectedTempat.terisi >= selectedTempat.kuota ? 'bg-red-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min((selectedTempat.terisi / selectedTempat.kuota) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Siswa PKL ({selectedTempat.siswa_pkl.length})</h3>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {selectedTempat.siswa_pkl.map((siswa) => (
                          <div key={siswa.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-sm">{siswa.nama}</p>
                              <p className="text-xs text-gray-600">{siswa.kelas}</p>
                              <p className="text-xs text-gray-500">
                                {siswa.mulai_pkl} - {siswa.selesai_pkl}
                              </p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              siswa.status === 'aktif' ? 'bg-green-100 text-green-800' :
                              siswa.status === 'selesai' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {siswa.status}
                            </span>
                          </div>
                        ))}
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
                  <button
                    onClick={() => window.open(`tel:${selectedTempat.pembimbing_telepon}`)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Hubungi Pembimbing
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
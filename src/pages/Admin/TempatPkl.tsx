import { useState, useEffect } from 'react';
import {
  MapPin,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Building,
  Users,
  Phone,
  Mail,
  Download,
  Filter
} from 'lucide-react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { useAuthStore } from '@/stores/authStore';

interface TempatPkl {
  _id: string;
  nama: string;
  alamat: string;
  kontak: {
    telepon: string;
    email: string;
    pic: string; // Person in Charge
  };
  kuota: number;
  terisi: number;
  bidang: string;
  status: 'active' | 'inactive';
  deskripsi?: string;
  createdAt: string;
}

// Mock data untuk development
const mockTempatPkl: TempatPkl[] = [
  {
    _id: '1',
    nama: 'PT. Teknologi Maju Indonesia',
    alamat: 'Jl. Sudirman No. 123, Jakarta Pusat',
    kontak: {
      telepon: '021-12345678',
      email: 'hrd@teknologimaju.com',
      pic: 'Budi Santoso'
    },
    kuota: 10,
    terisi: 8,
    bidang: 'Software Development',
    status: 'active',
    deskripsi: 'Perusahaan teknologi yang bergerak di bidang pengembangan software enterprise',
    createdAt: '2024-01-15T08:00:00Z'
  },
  {
    _id: '2',
    nama: 'CV. Digital Solutions',
    alamat: 'Jl. Gatot Subroto No. 456, Jakarta Selatan',
    kontak: {
      telepon: '021-87654321',
      email: 'info@digitalsolutions.co.id',
      pic: 'Sari Dewi'
    },
    kuota: 6,
    terisi: 4,
    bidang: 'Web Development',
    status: 'active',
    deskripsi: 'Perusahaan yang fokus pada pengembangan website dan aplikasi web',
    createdAt: '2024-01-10T08:00:00Z'
  },
  {
    _id: '3',
    nama: 'PT. Inovasi Kreatif',
    alamat: 'Jl. Thamrin No. 789, Jakarta Pusat',
    kontak: {
      telepon: '021-11223344',
      email: 'recruitment@inovasikreatif.com',
      pic: 'Ahmad Wijaya'
    },
    kuota: 8,
    terisi: 8,
    bidang: 'Mobile Development',
    status: 'active',
    deskripsi: 'Perusahaan startup yang mengembangkan aplikasi mobile',
    createdAt: '2024-01-05T08:00:00Z'
  },
  {
    _id: '4',
    nama: 'PT. Sistem Informasi Global',
    alamat: 'Jl. Rasuna Said No. 321, Jakarta Selatan',
    kontak: {
      telepon: '021-99887766',
      email: 'hrd@siglobal.com',
      pic: 'Rina Sari'
    },
    kuota: 5,
    terisi: 2,
    bidang: 'System Administration',
    status: 'inactive',
    deskripsi: 'Perusahaan yang bergerak di bidang sistem informasi dan infrastruktur IT',
    createdAt: '2024-01-03T08:00:00Z'
  }
];

export default function TempatPklPage() {
  const [tempatPkl, setTempatPkl] = useState<TempatPkl[]>(mockTempatPkl);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [bidangFilter, setBidangFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { token } = useAuthStore();

  useEffect(() => {
    // Uncomment when API is ready
    // fetchTempatPkl();
  }, []);

  const fetchTempatPkl = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tempat-pkl', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTempatPkl(data.tempatPkl || []);
      }
    } catch (error) {
      console.error('Error fetching tempat PKL:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTempatPkl = tempatPkl.filter(tempat => {
    const matchesSearch = tempat.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tempat.alamat.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tempat.bidang.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBidang = bidangFilter === 'all' || tempat.bidang === bidangFilter;
    const matchesStatus = statusFilter === 'all' || tempat.status === statusFilter;
    
    return matchesSearch && matchesBidang && matchesStatus;
  });

  const getStatusBadgeColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const getKuotaColor = (terisi: number, kuota: number) => {
    const percentage = (terisi / kuota) * 100;
    if (percentage >= 100) return 'text-red-600';
    if (percentage >= 80) return 'text-yellow-600';
    return 'text-green-600';
  };

  const handleDeleteTempat = (tempatId: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus tempat PKL ini?')) {
      setTempatPkl(tempatPkl.filter(tempat => tempat._id !== tempatId));
    }
  };

  const handleToggleStatus = (tempatId: string) => {
    setTempatPkl(tempatPkl.map(tempat => 
      tempat._id === tempatId 
        ? { ...tempat, status: tempat.status === 'active' ? 'inactive' : 'active' }
        : tempat
    ));
  };

  const uniqueBidang = [...new Set(tempatPkl.map(tempat => tempat.bidang))];
  const totalKuota = tempatPkl.reduce((sum, tempat) => sum + tempat.kuota, 0);
  const totalTerisi = tempatPkl.reduce((sum, tempat) => sum + tempat.terisi, 0);
  const tempatAktif = tempatPkl.filter(tempat => tempat.status === 'active').length;

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
            <h1 className="text-2xl font-bold text-gray-900">Manajemen Tempat PKL</h1>
            <p className="text-gray-600 mt-1">Kelola tempat praktik kerja lapangan siswa</p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
            <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Tempat PKL
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
                <p className="text-sm font-medium text-gray-600">Total Tempat PKL</p>
                <p className="text-2xl font-semibold text-gray-900">{tempatPkl.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Building className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tempat Aktif</p>
                <p className="text-2xl font-semibold text-gray-900">{tempatAktif}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Kuota</p>
                <p className="text-2xl font-semibold text-gray-900">{totalKuota}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-orange-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Siswa Ditempatkan</p>
                <p className="text-2xl font-semibold text-gray-900">{totalTerisi}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Cari nama, alamat, atau bidang..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Bidang Filter */}
            <select
              value={bidangFilter}
              onChange={(e) => setBidangFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Semua Bidang</option>
              {uniqueBidang.map(bidang => (
                <option key={bidang} value={bidang}>{bidang}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Tidak Aktif</option>
            </select>

            {/* Reset Filters */}
            <button
              onClick={() => {
                setSearchTerm('');
                setBidangFilter('all');
                setStatusFilter('all');
              }}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Reset Filter
            </button>
          </div>
        </div>

        {/* Tempat PKL Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTempatPkl.map((tempat) => (
            <div key={tempat._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{tempat.nama}</h3>
                    <button
                      onClick={() => handleToggleStatus(tempat._id)}
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full cursor-pointer hover:opacity-80 ${getStatusBadgeColor(tempat.status)}`}
                    >
                      {tempat.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                    </button>
                  </div>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span className="text-sm">{tempat.alamat}</span>
                  </div>
                  <div className="flex items-center text-gray-600 mb-2">
                    <Building className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">{tempat.bidang}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button 
                    className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                    title="Lihat Detail"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button 
                    className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                    title="Edit Tempat PKL"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteTempat(tempat._id)}
                    className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                    title="Hapus Tempat PKL"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Kuota Info */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Kuota Siswa</span>
                  <span className={`text-sm font-semibold ${getKuotaColor(tempat.terisi, tempat.kuota)}`}>
                    {tempat.terisi}/{tempat.kuota}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      tempat.terisi >= tempat.kuota ? 'bg-red-500' :
                      tempat.terisi >= tempat.kuota * 0.8 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min((tempat.terisi / tempat.kuota) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-2" />
                  <span>PIC: {tempat.kontak.pic}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  <span>{tempat.kontak.telepon}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="w-4 h-4 mr-2" />
                  <span>{tempat.kontak.email}</span>
                </div>
              </div>

              {/* Description */}
              {tempat.deskripsi && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 line-clamp-2">{tempat.deskripsi}</p>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <span className="text-xs text-gray-500">
                  Dibuat: {new Date(tempat.createdAt).toLocaleDateString('id-ID')}
                </span>
                <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                  Lihat Siswa PKL
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredTempatPkl.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
            <div className="text-center">
              <Building className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada tempat PKL</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || bidangFilter !== 'all' || statusFilter !== 'all'
                  ? 'Tidak ada tempat PKL yang sesuai dengan filter.'
                  : 'Belum ada tempat PKL yang terdaftar.'}
              </p>
              <div className="mt-6">
                <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Tempat PKL Pertama
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
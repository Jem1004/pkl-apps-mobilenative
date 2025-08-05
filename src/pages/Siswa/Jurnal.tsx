import { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  Edit,
  Trash2,
  Eye,
  FileText,
  Save,
  X,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  BookOpen,
  User
} from 'lucide-react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';

interface JurnalEntry {
  id: string;
  tanggal: string;
  kegiatan: string;
  deskripsi: string;
  jam_mulai: string;
  jam_selesai: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  feedback?: string;
  created_at: string;
  updated_at: string;
}

interface JurnalStats {
  total_jurnal: number;
  draft: number;
  submitted: number;
  approved: number;
  rejected: number;
}

// Mock data untuk development
const mockJurnalData: JurnalEntry[] = [
  {
    id: '1',
    tanggal: '2024-01-15',
    kegiatan: 'Mempelajari Framework React',
    deskripsi: 'Hari ini saya mempelajari dasar-dasar React.js termasuk komponen, props, dan state. Saya juga mencoba membuat komponen sederhana untuk form input data.',
    jam_mulai: '08:00',
    jam_selesai: '12:00',
    status: 'approved',
    feedback: 'Bagus! Teruskan pembelajaran React dengan fokus pada hooks.',
    created_at: '2024-01-15 12:30:00',
    updated_at: '2024-01-15 14:00:00'
  },
  {
    id: '2',
    tanggal: '2024-01-14',
    kegiatan: 'Debugging Aplikasi Web',
    deskripsi: 'Membantu senior developer dalam mengatasi bug pada fitur login. Mempelajari teknik debugging menggunakan browser developer tools.',
    jam_mulai: '09:00',
    jam_selesai: '16:00',
    status: 'submitted',
    created_at: '2024-01-14 16:30:00',
    updated_at: '2024-01-14 16:30:00'
  },
  {
    id: '3',
    tanggal: '2024-01-13',
    kegiatan: 'Meeting Tim Development',
    deskripsi: 'Mengikuti daily standup meeting dan sprint planning. Mendapat tugas untuk mempelajari dokumentasi API yang akan digunakan dalam project.',
    jam_mulai: '08:30',
    jam_selesai: '10:00',
    status: 'rejected',
    feedback: 'Deskripsi terlalu singkat. Harap jelaskan lebih detail apa yang dipelajari dari meeting tersebut.',
    created_at: '2024-01-13 10:30:00',
    updated_at: '2024-01-13 15:00:00'
  },
  {
    id: '4',
    tanggal: '2024-01-12',
    kegiatan: 'Setup Development Environment',
    deskripsi: 'Melakukan instalasi dan konfigurasi tools development seperti VS Code, Node.js, Git, dan database PostgreSQL. Juga setup project repository.',
    jam_mulai: '08:00',
    jam_selesai: '11:00',
    status: 'draft',
    created_at: '2024-01-12 11:30:00',
    updated_at: '2024-01-12 11:30:00'
  }
];

const mockStats: JurnalStats = {
  total_jurnal: 4,
  draft: 1,
  submitted: 1,
  approved: 1,
  rejected: 1
};

export default function SiswaJurnalPage() {
  const [jurnalData, setJurnalData] = useState<JurnalEntry[]>(mockJurnalData);
  const [stats, setStats] = useState<JurnalStats>(mockStats);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedJurnal, setSelectedJurnal] = useState<JurnalEntry | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingJurnal, setEditingJurnal] = useState<JurnalEntry | null>(null);
  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    kegiatan: '',
    deskripsi: '',
    jam_mulai: '',
    jam_selesai: ''
  });
  const { user, token } = useAuthStore();

  useEffect(() => {
    // Uncomment when API is ready
    // fetchJurnalData();
  }, [selectedStatus]);

  const fetchJurnalData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/siswa/jurnal?status=${selectedStatus}`, {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.kegiatan || !formData.deskripsi || !formData.jam_mulai || !formData.jam_selesai) {
      toast.error('Semua field harus diisi');
      return;
    }
    
    if (formData.jam_mulai >= formData.jam_selesai) {
      toast.error('Jam selesai harus lebih besar dari jam mulai');
      return;
    }
    
    try {
      setLoading(true);
      
      const jurnalData = {
        ...formData,
        status: 'draft'
      };
      
      if (editingJurnal) {
        // Update existing jurnal
        // const response = await fetch(`/api/siswa/jurnal/${editingJurnal.id}`, {
        //   method: 'PUT',
        //   headers: {
        //     'Authorization': `Bearer ${token}`,
        //     'Content-Type': 'application/json'
        //   },
        //   body: JSON.stringify(jurnalData)
        // });
        
        // Mock update for demo
        const updatedJurnal = {
          ...editingJurnal,
          ...formData,
          status: 'draft' as const,
          updated_at: new Date().toISOString()
        };
        
        setJurnalData(prev => prev.map(j => j.id === editingJurnal.id ? updatedJurnal : j));
        toast.success('Jurnal berhasil diperbarui');
      } else {
        // Create new jurnal
        // const response = await fetch('/api/siswa/jurnal', {
        //   method: 'POST',
        //   headers: {
        //     'Authorization': `Bearer ${token}`,
        //     'Content-Type': 'application/json'
        //   },
        //   body: JSON.stringify(jurnalData)
        // });
        
        // Mock create for demo
        const newJurnal: JurnalEntry = {
          id: Date.now().toString(),
          ...formData,
          status: 'draft',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        setJurnalData(prev => [newJurnal, ...prev]);
        setStats(prev => ({ ...prev, total_jurnal: prev.total_jurnal + 1, draft: prev.draft + 1 }));
        toast.success('Jurnal berhasil dibuat');
      }
      
      setShowFormModal(false);
      setEditingJurnal(null);
      setFormData({
        tanggal: new Date().toISOString().split('T')[0],
        kegiatan: '',
        deskripsi: '',
        jam_mulai: '',
        jam_selesai: ''
      });
    } catch (error) {
      console.error('Error saving jurnal:', error);
      toast.error('Gagal menyimpan jurnal');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitJurnal = async (id: string) => {
    try {
      // const response = await fetch(`/api/siswa/jurnal/${id}/submit`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json'
      //   }
      // });
      
      // Mock submit for demo
      setJurnalData(prev => prev.map(j => 
        j.id === id ? { ...j, status: 'submitted' as const, updated_at: new Date().toISOString() } : j
      ));
      setStats(prev => ({ ...prev, draft: prev.draft - 1, submitted: prev.submitted + 1 }));
      toast.success('Jurnal berhasil disubmit untuk review');
    } catch (error) {
      console.error('Error submitting jurnal:', error);
      toast.error('Gagal submit jurnal');
    }
  };

  const handleDeleteJurnal = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus jurnal ini?')) {
      return;
    }
    
    try {
      // const response = await fetch(`/api/siswa/jurnal/${id}`, {
      //   method: 'DELETE',
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json'
      //   }
      // });
      
      // Mock delete for demo
      const jurnal = jurnalData.find(j => j.id === id);
      if (jurnal) {
        setJurnalData(prev => prev.filter(j => j.id !== id));
        setStats(prev => ({
          ...prev,
          total_jurnal: prev.total_jurnal - 1,
          [jurnal.status]: prev[jurnal.status] - 1
        }));
      }
      toast.success('Jurnal berhasil dihapus');
    } catch (error) {
      console.error('Error deleting jurnal:', error);
      toast.error('Gagal menghapus jurnal');
    }
  };

  const openEditModal = (jurnal: JurnalEntry) => {
    setEditingJurnal(jurnal);
    setFormData({
      tanggal: jurnal.tanggal,
      kegiatan: jurnal.kegiatan,
      deskripsi: jurnal.deskripsi,
      jam_mulai: jurnal.jam_mulai,
      jam_selesai: jurnal.jam_selesai
    });
    setShowFormModal(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Draft' },
      submitted: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Submitted' },
      approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Approved' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const filteredJurnalData = jurnalData.filter(jurnal => {
    const matchesSearch = jurnal.kegiatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         jurnal.deskripsi.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || jurnal.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

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
            <h1 className="text-2xl font-bold text-gray-900">Jurnal PKL</h1>
            <p className="text-gray-600 mt-1">Catat dan kelola aktivitas harian PKL Anda</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button 
              onClick={() => {
                setEditingJurnal(null);
                setFormData({
                  tanggal: new Date().toISOString().split('T')[0],
                  kegiatan: '',
                  deskripsi: '',
                  jam_mulai: '',
                  jam_selesai: ''
                });
                setShowFormModal(true);
              }}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tambah Jurnal
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Total Jurnal</p>
                <p className="text-lg font-semibold text-gray-900">{stats.total_jurnal}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-gray-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Draft</p>
                <p className="text-lg font-semibold text-gray-900">{stats.draft}</p>
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
                <p className="text-xs font-medium text-gray-600">Submitted</p>
                <p className="text-lg font-semibold text-gray-900">{stats.submitted}</p>
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
                <p className="text-xs font-medium text-gray-600">Approved</p>
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
                <p className="text-xs font-medium text-gray-600">Rejected</p>
                <p className="text-lg font-semibold text-gray-900">{stats.rejected}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cari Jurnal</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Cari kegiatan atau deskripsi..."
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
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedStatus('all');
                }}
                className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Reset Filter
              </button>
            </div>
          </div>
        </div>

        {/* Jurnal List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kegiatan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waktu</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredJurnalData.map((jurnal) => (
                  <tr key={jurnal.id} className="hover:bg-gray-50">
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
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {jurnal.deskripsi.length > 50 ? `${jurnal.deskripsi.substring(0, 50)}...` : jurnal.deskripsi}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-gray-400 mr-2" />
                        <div className="text-sm text-gray-900">
                          {jurnal.jam_mulai} - {jurnal.jam_selesai}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(jurnal.status)}
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
                        {(jurnal.status === 'draft' || jurnal.status === 'rejected') && (
                          <>
                            <button
                              onClick={() => openEditModal(jurnal)}
                              className="text-green-600 hover:text-green-900"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteJurnal(jurnal.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Hapus"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            {jurnal.status === 'draft' && (
                              <button
                                onClick={() => handleSubmitJurnal(jurnal.id)}
                                className="text-purple-600 hover:text-purple-900"
                                title="Submit untuk Review"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
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
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada jurnal</h3>
            <p className="text-gray-600 mb-4">Mulai buat jurnal untuk mencatat aktivitas PKL Anda</p>
            <button 
              onClick={() => {
                setEditingJurnal(null);
                setFormData({
                  tanggal: new Date().toISOString().split('T')[0],
                  kegiatan: '',
                  deskripsi: '',
                  jam_mulai: '',
                  jam_selesai: ''
                });
                setShowFormModal(true);
              }}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Buat Jurnal Pertama
            </button>
          </div>
        )}

        {/* Form Modal */}
        {showFormModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingJurnal ? 'Edit Jurnal' : 'Tambah Jurnal Baru'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowFormModal(false);
                      setEditingJurnal(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal</label>
                      <input
                        type="date"
                        value={formData.tanggal}
                        onChange={(e) => setFormData(prev => ({ ...prev, tanggal: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Kegiatan</label>
                      <input
                        type="text"
                        value={formData.kegiatan}
                        onChange={(e) => setFormData(prev => ({ ...prev, kegiatan: e.target.value }))}
                        placeholder="Masukkan nama kegiatan"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Jam Mulai</label>
                      <input
                        type="time"
                        value={formData.jam_mulai}
                        onChange={(e) => setFormData(prev => ({ ...prev, jam_mulai: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Jam Selesai</label>
                      <input
                        type="time"
                        value={formData.jam_selesai}
                        onChange={(e) => setFormData(prev => ({ ...prev, jam_selesai: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi Kegiatan</label>
                    <textarea
                      value={formData.deskripsi}
                      onChange={(e) => setFormData(prev => ({ ...prev, deskripsi: e.target.value }))}
                      placeholder="Jelaskan secara detail kegiatan yang dilakukan, apa yang dipelajari, dan hasil yang dicapai..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={6}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Jelaskan dengan detail untuk memudahkan review oleh pembimbing
                    </p>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowFormModal(false);
                        setEditingJurnal(null);
                      }}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {loading ? 'Menyimpan...' : editingJurnal ? 'Update' : 'Simpan'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedJurnal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
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
                      <h3 className="font-semibold text-gray-900 mb-3">Informasi Jurnal</h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Tanggal:</span> {new Date(selectedJurnal.tanggal).toLocaleDateString('id-ID')}</p>
                        <p><span className="font-medium">Kegiatan:</span> {selectedJurnal.kegiatan}</p>
                        <p><span className="font-medium">Waktu:</span> {selectedJurnal.jam_mulai} - {selectedJurnal.jam_selesai}</p>
                        <p><span className="font-medium">Status:</span> {getStatusBadge(selectedJurnal.status)}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Riwayat</h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Dibuat:</span> {new Date(selectedJurnal.created_at).toLocaleString('id-ID')}</p>
                        <p><span className="font-medium">Diperbarui:</span> {new Date(selectedJurnal.updated_at).toLocaleString('id-ID')}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Deskripsi Kegiatan</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedJurnal.deskripsi}</p>
                    </div>
                  </div>
                  
                  {selectedJurnal.feedback && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Feedback Pembimbing</h3>
                      <div className={`p-4 rounded-lg ${
                        selectedJurnal.status === 'approved' ? 'bg-green-50' : 'bg-red-50'
                      }`}>
                        <p className={`text-sm ${
                          selectedJurnal.status === 'approved' ? 'text-green-700' : 'text-red-700'
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
                  {(selectedJurnal.status === 'draft' || selectedJurnal.status === 'rejected') && (
                    <button
                      onClick={() => {
                        setShowDetailModal(false);
                        openEditModal(selectedJurnal);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Jurnal
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
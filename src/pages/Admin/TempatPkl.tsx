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
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Upload,
  FileSpreadsheet,
  Check,
  AlertCircle
} from 'lucide-react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { useTempatPKLStore } from '@/stores/tempatPklStore';
import { toast } from 'sonner';

import { TempatPKL, CreateTempatPKLRequest } from '@/utils/tempatPklService';
import * as XLSX from 'xlsx';

interface FormData {
  nama: string;
  alamat?: string;
  kontak?: string;
  email?: string;
  status: 'aktif' | 'nonaktif';
}

const initialFormData: FormData = {
  nama: '',
  alamat: '',
  kontak: '',
  email: '',
  status: 'aktif'
};

export default function TempatPklPage() {
  // Store state
  const {
    tempatPKLList,
    loading,
    error,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    searchQuery,
    statusFilter,
    fetchTempatPKL,
    createNewTempatPKL,
    updateExistingTempatPKL,
    deleteExistingTempatPKL,
    bulkImportNewTempatPKL,
    setSearchQuery,
    setStatusFilter,
    setCurrentPage,
    clearError
  } = useTempatPKLStore();
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit' | 'view'>('add');
  const [selectedTempat, setSelectedTempat] = useState<TempatPKL | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Partial<FormData>>({});
  const [submitting, setSubmitting] = useState(false);
  
  // Delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tempatToDelete, setTempatToDelete] = useState<TempatPKL | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  // Import data states
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importData, setImportData] = useState<any[]>([]);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [importStep, setImportStep] = useState<'upload' | 'preview' | 'result'>('upload');
  const [importResult, setImportResult] = useState<{success: number, failed: number, errors: string[]}>({success: 0, failed: 0, errors: []});

  useEffect(() => {
    fetchTempatPKL({
      page: currentPage,
      limit: itemsPerPage,
      search: searchQuery,
      status: statusFilter !== 'all' ? statusFilter : undefined
    });
  }, [currentPage, searchQuery, statusFilter, fetchTempatPKL, itemsPerPage]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const validateForm = (): boolean => {
    const errors: Partial<FormData> = {};
    
    if (!formData.nama.trim()) {
      errors.nama = 'Nama tempat PKL wajib diisi';
    }
    
    // Kontak dan alamat sekarang opsional
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Format email tidak valid';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      if (modalType === 'edit' && selectedTempat) {
        await updateExistingTempatPKL(selectedTempat._id, formData);
        toast.success('Data berhasil diperbarui');
      } else {
        await createNewTempatPKL(formData);
        toast.success('Data berhasil ditambahkan');
      }
      
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Terjadi kesalahan saat menyimpan data');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!tempatToDelete) {
      toast.error('Data tidak valid');
      return;
    }

    setDeleting(true);
    try {
      await deleteExistingTempatPKL(tempatToDelete._id);
      toast.success('Data berhasil dihapus');
      setShowDeleteModal(false);
      setTempatToDelete(null);
    } catch (error) {
      console.error('Error deleting tempat PKL:', error);
      toast.error('Terjadi kesalahan saat menghapus data');
    } finally {
      setDeleting(false);
    }
  };

  const openModal = (type: 'add' | 'edit' | 'view', tempat?: TempatPKL) => {
    setModalType(type);
    setSelectedTempat(tempat || null);
    
    if (type === 'edit' && tempat) {
      setFormData({
        nama: tempat.nama,
        alamat: tempat.alamat || '',
        kontak: tempat.kontak || '',
        email: tempat.email || '',
        status: tempat.status
      });
    } else if (type === 'add') {
      resetForm();
    }
    // Untuk type 'view', tidak perlu reset form atau set form data
    
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setFormErrors({});
    setSelectedTempat(null);
  };

  const openDeleteModal = (tempat: TempatPKL) => {
    setTempatToDelete(tempat);
    setShowDeleteModal(true);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Skip header row and convert to objects
        const headers = jsonData[0] as string[];
        const rows = jsonData.slice(1) as any[][];
        
        const processedData = rows.map((row, index) => {
          const obj: any = { _rowIndex: index + 2 }; // +2 because we skip header and arrays are 0-indexed
          headers.forEach((header, i) => {
            obj[header] = row[i] || '';
          });
          return obj;
        }).filter(row => row.nama || row.Nama); // Filter out empty rows
        
        setImportData(processedData);
        setImportPreview(processedData.slice(0, 5)); // Show first 5 rows for preview
        setImportStep('preview');
      } catch (error) {
        console.error('Error reading file:', error);
        toast.error('Error membaca file. Pastikan format file benar.');
      }
    };
    
    reader.readAsArrayBuffer(file);
  };

  const processImportData = async () => {
    setImporting(true);
    
    try {
      const processedData = importData.map(row => ({
        nama: row.nama || row.Nama || '',
        alamat: row.alamat || row.Alamat || '',
        kontak: row.kontak || row.Kontak || '',
        email: row.email || row.Email || '',
        status: (row.status || row.Status || 'aktif').toLowerCase() as 'aktif' | 'nonaktif'
      }));
      
      const response = await bulkImportNewTempatPKL(processedData);
      
      const results = {
        success: response.data?.success?.length || 0,
        failed: response.data?.errors?.length || 0,
        errors: response.data?.errors?.map((err: any) => `Baris ${err.row}: ${err.error}`) || []
      };
      
      setImportResult(results);
      setImportStep('result');
      
      if (results.success > 0) {
        toast.success(`Import berhasil! ${results.success} data berhasil ditambahkan.`);
      }
      
      if (results.failed > 0) {
        toast.error(`${results.failed} data gagal diimpor. Periksa detail error.`);
      }
    } catch (error) {
      console.error('Import error:', error);
      const results = {
        success: 0,
        failed: importData.length,
        errors: ['Network error atau server error']
      };
      setImportResult(results);
      setImportStep('result');
      toast.error('Gagal mengimpor data');
    } finally {
      setImporting(false);
    }
  };

  const resetImportModal = () => {
    setShowImportModal(false);
    setImportFile(null);
    setImportData([]);
    setImportPreview([]);
    setImportStep('upload');
    setImportResult({success: 0, failed: 0, errors: []});
  };

  const downloadTemplate = () => {
    const templateData = [
      ['nama', 'alamat', 'kontak', 'email', 'status'],
      ['PT. Contoh Perusahaan', 'Jl. Contoh No. 123, Jakarta', '021-1234567', 'info@contoh.com', 'aktif'],
      ['CV. Sample Company', 'Jl. Sample No. 456, Bandung', '022-7654321', 'contact@sample.com', 'aktif']
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template Tempat PKL');
    XLSX.writeFile(wb, 'template_tempat_pkl.xlsx');
  };

  const getStatusBadgeColor = (status: string) => {
    return status === 'aktif' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  if (loading && tempatPKLList.length === 0) {
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
            <button 
              onClick={downloadTemplate}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Template
            </button>
            <button 
              onClick={() => setShowImportModal(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import Data
            </button>
            <button 
              onClick={() => openModal('add')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tambah Tempat PKL
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Tempat PKL</p>
                <p className="text-2xl font-semibold text-gray-900">{totalItems}</p>
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
                <p className="text-sm font-medium text-gray-600">Tempat Aktif</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {tempatPKLList.filter(t => t.status === 'aktif').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tidak Aktif</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {tempatPKLList.filter(t => t.status === 'nonaktif').length}
                </p>
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
                placeholder="Cari nama atau alamat..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Semua Status</option>
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Tidak Aktif</option>
            </select>

            {/* Reset Filters */}
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setCurrentPage(1);
              }}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Reset Filter
            </button>
            
            <div className="text-sm text-gray-500 flex items-center">
              Menampilkan {tempatPKLList.length} dari {totalItems} data
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nama Tempat PKL
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Alamat
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kontak
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tempatPKLList.map((tempat) => (
                      <tr key={tempat._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Building className="w-4 h-4 text-blue-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{tempat.nama}</div>
                              {tempat.email && (
                                <div className="text-sm text-gray-500">{tempat.email}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{tempat.alamat}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{tempat.kontak}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(tempat.status)}`}>
                            {tempat.status === 'aktif' ? 'Aktif' : 'Tidak Aktif'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => openModal('view', tempat)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                              title="Lihat Detail"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => openModal('edit', tempat)}
                              className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                              title="Edit Tempat PKL"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => openDeleteModal(tempat)}
                              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                              title="Hapus Tempat PKL"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Menampilkan{' '}
                        <span className="font-medium">
                          {(currentPage - 1) * itemsPerPage + 1}
                        </span>{' '}
                        sampai{' '}
                        <span className="font-medium">
                          {Math.min(currentPage * itemsPerPage, totalItems)}
                        </span>{' '}
                        dari{' '}
                        <span className="font-medium">{totalItems}</span> hasil
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              page === currentPage
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          
          {!loading && tempatPKLList.length === 0 && (
            <div className="text-center py-12">
              <Building className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada tempat PKL</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery || statusFilter !== 'all'
                  ? 'Tidak ada tempat PKL yang sesuai dengan filter.'
                  : 'Belum ada tempat PKL yang terdaftar.'}
              </p>
              <div className="mt-6">
                <button 
                  onClick={() => openModal('add')}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Tempat PKL Pertama
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Form */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className={`relative top-20 mx-auto p-5 border shadow-lg rounded-md bg-white ${
              modalType === 'view' ? 'w-[500px] max-w-2xl' : 'w-96'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {modalType === 'add' && 'Tambah Tempat PKL'}
                  {modalType === 'edit' && 'Edit Tempat PKL'}
                  {modalType === 'view' && 'Detail Tempat PKL'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {modalType === 'view' && selectedTempat ? (
                <div className="space-y-6">
                  {/* Header Info */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Building className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <h4 className="text-xl font-semibold text-gray-900">{selectedTempat.nama}</h4>
                        <div className="flex items-center mt-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            selectedTempat.status === 'aktif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {selectedTempat.status === 'aktif' ? 'Aktif' : 'Tidak Aktif'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detail Information */}
                  <div className="grid grid-cols-1 gap-4">
                    {/* Alamat */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <MapPin className="w-5 h-5 text-gray-600 mt-0.5" />
                        </div>
                        <div className="ml-3">
                          <h5 className="text-sm font-medium text-gray-900 mb-1">Alamat</h5>
                          <p className="text-sm text-gray-700">
                            {selectedTempat.alamat || 'Alamat tidak tersedia'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Kontak */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <Phone className="w-5 h-5 text-gray-600 mt-0.5" />
                        </div>
                        <div className="ml-3">
                          <h5 className="text-sm font-medium text-gray-900 mb-1">Kontak</h5>
                          <p className="text-sm text-gray-700">
                            {selectedTempat.kontak || 'Kontak tidak tersedia'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Email */}
                    {selectedTempat.email && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <Mail className="w-5 h-5 text-gray-600 mt-0.5" />
                          </div>
                          <div className="ml-3">
                            <h5 className="text-sm font-medium text-gray-900 mb-1">Email</h5>
                            <p className="text-sm text-gray-700">{selectedTempat.email}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Informasi Tambahan */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="text-sm font-medium text-gray-900 mb-3">Informasi Tambahan</h5>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">ID:</span>
                          <span className="ml-2 font-mono text-gray-900">{selectedTempat._id}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Dibuat:</span>
                          <span className="ml-2 text-gray-900">
                            {selectedTempat.created_at ? new Date(selectedTempat.created_at).toLocaleDateString('id-ID') : 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Diperbarui:</span>
                          <span className="ml-2 text-gray-900">
                            {selectedTempat.updated_at ? new Date(selectedTempat.updated_at).toLocaleDateString('id-ID') : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Tutup
                    </button>
                    <button
                      onClick={() => {
                        openModal('edit', selectedTempat);
                      }}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700"
                    >
                      Edit Data
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nama Tempat PKL *
                      </label>
                      <input
                        type="text"
                        value={formData.nama}
                        onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          formErrors.nama ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Masukkan nama tempat PKL"
                      />
                      {formErrors.nama && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.nama}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Alamat
                      </label>
                      <textarea
                        value={formData.alamat}
                        onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                        rows={3}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          formErrors.alamat ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Masukkan alamat lengkap (opsional)"
                      />
                      {formErrors.alamat && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.alamat}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kontak
                      </label>
                      <input
                        type="text"
                        value={formData.kontak}
                        onChange={(e) => setFormData({ ...formData, kontak: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          formErrors.kontak ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Nomor telepon atau WhatsApp (opsional)"
                      />
                      {formErrors.kontak && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.kontak}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          formErrors.email ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="email@example.com (opsional)"
                      />
                      {formErrors.email && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as 'aktif' | 'nonaktif' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="aktif">Aktif</option>
                        <option value="nonaktif">Tidak Aktif</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Menyimpan...' : (modalType === 'add' ? 'Tambah' : 'Simpan')}
                    </button>
                  </div>
                </form>
              )}

            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && tempatToDelete && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Konfirmasi Hapus</h3>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">
                      Apakah Anda yakin ingin menghapus tempat PKL <strong>{tempatToDelete.nama}</strong>?
                    </p>
                    <p className="text-sm text-red-600 mt-1">
                      Tindakan ini tidak dapat dibatalkan.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? 'Menghapus...' : 'Hapus'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Import Data Modal */}
        {showImportModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {importStep === 'upload' && 'Import Data Tempat PKL'}
                  {importStep === 'preview' && 'Preview Data Import'}
                  {importStep === 'result' && 'Hasil Import Data'}
                </h3>
                <button
                  onClick={resetImportModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Upload Step */}
              {importStep === 'upload' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400" />
                    <h4 className="mt-2 text-lg font-medium text-gray-900">Upload File Excel/CSV</h4>
                    <p className="mt-1 text-sm text-gray-500">
                      Pilih file Excel (.xlsx) atau CSV yang berisi data tempat PKL
                    </p>
                  </div>

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <div className="text-center">
                      <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Pilih File
                      </label>
                      <p className="mt-2 text-xs text-gray-500">
                        Format yang didukung: .xlsx, .xls, .csv (Maksimal 10MB)
                      </p>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h5 className="text-sm font-medium text-blue-900 mb-2">Format File:</h5>
                    <div className="text-sm text-blue-800">
                      <p>File harus memiliki kolom berikut:</p>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li><strong>nama</strong> - Nama tempat PKL (wajib)</li>
                        <li><strong>alamat</strong> - Alamat tempat PKL (opsional)</li>
                        <li><strong>kontak</strong> - Nomor kontak (opsional)</li>
                        <li><strong>email</strong> - Email tempat PKL (opsional)</li>
                        <li><strong>status</strong> - Status: aktif/nonaktif (default: aktif)</li>
                      </ul>
                      <p className="mt-2">
                        <button
                          onClick={downloadTemplate}
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          Download template file
                        </button>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Preview Step */}
              {importStep === 'preview' && (
                <div className="space-y-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <Check className="w-5 h-5 text-green-600 mr-2" />
                      <span className="text-sm font-medium text-green-900">
                        File berhasil dibaca! Ditemukan {importData.length} baris data.
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Preview Data (5 baris pertama):</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Alamat</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Kontak</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {importPreview.map((row, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-2 text-sm text-gray-900">{row.nama || row.Nama || '-'}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">{row.alamat || row.Alamat || '-'}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">{row.kontak || row.Kontak || '-'}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">{row.email || row.Email || '-'}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  (row.status || row.Status || 'aktif').toLowerCase() === 'aktif' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {(row.status || row.Status || 'aktif').toLowerCase() === 'aktif' ? 'Aktif' : 'Tidak Aktif'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setImportStep('upload')}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Kembali
                    </button>
                    <button
                      onClick={processImportData}
                      disabled={importing}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {importing ? 'Mengimpor...' : `Import ${importData.length} Data`}
                    </button>
                  </div>
                </div>
              )}

              {/* Result Step */}
              {importStep === 'result' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <Check className="w-5 h-5 text-green-600 mr-2" />
                        <span className="text-sm font-medium text-green-900">
                          Berhasil: {importResult.success} data
                        </span>
                      </div>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                        <span className="text-sm font-medium text-red-900">
                          Gagal: {importResult.failed} data
                        </span>
                      </div>
                    </div>
                  </div>

                  {importResult.errors.length > 0 && (
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Detail Error:</h4>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                        <ul className="text-sm text-red-800 space-y-1">
                          {importResult.errors.map((error, index) => (
                            <li key={index}>• {error}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={resetImportModal}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700"
                    >
                      Selesai
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
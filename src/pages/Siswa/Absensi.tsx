import { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Camera,
  CheckCircle,
  XCircle,
  AlertCircle,
  Navigation,
  User,
  Building,
  FileText,
  Eye,
  Loader
} from 'lucide-react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';

interface AbsensiRecord {
  id: string;
  tanggal: string;
  jam_masuk?: string;
  jam_keluar?: string;
  lokasi_masuk?: string;
  lokasi_keluar?: string;
  foto_masuk?: string;
  foto_keluar?: string;
  status: 'hadir' | 'tidak_hadir' | 'izin' | 'sakit' | 'terlambat';
  keterangan?: string;
  jarak_masuk?: number;
  jarak_keluar?: number;
  tempat_pkl: string;
  created_at: string;
  updated_at: string;
}

interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
}

interface TempatPKL {
  id: string;
  nama: string;
  alamat: string;
  latitude: number;
  longitude: number;
  radius_absensi: number; // dalam meter
}

// Mock data untuk development
const mockTempatPKL: TempatPKL = {
  id: '1',
  nama: 'PT. Teknologi Maju',
  alamat: 'Jl. Sudirman No. 123, Jakarta Pusat',
  latitude: -6.2088,
  longitude: 106.8456,
  radius_absensi: 100
};

const mockAbsensiHistory: AbsensiRecord[] = [
  {
    id: '1',
    tanggal: '2024-01-15',
    jam_masuk: '08:00',
    jam_keluar: '17:00',
    lokasi_masuk: 'Jl. Sudirman No. 123, Jakarta Pusat',
    lokasi_keluar: 'Jl. Sudirman No. 123, Jakarta Pusat',
    foto_masuk: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=student%20selfie%20at%20office%20entrance&image_size=square',
    foto_keluar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=student%20leaving%20office%20selfie&image_size=square',
    status: 'hadir',
    jarak_masuk: 15,
    jarak_keluar: 12,
    tempat_pkl: 'PT. Teknologi Maju',
    created_at: '2024-01-15 08:00:00',
    updated_at: '2024-01-15 17:00:00'
  },
  {
    id: '2',
    tanggal: '2024-01-14',
    jam_masuk: '08:15',
    jam_keluar: '17:00',
    lokasi_masuk: 'Jl. Sudirman No. 123, Jakarta Pusat',
    lokasi_keluar: 'Jl. Sudirman No. 123, Jakarta Pusat',
    foto_masuk: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=student%20morning%20selfie%20at%20workplace&image_size=square',
    foto_keluar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=student%20end%20of%20day%20selfie&image_size=square',
    status: 'terlambat',
    keterangan: 'Terlambat 15 menit karena macet',
    jarak_masuk: 8,
    jarak_keluar: 10,
    tempat_pkl: 'PT. Teknologi Maju',
    created_at: '2024-01-14 08:15:00',
    updated_at: '2024-01-14 17:00:00'
  },
  {
    id: '3',
    tanggal: '2024-01-13',
    status: 'sakit',
    keterangan: 'Sakit demam, ada surat dokter',
    tempat_pkl: 'PT. Teknologi Maju',
    created_at: '2024-01-13 00:00:00',
    updated_at: '2024-01-13 00:00:00'
  }
];

export default function SiswaAbsensiPage() {
  const [absensiHistory, setAbsensiHistory] = useState<AbsensiRecord[]>(mockAbsensiHistory);
  const [tempatPKL, setTempatPKL] = useState<TempatPKL>(mockTempatPKL);
  const [todayAbsensi, setTodayAbsensi] = useState<AbsensiRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [selectedAbsensi, setSelectedAbsensi] = useState<AbsensiRecord | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [keterangan, setKeterangan] = useState('');
  const [showKeteranganModal, setShowKeteranganModal] = useState(false);
  const [absensiType, setAbsensiType] = useState<'masuk' | 'keluar'>('masuk');
  const { user, token } = useAuthStore();

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    // Uncomment when API is ready
    // fetchAbsensiData();
    // fetchTempatPKL();
    
    // Check today's attendance
    const todayRecord = absensiHistory.find(record => record.tanggal === today);
    setTodayAbsensi(todayRecord || null);
  }, [today]);

  const fetchAbsensiData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/siswa/absensi', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAbsensiHistory(data.history || mockAbsensiHistory);
        setTodayAbsensi(data.today || null);
      }
    } catch (error) {
      console.error('Error fetching absensi data:', error);
      toast.error('Gagal memuat data absensi');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = (): Promise<LocationData> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation tidak didukung oleh browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            // Get address from coordinates (using reverse geocoding)
            const response = await fetch(
              `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=YOUR_API_KEY`
            );
            
            let address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
            if (response.ok) {
              const data = await response.json();
              if (data.results && data.results[0]) {
                address = data.results[0].formatted;
              }
            }
            
            resolve({ latitude, longitude, address });
          } catch (error) {
            // Fallback to coordinates if geocoding fails
            resolve({ 
              latitude, 
              longitude, 
              address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` 
            });
          }
        },
        (error) => {
          reject(new Error('Gagal mendapatkan lokasi: ' + error.message));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  };

  const handleAbsensi = async (type: 'masuk' | 'keluar') => {
    try {
      setLocationLoading(true);
      
      // Get current location
      const location = await getCurrentLocation();
      setCurrentLocation(location);
      
      // Calculate distance from PKL location
      const distance = calculateDistance(
        location.latitude,
        location.longitude,
        tempatPKL.latitude,
        tempatPKL.longitude
      );
      
      // Check if within allowed radius
      if (distance > tempatPKL.radius_absensi) {
        toast.error(`Anda berada ${Math.round(distance)}m dari lokasi PKL. Maksimal jarak ${tempatPKL.radius_absensi}m`);
        return;
      }
      
      // For demo purposes, we'll simulate taking a photo
      const photoUrl = `https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=student%20${type}%20selfie%20at%20workplace&image_size=square`;
      
      const absensiData = {
        type,
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
        distance: Math.round(distance),
        photo: photoUrl,
        keterangan: keterangan || undefined
      };
      
      // Uncomment when API is ready
      // const response = await fetch('/api/siswa/absensi', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify(absensiData)
      // });
      
      // if (response.ok) {
      //   const result = await response.json();
      //   toast.success(`Absensi ${type} berhasil!`);
      //   fetchAbsensiData();
      // }
      
      // Mock success for demo
      const now = new Date();
      const timeString = now.toTimeString().slice(0, 5);
      
      if (type === 'masuk') {
        const newAbsensi: AbsensiRecord = {
          id: Date.now().toString(),
          tanggal: today,
          jam_masuk: timeString,
          lokasi_masuk: location.address,
          foto_masuk: photoUrl,
          status: now.getHours() > 8 ? 'terlambat' : 'hadir',
          jarak_masuk: Math.round(distance),
          tempat_pkl: tempatPKL.nama,
          keterangan: keterangan || undefined,
          created_at: now.toISOString(),
          updated_at: now.toISOString()
        };
        setTodayAbsensi(newAbsensi);
        setAbsensiHistory(prev => [newAbsensi, ...prev.filter(a => a.tanggal !== today)]);
      } else {
        if (todayAbsensi) {
          const updatedAbsensi = {
            ...todayAbsensi,
            jam_keluar: timeString,
            lokasi_keluar: location.address,
            foto_keluar: photoUrl,
            jarak_keluar: Math.round(distance),
            updated_at: now.toISOString()
          };
          setTodayAbsensi(updatedAbsensi);
          setAbsensiHistory(prev => [updatedAbsensi, ...prev.filter(a => a.tanggal !== today)]);
        }
      }
      
      toast.success(`Absensi ${type} berhasil!`);
      setKeterangan('');
      setShowKeteranganModal(false);
      
    } catch (error) {
      console.error('Error during absensi:', error);
      toast.error(error instanceof Error ? error.message : 'Gagal melakukan absensi');
    } finally {
      setLocationLoading(false);
    }
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

  const canAbsenMasuk = !todayAbsensi || !todayAbsensi.jam_masuk;
  const canAbsenKeluar = todayAbsensi && todayAbsensi.jam_masuk && !todayAbsensi.jam_keluar;

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
            <h1 className="text-2xl font-bold text-gray-900">Absensi PKL</h1>
            <p className="text-gray-600 mt-1">Kelola kehadiran PKL Anda</p>
          </div>
        </div>

        {/* Today's Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Status Hari Ini</h2>
            <div className="text-sm text-gray-500">
              {new Date().toLocaleDateString('id-ID', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* PKL Location Info */}
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Tempat PKL</h3>
                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Building className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">{tempatPKL.nama}</p>
                    <p className="text-sm text-gray-600">{tempatPKL.alamat}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Radius absensi: {tempatPKL.radius_absensi}m
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Attendance Status */}
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Status Kehadiran</h3>
                {todayAbsensi ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium">Masuk:</span>
                      </div>
                      <span className="text-sm text-gray-900">
                        {todayAbsensi.jam_masuk || '-'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium">Keluar:</span>
                      </div>
                      <span className="text-sm text-gray-900">
                        {todayAbsensi.jam_keluar || '-'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">Status:</span>
                      {getStatusBadge(todayAbsensi.status)}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-yellow-800">Belum melakukan absensi hari ini</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                setAbsensiType('masuk');
                setShowKeteranganModal(true);
              }}
              disabled={!canAbsenMasuk || locationLoading}
              className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-colors ${
                canAbsenMasuk && !locationLoading
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {locationLoading && absensiType === 'masuk' ? (
                <Loader className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-5 h-5 mr-2" />
              )}
              Absen Masuk
            </button>
            
            <button
              onClick={() => {
                setAbsensiType('keluar');
                setShowKeteranganModal(true);
              }}
              disabled={!canAbsenKeluar || locationLoading}
              className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-colors ${
                canAbsenKeluar && !locationLoading
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {locationLoading && absensiType === 'keluar' ? (
                <Loader className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <XCircle className="w-5 h-5 mr-2" />
              )}
              Absen Keluar
            </button>
          </div>
        </div>

        {/* Attendance History */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Riwayat Absensi</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jam Masuk</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jam Keluar</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {absensiHistory.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <div className="text-sm text-gray-900">
                          {new Date(record.tanggal).toLocaleDateString('id-ID')}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-gray-400 mr-2" />
                        <div className="text-sm text-gray-900">{record.jam_masuk || '-'}</div>
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

        {absensiHistory.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada riwayat absensi</h3>
            <p className="text-gray-600">Mulai lakukan absensi untuk melihat riwayat</p>
          </div>
        )}

        {/* Keterangan Modal */}
        {showKeteranganModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Absen {absensiType === 'masuk' ? 'Masuk' : 'Keluar'}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Keterangan (Opsional)
                    </label>
                    <textarea
                      value={keterangan}
                      onChange={(e) => setKeterangan(e.target.value)}
                      placeholder="Tambahkan keterangan jika diperlukan..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                    />
                  </div>
                  
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div className="text-sm text-yellow-800">
                        <p className="font-medium">Perhatian:</p>
                        <p>Pastikan Anda berada dalam radius {tempatPKL.radius_absensi}m dari lokasi PKL</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex space-x-3">
                  <button
                    onClick={() => {
                      setShowKeteranganModal(false);
                      setKeterangan('');
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => handleAbsensi(absensiType)}
                    disabled={locationLoading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {locationLoading ? (
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4 mr-2" />
                    )}
                    {locationLoading ? 'Memproses...' : 'Lanjutkan'}
                  </button>
                </div>
              </div>
            </div>
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
                      <h3 className="font-semibold text-gray-900 mb-3">Informasi Absensi</h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Tanggal:</span> {new Date(selectedAbsensi.tanggal).toLocaleDateString('id-ID')}</p>
                        <p><span className="font-medium">Tempat PKL:</span> {selectedAbsensi.tempat_pkl}</p>
                        <p><span className="font-medium">Status:</span> {getStatusBadge(selectedAbsensi.status)}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Waktu &amp; Lokasi</h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Jam Masuk:</span> {selectedAbsensi.jam_masuk || '-'}</p>
                        <p><span className="font-medium">Jam Keluar:</span> {selectedAbsensi.jam_keluar || 'Belum absen keluar'}</p>
                        {selectedAbsensi.lokasi_masuk && (
                          <p><span className="font-medium">Lokasi Masuk:</span> {selectedAbsensi.lokasi_masuk}</p>
                        )}
                        {selectedAbsensi.lokasi_keluar && (
                          <p><span className="font-medium">Lokasi Keluar:</span> {selectedAbsensi.lokasi_keluar}</p>
                        )}
                        {selectedAbsensi.jarak_masuk !== undefined && (
                          <p><span className="font-medium">Jarak Masuk:</span> {selectedAbsensi.jarak_masuk}m dari lokasi PKL</p>
                        )}
                        {selectedAbsensi.jarak_keluar !== undefined && (
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
                  {selectedAbsensi.lokasi_masuk && selectedAbsensi.lokasi_masuk !== '-' && (
                    <button
                      onClick={() => {
                        const url = `https://maps.google.com/maps?q=${encodeURIComponent(selectedAbsensi.lokasi_masuk!)}`;
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
# Setup Guide - Sistem Absensi PKL

Panduan untuk menjalankan project Sistem Absensi PKL di local development.

## Prerequisites

- Node.js (v18 atau lebih baru)
- Docker dan Docker Compose
- Git

## Quick Start

### 1. Clone dan Install Dependencies

```bash
# Clone repository
git clone <repository-url>
cd pkl-apps-mobilenative

# Install dependencies
npm install
```

### 2. Setup Database dan Seed Data

```bash
# Jalankan MongoDB di Docker
npm run db:up

# Tunggu beberapa detik untuk MongoDB siap, lalu jalankan seed
npm run seed

# Atau jalankan setup lengkap sekaligus
npm run setup
```

### 3. Jalankan Development Server

```bash
# Jalankan frontend dan backend bersamaan
npm run dev

# Atau jalankan terpisah:
# Frontend saja
npm run client:dev

# Backend saja
npm run server:dev
```

## Akses Aplikasi

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **MongoDB**: localhost:27017
- **Mongo Express** (optional): http://localhost:8082

## Login Credentials

Setelah menjalankan seed data, gunakan kredensial berikut:

### Admin
- Username: `admin`
- Password: `admin123`

### Guru
- Username: `budi_guru`
- Password: `guru123`

### Siswa
- Username: `andi_siswa`
- Password: `siswa123`

## Available Scripts

| Script | Deskripsi |
|--------|----------|
| `npm run dev` | Jalankan frontend dan backend bersamaan |
| `npm run client:dev` | Jalankan frontend saja |
| `npm run server:dev` | Jalankan backend saja |
| `npm run build` | Build untuk production |
| `npm run check` | Type checking |
| `npm run lint` | Linting |
| `npm run seed` | Jalankan seed data |
| `npm run db:up` | Start MongoDB container |
| `npm run db:down` | Stop semua containers |
| `npm run db:logs` | Lihat logs MongoDB |
| `npm run setup` | Setup lengkap (database + seed) |

## Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb://admin:admin123@localhost:27017/abasensi_pkl?authSource=admin
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRE=7d
PORT=5001
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

### Frontend (.env.local)
```env
VITE_API_URL=/api
```

## Database Structure

### Users Collection
- **Admin**: Mengelola sistem secara keseluruhan
- **Guru**: Mengawasi siswa PKL dan mengelola tempat PKL
- **Siswa**: Melakukan absensi dan mengisi jurnal PKL

## Troubleshooting

### MongoDB Connection Error
```bash
# Pastikan Docker berjalan
docker --version

# Restart MongoDB container
npm run db:down
npm run db:up

# Cek logs
npm run db:logs
```

### Port Already in Use
```bash
# Cek port yang digunakan
netstat -ano | findstr :3000
netstat -ano | findstr :5001
netstat -ano | findstr :27017

# Kill process jika perlu
taskkill /PID <PID> /F
```

### Seed Data Error
```bash
# Pastikan MongoDB berjalan terlebih dahulu
npm run db:up

# Tunggu beberapa detik, lalu jalankan seed
npm run seed
```

## Development Notes

- Frontend menggunakan Vite dengan proxy ke backend
- Backend menggunakan Express dengan TypeScript
- Database menggunakan MongoDB dengan Mongoose
- Authentication menggunakan JWT
- UI menggunakan React + Tailwind CSS

## Production Deployment

Untuk deployment production, pastikan:
1. Update environment variables
2. Gunakan database MongoDB yang aman
3. Setup HTTPS
4. Update CORS settings
5. Setup proper logging dan monitoring

---

**Happy Coding! 🚀**
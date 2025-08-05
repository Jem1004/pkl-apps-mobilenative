/**
 * Seed script untuk membuat data user awal
 * Membuat admin, guru, dan siswa untuk testing
 */
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Seed data
const seedUsers = [
  // Admin
  {
    nama: 'Administrator',
    username: 'admin',
    email: 'admin@sekolah.com',
    password: 'admin123',
    role: 'admin',
    status: 'aktif'
  },
  
  // Guru
  {
    nama: 'Budi Santoso',
    username: 'budi_guru',
    email: 'budi.santoso@sekolah.com',
    password: 'guru123',
    role: 'guru',
    nip: '198501012010011001',
    status: 'aktif'
  },
  {
    nama: 'Siti Nurhaliza',
    username: 'siti_guru',
    email: 'siti.nurhaliza@sekolah.com',
    password: 'guru123',
    role: 'guru',
    nip: '198703152012012002',
    status: 'aktif'
  },
  {
    nama: 'Ahmad Wijaya',
    username: 'ahmad_guru',
    email: 'ahmad.wijaya@sekolah.com',
    password: 'guru123',
    role: 'guru',
    nip: '198209082008011003',
    status: 'aktif'
  },
  
  // Siswa
  {
    nama: 'Andi Pratama',
    username: 'andi_siswa',
    email: 'andi.pratama@sekolah.com',
    password: 'siswa123',
    role: 'siswa',
    nis: '2021001',
    kelas: 'XII RPL 1',
    status: 'aktif'
  },
  {
    nama: 'Dewi Sartika',
    username: 'dewi_siswa',
    email: 'dewi.sartika@sekolah.com',
    password: 'siswa123',
    role: 'siswa',
    nis: '2021002',
    kelas: 'XII RPL 1',
    status: 'aktif'
  },
  {
    nama: 'Rizki Ramadhan',
    username: 'rizki_siswa',
    email: 'rizki.ramadhan@sekolah.com',
    password: 'siswa123',
    role: 'siswa',
    nis: '2021003',
    kelas: 'XII RPL 2',
    status: 'aktif'
  },
  {
    nama: 'Maya Sari',
    username: 'maya_siswa',
    email: 'maya.sari@sekolah.com',
    password: 'siswa123',
    role: 'siswa',
    nis: '2021004',
    kelas: 'XII RPL 2',
    status: 'aktif'
  },
  {
    nama: 'Fajar Nugroho',
    username: 'fajar_siswa',
    email: 'fajar.nugroho@sekolah.com',
    password: 'siswa123',
    role: 'siswa',
    nis: '2021005',
    kelas: 'XII TKJ 1',
    status: 'aktif'
  }
];

async function connectDB() {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://admin:admin123@localhost:27017/abasensi_pkl?authSource=admin';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Clear existing users (optional - comment out if you want to keep existing data)
    await User.deleteMany({});
    console.log('🗑️  Cleared existing users');
    
    // Insert seed users one by one to trigger password hashing middleware
    const createdUsers = [];
    for (const userData of seedUsers) {
      const user = new User(userData);
      const savedUser = await user.save();
      createdUsers.push(savedUser);
    }
    console.log(`✅ Created ${createdUsers.length} users`);
    
    // Display created users
    console.log('\n📋 Created Users:');
    createdUsers.forEach(user => {
      console.log(`- ${user.role.toUpperCase()}: ${user.nama} (${user.username})`);
      if (user.role === 'guru' && user.nip) {
        console.log(`  NIP: ${user.nip}`);
      }
      if (user.role === 'siswa' && user.nis) {
        console.log(`  NIS: ${user.nis}, Kelas: ${user.kelas}`);
      }
    });
    
    console.log('\n🔐 Login Credentials:');
    console.log('Admin: admin / admin123');
    console.log('Guru: budi_guru / guru123 (atau guru lainnya)');
    console.log('Siswa: andi_siswa / siswa123 (atau siswa lainnya)');
    
    console.log('\n✅ Database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

async function main() {
  try {
    await connectDB();
    await seedDatabase();
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

// Run the seeder
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

// Also run if this file is executed directly
if (process.argv[1] && process.argv[1].endsWith('seedUsers.ts')) {
  main().catch(console.error);
}

export { seedUsers, seedDatabase };
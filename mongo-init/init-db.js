// Initialize database and create collections
db = db.getSiblingDB('abasensi_pkl');

// Create collections
db.createCollection('users');
db.createCollection('locations');
db.createCollection('attendances');
db.createCollection('journals');
db.createCollection('settings');

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.attendances.createIndex({ userId: 1 });
db.attendances.createIndex({ tanggal: 1 });
db.journals.createIndex({ userId: 1 });
db.journals.createIndex({ tanggal: 1 });
db.locations.createIndex({ nama: 1 });

// Insert default admin user
db.users.insertOne({
  nama: 'Administrator',
  email: 'admin@abasensi.com',
  password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: password
  role: 'admin',
  createdAt: new Date(),
  updatedAt: new Date()
});

// Insert default attendance settings
db.settings.insertOne({
  type: 'attendance_time',
  jam_masuk: '08:00',
  jam_pulang: '17:00',
  createdAt: new Date(),
  updatedAt: new Date()
});

print('Database initialized successfully!');
/**
 * Script untuk menjalankan seed data
 * Menggunakan Node.js untuk menjalankan seeder TypeScript
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedFile = path.join(__dirname, '../api/seeds/seedUsers.ts');

console.log('🌱 Running database seeder...');
console.log('📁 Seed file:', seedFile);

// Run the TypeScript file using tsx
const seedProcess = spawn('npx', ['tsx', seedFile], {
  stdio: 'inherit',
  shell: true,
  cwd: path.join(__dirname, '..')
});

seedProcess.on('close', (code) => {
  if (code === 0) {
    console.log('\n✅ Seeding completed successfully!');
  } else {
    console.log(`\n❌ Seeding failed with exit code ${code}`);
    process.exit(code);
  }
});

seedProcess.on('error', (error) => {
  console.error('❌ Error running seeder:', error);
  process.exit(1);
});
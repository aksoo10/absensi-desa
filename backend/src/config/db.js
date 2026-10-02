const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

let pool;

async function initDB() {
  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const port = process.env.DB_PORT || 3306;
  const database = process.env.DB_NAME || 'absensi_db';

  // 1. Connect without database to ensure database exists
  const rootConn = await mysql.createConnection({ host, user, password, port });
  await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
  await rootConn.end();

  // 2. Create pool connected to the database
  pool = mysql.createPool({
    host,
    user,
    password,
    port,
    database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    dateStrings: true
  });

  console.log(`Connected to MySQL database: ${database}`);

  // 3. Create tables
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      email VARCHAR(150) NOT NULL UNIQUE,
      username VARCHAR(100) UNIQUE,
      password VARCHAR(255) NOT NULL,
      role ENUM('admin', 'pegawai') NOT NULL DEFAULT 'pegawai',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS pegawai (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL UNIQUE,
      nip VARCHAR(50) NOT NULL UNIQUE,
      nik VARCHAR(50) NOT NULL UNIQUE,
      nama VARCHAR(150) NOT NULL,
      jabatan VARCHAR(100) NOT NULL,
      status_pegawai ENUM('Tetap', 'Kontrak', 'Magang', 'Honorer') NOT NULL DEFAULT 'Tetap',
      no_hp VARCHAR(25),
      alamat TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_pegawai_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS schedules (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nama_jadwal VARCHAR(100) NOT NULL,
      hari_kerja VARCHAR(100) NOT NULL DEFAULT 'Senin - Jumat',
      jam_masuk TIME NOT NULL DEFAULT '08:00:00',
      jam_pulang TIME NOT NULL DEFAULT '17:00:00',
      toleransi_menit INT NOT NULL DEFAULT 15,
      is_default BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS attendances (
      id INT AUTO_INCREMENT PRIMARY KEY,
      pegawai_id INT NOT NULL,
      tanggal DATE NOT NULL,
      jam_masuk TIME NOT NULL,
      jam_pulang TIME DEFAULT NULL,
      status ENUM('Tepat waktu', 'Terlambat') NOT NULL,
      durasi_kerja_menit INT DEFAULT 0,
      keterangan TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_attendance_pegawai FOREIGN KEY (pegawai_id) REFERENCES pegawai(id) ON DELETE CASCADE,
      UNIQUE KEY uq_pegawai_tanggal (pegawai_id, tanggal)
    ) ENGINE=InnoDB;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS leave_requests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      pegawai_id INT NOT NULL,
      jenis ENUM('Izin', 'Sakit', 'Dinas Luar') NOT NULL,
      tanggal_mulai DATE NOT NULL,
      tanggal_selesai DATE NOT NULL,
      keterangan TEXT NOT NULL,
      dokumen_bukti VARCHAR(255) DEFAULT NULL,
      status ENUM('Pending', 'Disetujui', 'Ditolak') NOT NULL DEFAULT 'Pending',
      catatan_admin TEXT,
      diproses_pada TIMESTAMP NULL DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_leave_pegawai FOREIGN KEY (pegawai_id) REFERENCES pegawai(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `);

  // 4. Seed initial data if empty
  await seedInitialData();

  return pool;
}

async function seedInitialData() {
  const [users] = await pool.query('SELECT COUNT(*) as count FROM users');
  if (users[0].count === 0) {
    console.log('Seeding initial system data...');
    const hashedPass = await bcrypt.hash('password123', 10);

    // 1. Admin
    const [adminUser] = await pool.query(
      'INSERT INTO users (name, email, username, password, role) VALUES (?, ?, ?, ?, ?)',
      ['Administrator HRD', 'admin@perusahaan.com', 'admin', hashedPass, 'admin']
    );

    // 2. Pegawai 1
    const [pegawaiUser1] = await pool.query(
      'INSERT INTO users (name, email, username, password, role) VALUES (?, ?, ?, ?, ?)',
      ['Budi Pratama, S.Kom', 'budi@perusahaan.com', 'budi', hashedPass, 'pegawai']
    );
    const [p1] = await pool.query(
      'INSERT INTO pegawai (user_id, nip, nik, nama, jabatan, status_pegawai, no_hp, alamat) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [pegawaiUser1.insertId, '198503152010011002', '3201123456780001', 'Budi Pratama, S.Kom', 'Senior Software Engineer', 'Tetap', '081234567890', 'Jl. Merdeka No. 12, Jakarta']
    );

    // 3. Pegawai 2
    const [pegawaiUser2] = await pool.query(
      'INSERT INTO users (name, email, username, password, role) VALUES (?, ?, ?, ?, ?)',
      ['Siti Rahmawati, S.E.', 'siti@perusahaan.com', 'siti', hashedPass, 'pegawai']
    );
    const [p2] = await pool.query(
      'INSERT INTO pegawai (user_id, nip, nik, nama, jabatan, status_pegawai, no_hp, alamat) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [pegawaiUser2.insertId, '199008222015032004', '3201987654320002', 'Siti Rahmawati, S.E.', 'Staff Keuangan & HR', 'Tetap', '081398765432', 'Jl. Sudirman No. 45, Jakarta']
    );

    // 4. Pegawai 3
    const [pegawaiUser3] = await pool.query(
      'INSERT INTO users (name, email, username, password, role) VALUES (?, ?, ?, ?, ?)',
      ['Andi Saputra', 'andi@perusahaan.com', 'andi', hashedPass, 'pegawai']
    );
    const [p3] = await pool.query(
      'INSERT INTO pegawai (user_id, nip, nik, nama, jabatan, status_pegawai, no_hp, alamat) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [pegawaiUser3.insertId, '199512102020121003', '3201456789100003', 'Andi Saputra', 'UI/UX Designer', 'Kontrak', '085712349876', 'Jl. Gatot Subroto No. 88, Jakarta']
    );

    // 5. Default Schedules
    await pool.query(
      'INSERT INTO schedules (nama_jadwal, hari_kerja, jam_masuk, jam_pulang, toleransi_menit, is_default) VALUES (?, ?, ?, ?, ?, ?)',
      ['Jadwal Reguler Pagi', 'Senin - Jumat', '08:00:00', '17:00:00', 15, 1]
    );
    await pool.query(
      'INSERT INTO schedules (nama_jadwal, hari_kerja, jam_masuk, jam_pulang, toleransi_menit, is_default) VALUES (?, ?, ?, ?, ?, ?)',
      ['Shift Siang Fleksibel', 'Senin - Sabtu', '09:00:00', '18:00:00', 10, 0]
    );

    // 6. Sample past attendances for the last few days to make reports & 7-day chart live
    const today = new Date();
    for (let i = 6; i >= 1; i--) {
      const pastDate = new Date(today);
      pastDate.setDate(pastDate.getDate() - i);
      const dateStr = pastDate.toISOString().split('T')[0];

      // P1 attended
      await pool.query(
        'INSERT INTO attendances (pegawai_id, tanggal, jam_masuk, jam_pulang, status, durasi_kerja_menit) VALUES (?, ?, ?, ?, ?, ?)',
        [p1.insertId, dateStr, '07:55:00', '17:05:00', 'Tepat waktu', 550]
      );

      // P2 attended (sometimes late)
      const isLate = i % 2 === 0;
      await pool.query(
        'INSERT INTO attendances (pegawai_id, tanggal, jam_masuk, jam_pulang, status, durasi_kerja_menit) VALUES (?, ?, ?, ?, ?, ?)',
        [p2.insertId, dateStr, isLate ? '08:25:00' : '07:50:00', '17:00:00', isLate ? 'Terlambat' : 'Tepat waktu', isLate ? 515 : 550]
      );
    }

    // 7. Sample leave requests
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 3);
    const nextWeekEnd = new Date(today);
    nextWeekEnd.setDate(nextWeekEnd.getDate() + 4);

    await pool.query(
      'INSERT INTO leave_requests (pegawai_id, jenis, tanggal_mulai, tanggal_selesai, keterangan, status, dokumen_bukti) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [p3.insertId, 'Izin', nextWeek.toISOString().split('T')[0], nextWeekEnd.toISOString().split('T')[0], 'Keperluan keluarga di luar kota', 'Pending', null]
    );

    const pastLeaveStart = new Date(today);
    pastLeaveStart.setDate(pastLeaveStart.getDate() - 4);
    const pastLeaveEnd = new Date(today);
    pastLeaveEnd.setDate(pastLeaveEnd.getDate() - 3);

    await pool.query(
      'INSERT INTO leave_requests (pegawai_id, jenis, tanggal_mulai, tanggal_selesai, keterangan, status, catatan_admin, diproses_pada) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
      [p1.insertId, 'Dinas Luar', pastLeaveStart.toISOString().split('T')[0], pastLeaveEnd.toISOString().split('T')[0], 'Menghadiri Konferensi IT Nasional di Bandung', 'Disetujui', 'Disetujui, harap sertakan SPPD setelah kembali.']
    );

    console.log('Sample data seeded successfully.');
  }
}

function getPool() {
  if (!pool) {
    throw new Error('Database pool not initialized. Call initDB() first.');
  }
  return pool;
}

module.exports = {
  initDB,
  getPool
};

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { getPool } = require('../config/db');
const { verifyToken, requireRole } = require('../middleware/auth');

// GET /api/pegawai - Daftar semua pegawai
router.get('/', verifyToken, async (req, res) => {
  try {
    const pool = getPool();
    const { search, status_pegawai } = req.query;

    let query = `
      SELECT p.id, p.user_id, p.nip, p.nik, p.nama, p.jabatan, p.status_pegawai, p.no_hp, p.alamat, p.created_at,
             u.email, u.username, u.role
      FROM pegawai p
      JOIN users u ON p.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ' AND (p.nama LIKE ? OR p.nip LIKE ? OR p.nik LIKE ? OR p.jabatan LIKE ? OR u.email LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s, s, s);
    }

    if (status_pegawai && status_pegawai !== 'Semua') {
      query += ' AND p.status_pegawai = ?';
      params.push(status_pegawai);
    }

    query += ' ORDER BY p.nama ASC';

    const [rows] = await pool.query(query, params);
    res.json({ success: true, pegawai: rows });
  } catch (error) {
    console.error('Error fetching pegawai list:', error);
    res.status(500).json({ success: false, message: 'Gagal memuat data pegawai.' });
  }
});

// GET /api/pegawai/:id - Detail pegawai
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();

    const [rows] = await pool.query(
      `SELECT p.*, u.email, u.username, u.role
       FROM pegawai p
       JOIN users u ON p.user_id = u.id
       WHERE p.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Pegawai tidak ditemukan.' });
    }

    // Also get last 10 attendances
    const [attendances] = await pool.query(
      `SELECT * FROM attendances WHERE pegawai_id = ? ORDER BY tanggal DESC LIMIT 10`,
      [id]
    );

    // Summary counts
    const [stats] = await pool.query(
      `SELECT 
        COUNT(*) as total_kehadiran,
        SUM(CASE WHEN status = 'Terlambat' THEN 1 ELSE 0 END) as total_terlambat,
        SUM(CASE WHEN status = 'Tepat waktu' THEN 1 ELSE 0 END) as total_tepat_waktu
       FROM attendances WHERE pegawai_id = ?`,
      [id]
    );

    res.json({
      success: true,
      pegawai: rows[0],
      stats: stats[0],
      recent_attendances: attendances
    });
  } catch (error) {
    console.error('Error fetching pegawai detail:', error);
    res.status(500).json({ success: false, message: 'Gagal memuat detail pegawai.' });
  }
});

// POST /api/pegawai - Tambah pegawai baru (Admin only)
router.post('/', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { nama, nip, nik, jabatan, status_pegawai, no_hp, alamat, email, username, password } = req.body;

    if (!nama || !nip || !nik || !jabatan || !email) {
      return res.status(400).json({
        success: false,
        message: 'Lengkapi field wajib: Nama, NIP, NIK, Jabatan, dan Email.'
      });
    }

    const pool = getPool();

    // Check unique constraints
    const [existing] = await pool.query(
      `SELECT u.email, u.username, p.nip, p.nik 
       FROM users u 
       LEFT JOIN pegawai p ON u.id = p.user_id 
       WHERE u.email = ? OR u.username = ? OR p.nip = ? OR p.nik = ?`,
      [email, username || email, nip, nik]
    );

    if (existing.length > 0) {
      const match = existing[0];
      if (match.email === email) return res.status(400).json({ success: false, message: 'Email sudah terdaftar.' });
      if (match.nip === nip) return res.status(400).json({ success: false, message: 'NIP sudah terdaftar.' });
      if (match.nik === nik) return res.status(400).json({ success: false, message: 'NIK sudah terdaftar.' });
      if (match.username === username) return res.status(400).json({ success: false, message: 'Username sudah digunakan.' });
    }

    const passToHash = password && password.trim() ? password : 'password123';
    const hashedPassword = await bcrypt.hash(passToHash, 10);
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      const [userRes] = await conn.query(
        'INSERT INTO users (name, email, username, password, role) VALUES (?, ?, ?, ?, ?)',
        [nama, email, username || email.split('@')[0], hashedPassword, 'pegawai']
      );

      const [pegawaiRes] = await conn.query(
        'INSERT INTO pegawai (user_id, nip, nik, nama, jabatan, status_pegawai, no_hp, alamat) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [userRes.insertId, nip, nik, nama, jabatan, status_pegawai || 'Tetap', no_hp || '', alamat || '']
      );

      await conn.commit();

      res.status(201).json({
        success: true,
        message: 'Data pegawai baru berhasil ditambahkan.',
        pegawai_id: pegawaiRes.insertId
      });
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error('Error creating pegawai:', error);
    res.status(500).json({ success: false, message: 'Gagal menambahkan pegawai: ' + error.message });
  }
});

// PUT /api/pegawai/:id - Edit data pegawai (Admin only)
router.put('/:id', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, nip, nik, jabatan, status_pegawai, no_hp, alamat, email, password } = req.body;

    const pool = getPool();
    const [pegawaiRows] = await pool.query('SELECT * FROM pegawai WHERE id = ?', [id]);
    if (pegawaiRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Data pegawai tidak ditemukan.' });
    }

    const currentPegawai = pegawaiRows[0];
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      // Update pegawai table
      await conn.query(
        `UPDATE pegawai 
         SET nama = ?, nip = ?, nik = ?, jabatan = ?, status_pegawai = ?, no_hp = ?, alamat = ?
         WHERE id = ?`,
        [nama, nip, nik, jabatan, status_pegawai, no_hp, alamat, id]
      );

      // Update users table (name, email, password if provided)
      if (email || password) {
        if (password && password.trim() !== '') {
          const hashedPassword = await bcrypt.hash(password, 10);
          await conn.query(
            'UPDATE users SET name = ?, email = COALESCE(?, email), password = ? WHERE id = ?',
            [nama, email || null, hashedPassword, currentPegawai.user_id]
          );
        } else {
          await conn.query(
            'UPDATE users SET name = ?, email = COALESCE(?, email) WHERE id = ?',
            [nama, email || null, currentPegawai.user_id]
          );
        }
      }

      await conn.commit();
      res.json({ success: true, message: 'Data pegawai berhasil diperbarui.' });
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error('Error updating pegawai:', error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui data pegawai: ' + error.message });
  }
});

// DELETE /api/pegawai/:id - Hapus pegawai (Admin only)
router.delete('/:id', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();

    const [pegawai] = await pool.query('SELECT user_id FROM pegawai WHERE id = ?', [id]);
    if (pegawai.length === 0) {
      return res.status(404).json({ success: false, message: 'Data pegawai tidak ditemukan.' });
    }

    const userId = pegawai[0].user_id;

    // Deleting the user will cascade delete the pegawai, attendances, and leave_requests
    await pool.query('DELETE FROM users WHERE id = ?', [userId]);

    res.json({ success: true, message: 'Pegawai beserta data terkait berhasil dihapus.' });
  } catch (error) {
    console.error('Error deleting pegawai:', error);
    res.status(500).json({ success: false, message: 'Gagal menghapus pegawai: ' + error.message });
  }
});

module.exports = router;

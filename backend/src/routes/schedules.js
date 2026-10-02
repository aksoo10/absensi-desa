const express = require('express');
const router = express.Router();
const { getPool } = require('../config/db');
const { verifyToken, requireRole } = require('../middleware/auth');

// GET /api/schedules - Daftar semua jadwal kerja
router.get('/', verifyToken, async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM schedules ORDER BY is_default DESC, nama_jadwal ASC');
    res.json({ success: true, schedules: rows });
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ success: false, message: 'Gagal memuat daftar jadwal.' });
  }
});

// GET /api/schedules/active - Jadwal default aktif
router.get('/active', verifyToken, async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM schedules WHERE is_default = 1 LIMIT 1');
    const schedule = rows.length > 0 ? rows[0] : null;
    res.json({ success: true, schedule });
  } catch (error) {
    console.error('Error fetching active schedule:', error);
    res.status(500).json({ success: false, message: 'Gagal memuat jadwal aktif.' });
  }
});

// POST /api/schedules - Tambah jadwal kerja (Admin only)
router.post('/', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { nama_jadwal, hari_kerja, jam_masuk, jam_pulang, toleransi_menit, is_default } = req.body;

    if (!nama_jadwal || !jam_masuk || !jam_pulang) {
      return res.status(400).json({
        success: false,
        message: 'Harap lengkapi Nama Jadwal, Jam Masuk, dan Jam Pulang.'
      });
    }

    const pool = getPool();
    const isDefaultVal = is_default ? 1 : 0;

    // If marked as default, clear other default
    if (isDefaultVal === 1) {
      await pool.query('UPDATE schedules SET is_default = 0');
    }

    const [result] = await pool.query(
      `INSERT INTO schedules (nama_jadwal, hari_kerja, jam_masuk, jam_pulang, toleransi_menit, is_default)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nama_jadwal, hari_kerja || 'Senin - Jumat', jam_masuk, jam_pulang, toleransi_menit || 15, isDefaultVal]
    );

    res.status(201).json({
      success: true,
      message: 'Jadwal kerja berhasil dibuat.',
      id: result.insertId
    });
  } catch (error) {
    console.error('Error creating schedule:', error);
    res.status(500).json({ success: false, message: 'Gagal membuat jadwal: ' + error.message });
  }
});

// PUT /api/schedules/:id - Ubah jadwal kerja (Admin only)
router.put('/:id', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_jadwal, hari_kerja, jam_masuk, jam_pulang, toleransi_menit, is_default } = req.body;

    const pool = getPool();
    const isDefaultVal = is_default ? 1 : 0;

    if (isDefaultVal === 1) {
      await pool.query('UPDATE schedules SET is_default = 0 WHERE id != ?', [id]);
    }

    await pool.query(
      `UPDATE schedules 
       SET nama_jadwal = ?, hari_kerja = ?, jam_masuk = ?, jam_pulang = ?, toleransi_menit = ?, is_default = ?
       WHERE id = ?`,
      [nama_jadwal, hari_kerja, jam_masuk, jam_pulang, toleransi_menit, isDefaultVal, id]
    );

    res.json({ success: true, message: 'Jadwal kerja berhasil diperbarui.' });
  } catch (error) {
    console.error('Error updating schedule:', error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui jadwal: ' + error.message });
  }
});

// DELETE /api/schedules/:id - Hapus jadwal kerja (Admin only)
router.delete('/:id', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();

    // Check if it's default and there are others
    const [rows] = await pool.query('SELECT * FROM schedules WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Jadwal tidak ditemukan.' });
    }

    if (rows[0].is_default) {
      // Set another one as default if available
      const [others] = await pool.query('SELECT id FROM schedules WHERE id != ? LIMIT 1', [id]);
      if (others.length > 0) {
        await pool.query('UPDATE schedules SET is_default = 1 WHERE id = ?', [others[0].id]);
      }
    }

    await pool.query('DELETE FROM schedules WHERE id = ?', [id]);
    res.json({ success: true, message: 'Jadwal kerja berhasil dihapus.' });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    res.status(500).json({ success: false, message: 'Gagal menghapus jadwal: ' + error.message });
  }
});

module.exports = router;

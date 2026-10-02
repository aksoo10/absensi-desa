const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { getPool } = require('../config/db');
const { verifyToken, requireRole } = require('../middleware/auth');

// Setup upload directory
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'doc-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    // accept images and pdfs/docs
    const allowed = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowed.test(file.mimetype);
    if (extname || mimetype) {
      return cb(null, true);
    }
    cb(new Error('Format file tidak didukung. Harap unggah PDF, JPG, PNG, atau DOC/DOCX.'));
  }
});

// POST /api/leave/request - Alur 5: Pegawai kirim pengajuan
router.post('/request', verifyToken, upload.single('dokumen_bukti'), async (req, res) => {
  try {
    const pool = getPool();
    const pegawaiId = req.user.pegawai_id;

    if (!pegawaiId) {
      return res.status(400).json({ success: false, message: 'Hanya pegawai yang dapat membuat pengajuan.' });
    }

    const { jenis, tanggal_mulai, tanggal_selesai, keterangan } = req.body;

    if (!jenis || !tanggal_mulai || !tanggal_selesai || !keterangan) {
      return res.status(400).json({
        success: false,
        message: 'Harap lengkapi semua kolom: Jenis pengajuan, Tanggal mulai, Tanggal selesai, dan Keterangan.'
      });
    }

    const allowedTypes = ['Izin', 'Sakit', 'Dinas Luar'];
    if (!allowedTypes.includes(jenis)) {
      return res.status(400).json({ success: false, message: 'Jenis pengajuan tidak valid.' });
    }

    const dokumen_bukti = req.file ? req.file.filename : null;

    const [result] = await pool.query(
      `INSERT INTO leave_requests (pegawai_id, jenis, tanggal_mulai, tanggal_selesai, keterangan, dokumen_bukti, status)
       VALUES (?, ?, ?, ?, ?, ?, 'Pending')`,
      [pegawaiId, jenis, tanggal_mulai, tanggal_selesai, keterangan, dokumen_bukti]
    );

    res.status(201).json({
      success: true,
      message: 'Pengajuan berhasil dikirim dengan status Pending. Menunggu persetujuan admin.',
      id: result.insertId
    });
  } catch (error) {
    console.error('Error submitting leave request:', error);
    res.status(500).json({ success: false, message: 'Gagal mengirim pengajuan: ' + error.message });
  }
});

// GET /api/leave/my-requests - Daftar pengajuan pegawai login
router.get('/my-requests', verifyToken, async (req, res) => {
  try {
    const pool = getPool();
    const pegawaiId = req.user.pegawai_id;

    if (!pegawaiId) {
      return res.status(400).json({ success: false, message: 'Data pegawai tidak ditemukan.' });
    }

    const [rows] = await pool.query(
      `SELECT * FROM leave_requests 
       WHERE pegawai_id = ? 
       ORDER BY created_at DESC`,
      [pegawaiId]
    );

    res.json({ success: true, requests: rows });
  } catch (error) {
    console.error('Error fetching my requests:', error);
    res.status(500).json({ success: false, message: 'Gagal memuat daftar pengajuan.' });
  }
});

// GET /api/leave/all - Alur 6: Admin melihat semua pengajuan pegawai
router.get('/all', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const pool = getPool();
    const { status, jenis } = req.query;

    let query = `
      SELECT lr.*, p.nama, p.nip, p.jabatan, p.status_pegawai, u.email
      FROM leave_requests lr
      JOIN pegawai p ON lr.pegawai_id = p.id
      JOIN users u ON p.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'Semua') {
      query += ' AND lr.status = ?';
      params.push(status);
    }
    if (jenis && jenis !== 'Semua') {
      query += ' AND lr.jenis = ?';
      params.push(jenis);
    }

    query += ' ORDER BY lr.created_at DESC';

    const [rows] = await pool.query(query, params);

    res.json({ success: true, requests: rows });
  } catch (error) {
    console.error('Error fetching all requests:', error);
    res.status(500).json({ success: false, message: 'Gagal memuat daftar pengajuan admin.' });
  }
});

// PUT /api/leave/:id/process - Alur 6: Admin validasi & setujui/tolak pengajuan
router.put('/:id/process', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, catatan_admin } = req.body;

    if (!status || !['Disetujui', 'Ditolak'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status keputusan harus "Disetujui" atau "Ditolak".'
      });
    }

    const pool = getPool();
    const [existing] = await pool.query('SELECT * FROM leave_requests WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Data pengajuan tidak ditemukan.' });
    }

    await pool.query(
      `UPDATE leave_requests 
       SET status = ?, catatan_admin = ?, diproses_pada = NOW() 
       WHERE id = ?`,
      [status, catatan_admin || null, id]
    );

    res.json({
      success: true,
      message: `Pengajuan berhasil diubah menjadi: ${status}.`
    });
  } catch (error) {
    console.error('Error processing leave request:', error);
    res.status(500).json({ success: false, message: 'Gagal memproses pengajuan: ' + error.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getPool } = require('../config/db');
const { verifyToken, JWT_SECRET } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier can be email or username
    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Mohon masukkan email/username dan kata sandi.'
      });
    }

    const pool = getPool();
    const [users] = await pool.query(
      `SELECT u.*, p.id as pegawai_id, p.nip, p.nik, p.jabatan, p.status_pegawai, p.no_hp, p.alamat
       FROM users u
       LEFT JOIN pegawai p ON u.id = p.user_id
       WHERE u.email = ? OR u.username = ?`,
      [identifier, identifier]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Email atau username tidak ditemukan.'
      });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Kata sandi salah. Silakan periksa kembali.'
      });
    }

    const tokenPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
      pegawai_id: user.pegawai_id || null
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      message: 'Login berhasil.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        pegawai: user.pegawai_id ? {
          id: user.pegawai_id,
          nip: user.nip,
          nik: user.nik,
          nama: user.name,
          jabatan: user.jabatan,
          status_pegawai: user.status_pegawai,
          no_hp: user.no_hp,
          alamat: user.alamat
        } : null
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server saat login.' });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, username, password, nip, nik, jabatan, status_pegawai, no_hp, alamat } = req.body;

    if (!name || !email || !password || !nip || !nik || !jabatan) {
      return res.status(400).json({
        success: false,
        message: 'Lengkapi semua field wajib: Nama, Email, Password, NIP, NIK, dan Jabatan.'
      });
    }

    const pool = getPool();
    // Check existing email or username or nip or nik
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

    const hashedPassword = await bcrypt.hash(password, 10);
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      const [userResult] = await conn.query(
        'INSERT INTO users (name, email, username, password, role) VALUES (?, ?, ?, ?, ?)',
        [name, email, username || email.split('@')[0], hashedPassword, 'pegawai']
      );

      const [pegawaiResult] = await conn.query(
        'INSERT INTO pegawai (user_id, nip, nik, nama, jabatan, status_pegawai, no_hp, alamat) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [userResult.insertId, nip, nik, name, jabatan, status_pegawai || 'Tetap', no_hp || '', alamat || '']
      );

      await conn.commit();

      res.status(201).json({
        success: true,
        message: 'Registrasi pegawai berhasil. Silakan login.'
      });
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Gagal melakukan pendaftaran akun: ' + error.message });
  }
});

// GET /api/auth/me
router.get('/me', verifyToken, async (req, res) => {
  try {
    const pool = getPool();
    const [users] = await pool.query(
      `SELECT u.id, u.name, u.email, u.username, u.role,
              p.id as pegawai_id, p.nip, p.nik, p.jabatan, p.status_pegawai, p.no_hp, p.alamat
       FROM users u
       LEFT JOIN pegawai p ON u.id = p.user_id
       WHERE u.id = ?`,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'Data pengguna tidak ditemukan.' });
    }

    const user = users[0];
    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        pegawai: user.pegawai_id ? {
          id: user.pegawai_id,
          nip: user.nip,
          nik: user.nik,
          nama: user.name,
          jabatan: user.jabatan,
          status_pegawai: user.status_pegawai,
          no_hp: user.no_hp,
          alamat: user.alamat
        } : null
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan saat memverifikasi sesi.' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { getPool } = require('../config/db');
const { verifyToken, requireRole } = require('../middleware/auth');

// Helper to get today's date in YYYY-MM-DD local format
function getTodayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper to get current time in HH:mm:ss local format
function getCurrentTimeString() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

// Helper: parse HH:mm:ss to total minutes from midnight
function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const parts = timeStr.split(':');
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
}

// GET /api/attendance/today - Get today's attendance & active schedule
router.get('/today', verifyToken, async (req, res) => {
  try {
    const pool = getPool();
    const pegawaiId = req.user.pegawai_id;

    if (!pegawaiId) {
      return res.status(400).json({ success: false, message: 'Data pegawai tidak ditemukan untuk akun ini.' });
    }

    const todayStr = getTodayString();

    // 1. Get active/default schedule
    const [schedules] = await pool.query(
      'SELECT * FROM schedules WHERE is_default = 1 LIMIT 1'
    );
    const schedule = schedules.length > 0 ? schedules[0] : {
      nama_jadwal: 'Reguler Default',
      hari_kerja: 'Senin - Jumat',
      jam_masuk: '08:00:00',
      jam_pulang: '17:00:00',
      toleransi_menit: 15
    };

    // 2. Get attendance for today
    const [attendances] = await pool.query(
      'SELECT * FROM attendances WHERE pegawai_id = ? AND tanggal = ?',
      [pegawaiId, todayStr]
    );

    const attendance = attendances.length > 0 ? attendances[0] : null;

    res.json({
      success: true,
      tanggal: todayStr,
      currentTime: getCurrentTimeString(),
      schedule,
      attendance
    });
  } catch (error) {
    console.error('Error fetching today attendance:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data absensi hari ini.' });
  }
});

// POST /api/attendance/check-in - Alur 3: Absensi Masuk
router.post('/check-in', verifyToken, async (req, res) => {
  try {
    const pool = getPool();
    const pegawaiId = req.user.pegawai_id;

    if (!pegawaiId) {
      return res.status(400).json({ success: false, message: 'Hanya pegawai yang dapat melakukan absensi.' });
    }

    const todayStr = getTodayString();
    const currentTimeStr = getCurrentTimeString();

    // Check if already checked in today
    const [existing] = await pool.query(
      'SELECT * FROM attendances WHERE pegawai_id = ? AND tanggal = ?',
      [pegawaiId, todayStr]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Anda sudah melakukan absensi masuk hari ini pada pukul ${existing[0].jam_masuk}.`
      });
    }

    // Get active schedule
    const [schedules] = await pool.query(
      'SELECT * FROM schedules WHERE is_default = 1 LIMIT 1'
    );
    const schedule = schedules.length > 0 ? schedules[0] : {
      jam_masuk: '08:00:00',
      toleransi_menit: 15
    };

    // Determine status (Tepat waktu vs Terlambat)
    // Toleransi: jam_masuk + toleransi_menit
    const checkInMinutes = timeToMinutes(currentTimeStr);
    const scheduledMinutes = timeToMinutes(schedule.jam_masuk);
    const tolerance = parseInt(schedule.toleransi_menit || 0, 10);
    const maxOnTimeMinutes = scheduledMinutes + tolerance;

    const isLate = checkInMinutes > maxOnTimeMinutes;
    const status = isLate ? 'Terlambat' : 'Tepat waktu';

    // Insert attendance
    const [result] = await pool.query(
      'INSERT INTO attendances (pegawai_id, tanggal, jam_masuk, status, keterangan) VALUES (?, ?, ?, ?, ?)',
      [pegawaiId, todayStr, currentTimeStr, status, req.body.keterangan || (isLate ? 'Absen masuk terlambat' : 'Absen tepat waktu')]
    );

    res.status(201).json({
      success: true,
      message: `Absensi masuk berhasil dicatat! Status: ${status}.`,
      attendance: {
        id: result.insertId,
        pegawai_id: pegawaiId,
        tanggal: todayStr,
        jam_masuk: currentTimeStr,
        jam_pulang: null,
        status,
        schedule
      }
    });
  } catch (error) {
    console.error('Error check-in:', error);
    res.status(500).json({ success: false, message: 'Gagal melakukan absensi masuk: ' + error.message });
  }
});

// POST /api/attendance/check-out - Alur 4: Absensi Pulang
router.post('/check-out', verifyToken, async (req, res) => {
  try {
    const pool = getPool();
    const pegawaiId = req.user.pegawai_id;

    if (!pegawaiId) {
      return res.status(400).json({ success: false, message: 'Hanya pegawai yang dapat melakukan absensi.' });
    }

    const todayStr = getTodayString();
    const currentTimeStr = getCurrentTimeString();

    // Check if employee has checked in today
    const [existing] = await pool.query(
      'SELECT * FROM attendances WHERE pegawai_id = ? AND tanggal = ?',
      [pegawaiId, todayStr]
    );

    if (existing.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Absensi pulang ditolak. Anda belum melakukan absensi masuk hari ini!'
      });
    }

    const attendance = existing[0];
    if (attendance.jam_pulang) {
      return res.status(400).json({
        success: false,
        message: `Anda sudah melakukan absensi pulang sebelumnya pada pukul ${attendance.jam_pulang}.`
      });
    }

    // Calculate working duration in minutes
    const checkInMin = timeToMinutes(attendance.jam_masuk);
    const checkOutMin = timeToMinutes(currentTimeStr);
    const durationMinutes = Math.max(0, checkOutMin - checkInMin);

    // Update attendance record
    await pool.query(
      'UPDATE attendances SET jam_pulang = ?, durasi_kerja_menit = ? WHERE id = ?',
      [currentTimeStr, durationMinutes, attendance.id]
    );

    const hours = Math.floor(durationMinutes / 60);
    const mins = durationMinutes % 60;
    const durasiDisplay = `${hours} jam ${mins} menit`;

    res.json({
      success: true,
      message: `Absensi pulang berhasil dicatat pada pukul ${currentTimeStr}! Total durasi kerja: ${durasiDisplay}.`,
      attendance: {
        ...attendance,
        jam_pulang: currentTimeStr,
        durasi_kerja_menit: durationMinutes,
        durasi_display: durasiDisplay
      }
    });
  } catch (error) {
    console.error('Error check-out:', error);
    res.status(500).json({ success: false, message: 'Gagal melakukan absensi pulang: ' + error.message });
  }
});

// GET /api/attendance/history - Pegawai attendance history
router.get('/history', verifyToken, async (req, res) => {
  try {
    const pool = getPool();
    const pegawaiId = req.user.pegawai_id;

    if (!pegawaiId) {
      return res.status(400).json({ success: false, message: 'Data pegawai tidak ditemukan.' });
    }

    const [rows] = await pool.query(
      `SELECT * FROM attendances 
       WHERE pegawai_id = ? 
       ORDER BY tanggal DESC, jam_masuk DESC 
       LIMIT 30`,
      [pegawaiId]
    );

    res.json({ success: true, history: rows });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil riwayat absensi.' });
  }
});

// GET /api/attendance/stats - Dashboard Pegawai summary counts
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const pool = getPool();
    const pegawaiId = req.user.pegawai_id;

    if (!pegawaiId) {
      return res.status(400).json({ success: false, message: 'Data pegawai tidak ditemukan.' });
    }

    // 1. Attendance stats
    const [attStats] = await pool.query(
      `SELECT 
        COUNT(*) as total_kehadiran,
        SUM(CASE WHEN status = 'Terlambat' THEN 1 ELSE 0 END) as total_terlambat,
        SUM(CASE WHEN status = 'Tepat waktu' THEN 1 ELSE 0 END) as total_tepat_waktu
       FROM attendances
       WHERE pegawai_id = ?`,
      [pegawaiId]
    );

    // 2. Leave stats
    const [leaveStats] = await pool.query(
      `SELECT 
        SUM(CASE WHEN jenis = 'Izin' AND status = 'Disetujui' THEN 1 ELSE 0 END) as total_izin,
        SUM(CASE WHEN jenis = 'Sakit' AND status = 'Disetujui' THEN 1 ELSE 0 END) as total_sakit,
        SUM(CASE WHEN jenis = 'Dinas Luar' AND status = 'Disetujui' THEN 1 ELSE 0 END) as total_dinas_luar,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pengajuan_pending
       FROM leave_requests
       WHERE pegawai_id = ?`,
      [pegawaiId]
    );

    res.json({
      success: true,
      stats: {
        total_kehadiran: attStats[0]?.total_kehadiran || 0,
        total_terlambat: attStats[0]?.total_terlambat || 0,
        total_tepat_waktu: attStats[0]?.total_tepat_waktu || 0,
        total_izin: leaveStats[0]?.total_izin || 0,
        total_sakit: leaveStats[0]?.total_sakit || 0,
        total_dinas_luar: leaveStats[0]?.total_dinas_luar || 0,
        pengajuan_pending: leaveStats[0]?.pengajuan_pending || 0
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil statistik pegawai.' });
  }
});

module.exports = router;

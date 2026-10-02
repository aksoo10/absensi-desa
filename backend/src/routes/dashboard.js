const express = require('express');
const router = express.Router();
const { getPool } = require('../config/db');
const { verifyToken, requireRole } = require('../middleware/auth');

function getTodayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// GET /api/dashboard/admin - Dashboard Admin data aggregation
router.get('/admin', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const pool = getPool();
    const todayStr = getTodayString();

    // 1. Total pegawai aktif
    const [pegawaiCount] = await pool.query('SELECT COUNT(*) as count FROM pegawai');
    const totalPegawaiAktif = pegawaiCount[0]?.count || 0;

    // 2. Hadir hari ini & Terlambat hari ini
    const [todayAtt] = await pool.query(
      `SELECT 
        COUNT(*) as total_hadir,
        SUM(CASE WHEN status = 'Terlambat' THEN 1 ELSE 0 END) as total_terlambat,
        SUM(CASE WHEN status = 'Tepat waktu' THEN 1 ELSE 0 END) as total_tepat_waktu
       FROM attendances
       WHERE tanggal = ?`,
      [todayStr]
    );

    const hadirHariIni = todayAtt[0]?.total_hadir || 0;
    const terlambatHariIni = todayAtt[0]?.total_terlambat || 0;
    const tepatWaktuHariIni = todayAtt[0]?.total_tepat_waktu || 0;

    // 3. Izin / Sakit hari ini
    const [todayLeave] = await pool.query(
      `SELECT COUNT(*) as count FROM leave_requests 
       WHERE status = 'Disetujui' AND ? BETWEEN tanggal_mulai AND tanggal_selesai`,
      [todayStr]
    );
    const izinSakitHariIni = todayLeave[0]?.count || 0;

    // 4. Tidak hadir (pegawai yang tidak ada record attendance dan tidak ada record izin disetujui hari ini)
    const tidakHadir = Math.max(0, totalPegawaiAktif - hadirHariIni - izinSakitHariIni);

    // 5. Pengajuan pending
    const [pendingCount] = await pool.query(
      "SELECT COUNT(*) as count FROM leave_requests WHERE status = 'Pending'"
    );
    const pengajuanPending = pendingCount[0]?.count || 0;

    // 6. Grafik absensi 7 hari terakhir
    const chartData = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
      const dayName = dayNames[d.getDay()];

      const [dayAtt] = await pool.query(
        `SELECT 
          COUNT(*) as hadir,
          SUM(CASE WHEN status = 'Terlambat' THEN 1 ELSE 0 END) as terlambat,
          SUM(CASE WHEN status = 'Tepat waktu' THEN 1 ELSE 0 END) as tepat_waktu
         FROM attendances
         WHERE tanggal = ?`,
        [dStr]
      );

      const [dayLeave] = await pool.query(
        `SELECT COUNT(*) as count FROM leave_requests 
         WHERE status = 'Disetujui' AND ? BETWEEN tanggal_mulai AND tanggal_selesai`,
        [dStr]
      );

      chartData.push({
        date: dStr,
        dayLabel: `${dayName} (${d.getDate()}/${d.getMonth() + 1})`,
        hadir: dayAtt[0]?.hadir || 0,
        terlambat: dayAtt[0]?.terlambat || 0,
        tepat_waktu: dayAtt[0]?.tepat_waktu || 0,
        izin_sakit: dayLeave[0]?.count || 0
      });
    }

    // 7. Tabel absensi hari ini (live monitoring)
    const [todayList] = await pool.query(
      `SELECT a.*, p.nama, p.nip, p.jabatan, p.status_pegawai
       FROM attendances a
       JOIN pegawai p ON a.pegawai_id = p.id
       WHERE a.tanggal = ?
       ORDER BY a.jam_masuk DESC`,
      [todayStr]
    );

    // 8. Recent pending approvals
    const [recentPending] = await pool.query(
      `SELECT lr.*, p.nama, p.jabatan, p.nip
       FROM leave_requests lr
       JOIN pegawai p ON lr.pegawai_id = p.id
       WHERE lr.status = 'Pending'
       ORDER BY lr.created_at DESC
       LIMIT 5`
    );

    res.json({
      success: true,
      data: {
        total_pegawai: totalPegawaiAktif,
        hadir_hari_ini: hadirHariIni,
        terlambat_hari_ini: terlambatHariIni,
        tepat_waktu_hari_ini: tepatWaktuHariIni,
        tidak_hadir_hari_ini: tidakHadir,
        izin_sakit_hari_ini: izinSakitHariIni,
        pengajuan_pending: pengajuanPending,
        chart_7_days: chartData,
        today_attendances: todayList,
        pending_requests: recentPending
      }
    });
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    res.status(500).json({ success: false, message: 'Gagal memuat dashboard admin: ' + error.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { getPool } = require('../config/db');
const { verifyToken, requireRole } = require('../middleware/auth');

// GET /api/reports - Laporan absensi dengan filter fleksibel
router.get('/', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const pool = getPool();
    const { period, start_date, end_date, pegawai_id } = req.query;

    const now = new Date();
    let startDateStr = start_date;
    let endDateStr = end_date;

    if (period === 'mingguan') {
      const past7 = new Date(now);
      past7.setDate(past7.getDate() - 6);
      startDateStr = past7.toISOString().split('T')[0];
      endDateStr = now.toISOString().split('T')[0];
    } else if (period === 'bulanan' || (!startDateStr && !endDateStr)) {
      // First day of current month to current day (or end of month)
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      startDateStr = `${y}-${m}-01`;
      endDateStr = now.toISOString().split('T')[0];
    }

    // 1. Fetch attendance records in date range
    let attQuery = `
      SELECT a.*, p.nama, p.nip, p.jabatan, p.status_pegawai
      FROM attendances a
      JOIN pegawai p ON a.pegawai_id = p.id
      WHERE a.tanggal BETWEEN ? AND ?
    `;
    const attParams = [startDateStr, endDateStr];

    if (pegawai_id && pegawai_id !== 'all') {
      attQuery += ' AND a.pegawai_id = ?';
      attParams.push(pegawai_id);
    }

    attQuery += ' ORDER BY a.tanggal DESC, p.nama ASC';
    const [attendances] = await pool.query(attQuery, attParams);

    // 2. Fetch leave requests in date range
    let leaveQuery = `
      SELECT lr.*, p.nama, p.nip, p.jabatan
      FROM leave_requests lr
      JOIN pegawai p ON lr.pegawai_id = p.id
      WHERE lr.status = 'Disetujui'
        AND ((lr.tanggal_mulai BETWEEN ? AND ?) OR (lr.tanggal_selesai BETWEEN ? AND ?))
    `;
    const leaveParams = [startDateStr, endDateStr, startDateStr, endDateStr];
    if (pegawai_id && pegawai_id !== 'all') {
      leaveQuery += ' AND lr.pegawai_id = ?';
      leaveParams.push(pegawai_id);
    }
    const [leaves] = await pool.query(leaveQuery, leaveParams);

    // 3. Calculate Aggregations
    const hadir = attendances.length;
    const terlambat = attendances.filter(a => a.status === 'Terlambat').length;
    const tepatWaktu = attendances.filter(a => a.status === 'Tepat waktu').length;
    
    const izin = leaves.filter(l => l.jenis === 'Izin').length;
    const sakit = leaves.filter(l => l.jenis === 'Sakit').length;
    const dinasLuar = leaves.filter(l => l.jenis === 'Dinas Luar').length;

    const totalDurasiMenit = attendances.reduce((acc, curr) => acc + (parseInt(curr.durasi_kerja_menit, 10) || 0), 0);
    const totalJam = Math.floor(totalDurasiMenit / 60);
    const totalMenitSisa = totalDurasiMenit % 60;

    // 4. Per employee breakdown
    const employeeSummaryMap = {};
    attendances.forEach(a => {
      if (!employeeSummaryMap[a.pegawai_id]) {
        employeeSummaryMap[a.pegawai_id] = {
          pegawai_id: a.pegawai_id,
          nama: a.nama,
          nip: a.nip,
          jabatan: a.jabatan,
          hadir: 0,
          tepat_waktu: 0,
          terlambat: 0,
          izin: 0,
          sakit: 0,
          dinas_luar: 0,
          durasi_menit: 0
        };
      }
      employeeSummaryMap[a.pegawai_id].hadir += 1;
      if (a.status === 'Tepat waktu') employeeSummaryMap[a.pegawai_id].tepat_waktu += 1;
      if (a.status === 'Terlambat') employeeSummaryMap[a.pegawai_id].terlambat += 1;
      employeeSummaryMap[a.pegawai_id].durasi_menit += (parseInt(a.durasi_kerja_menit, 10) || 0);
    });

    leaves.forEach(l => {
      if (employeeSummaryMap[l.pegawai_id]) {
        if (l.jenis === 'Izin') employeeSummaryMap[l.pegawai_id].izin += 1;
        if (l.jenis === 'Sakit') employeeSummaryMap[l.pegawai_id].sakit += 1;
        if (l.jenis === 'Dinas Luar') employeeSummaryMap[l.pegawai_id].dinas_luar += 1;
      }
    });

    res.json({
      success: true,
      filter: {
        period: period || 'bulanan',
        start_date: startDateStr,
        end_date: endDateStr,
        pegawai_id: pegawai_id || 'all'
      },
      summary: {
        total_hadir: hadir,
        total_terlambat: terlambat,
        total_tepat_waktu: tepatWaktu,
        total_izin: izin,
        total_sakit: sakit,
        total_dinas_luar: dinasLuar,
        total_durasi_menit: totalDurasiMenit,
        total_jam_kerja: `${totalJam} jam ${totalMenitSisa} menit`
      },
      employee_breakdown: Object.values(employeeSummaryMap),
      records: attendances
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ success: false, message: 'Gagal membuat laporan: ' + error.message });
  }
});

module.exports = router;

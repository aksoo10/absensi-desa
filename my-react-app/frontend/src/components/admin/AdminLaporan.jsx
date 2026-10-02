import React, { useState, useEffect } from 'react';
import { reportsApi, pegawaiApi } from '../../api';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Filter,
  Calendar,
  UserCheck,
  AlertTriangle,
  Clock,
  Activity,
  Plane,
  FileText,
  Users
} from 'lucide-react';

export default function AdminLaporan() {
  const [reportData, setReportData] = useState(null);
  const [pegawaiList, setPegawaiList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [period, setPeriod] = useState('bulanan');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [pegawaiId, setPegawaiId] = useState('all');

  const loadPegawaiList = async () => {
    try {
      const res = await pegawaiApi.getAll();
      if (res.success) {
        setPegawaiList(res.pegawai);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadReport = async () => {
    try {
      setLoading(true);
      const params = {
        period,
        pegawai_id: pegawaiId
      };
      if (period === 'custom') {
        params.start_date = startDate;
        params.end_date = endDate;
      }
      const res = await reportsApi.getReports(params);
      if (res.success) {
        setReportData(res);
      }
    } catch (err) {
      console.error('Error fetching report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPegawaiList();
    // Default dates
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    setStartDate(`${y}-${m}-01`);
    setEndDate(now.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    loadReport();
  }, [period, pegawaiId]);

  const handleCustomFilterSubmit = (e) => {
    e.preventDefault();
    loadReport();
  };

  // Export CSV
  const exportToCSV = () => {
    if (!reportData || !reportData.records) return;
    const records = reportData.records;
    const headers = ['Tanggal', 'NIP', 'Nama Pegawai', 'Jabatan', 'Jam Masuk', 'Jam Pulang', 'Status', 'Durasi Menit', 'Keterangan'];
    const rows = records.map(r => [
      r.tanggal,
      r.nip,
      `"${r.nama}"`,
      `"${r.jabatan}"`,
      r.jam_masuk || '',
      r.jam_pulang || '',
      r.status,
      r.durasi_kerja_menit || 0,
      `"${r.keterangan || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Presensi_${period}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const summary = reportData?.summary || {};
  const breakdown = reportData?.employee_breakdown || [];
  const records = reportData?.records || [];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* FILTER & ACTIONS BAR (hidden in print) */}
      <div className="card no-print">
        <div className="card-header" style={{ marginBottom: '16px' }}>
          <div>
            <div className="card-title">
              <FileSpreadsheet size={22} color="#4f46e5" />
              Laporan Rekapitulasi Presensi & Kehadiran
            </div>
            <div className="card-subtitle">
              Saring berdasarkan periode dan pegawai untuk perhitungan otomatis
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={exportToCSV}>
              <Download size={14} /> Unduh CSV
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={handlePrint}>
              <Printer size={14} /> Cetak Laporan Resmi
            </button>
          </div>
        </div>

        <form onSubmit={handleCustomFilterSubmit} style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          {/* Periode Selector */}
          <div>
            <label className="form-label">Periode Waktu:</label>
            <select
              className="form-control"
              style={{ width: '180px' }}
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              <option value="bulanan">Bulan Ini</option>
              <option value="mingguan">7 Hari Terakhir</option>
              <option value="custom">Rentang Tanggal Khusus</option>
            </select>
          </div>

          {period === 'custom' && (
            <>
              <div>
                <label className="form-label">Dari Tanggal:</label>
                <input
                  type="date"
                  className="form-control"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="form-label">Sampai Tanggal:</label>
                <input
                  type="date"
                  className="form-control"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          {/* Pegawai Filter */}
          <div>
            <label className="form-label">Pilih Pegawai:</label>
            <select
              className="form-control"
              style={{ width: '220px' }}
              value={pegawaiId}
              onChange={(e) => setPegawaiId(e.target.value)}
            >
              <option value="all">Semua Pegawai</option>
              {pegawaiList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nama} ({p.jabatan})
                </option>
              ))}
            </select>
          </div>

          {period === 'custom' && (
            <button type="submit" className="btn btn-primary">
              <Filter size={16} /> Terapkan Filter
            </button>
          )}
        </form>
      </div>

      {/* PRINT HEADER (Visible only in print) */}
      <div style={{ display: 'none' }} className="print-header">
        <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '12px', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>PT PERUSAHAAN CONTOH INDONESIA</h2>
          <p style={{ fontSize: '0.875rem' }}>LAPORAN REKAPITULASI PRESENSI DAN KEHADIRAN PEGAWAI</p>
          <p style={{ fontSize: '0.75rem', color: '#666' }}>
            Periode: {reportData?.filter?.start_date} s/d {reportData?.filter?.end_date}
          </p>
        </div>
      </div>

      {/* 7 CALCULATED METRICS CARDS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '14px'
      }}>
        <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>TOTAL HADIR</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>
            {summary.total_hadir || 0}
          </div>
        </div>

        <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>TEPAT WAKTU</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
            {summary.total_tepat_waktu || 0}
          </div>
        </div>

        <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>TERLAMBAT</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>
            {summary.total_terlambat || 0}
          </div>
        </div>

        <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>IZIN</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0284c7', marginTop: '4px' }}>
            {summary.total_izin || 0}
          </div>
        </div>

        <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>SAKIT</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#e11d48', marginTop: '4px' }}>
            {summary.total_sakit || 0}
          </div>
        </div>

        <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>DINAS LUAR</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#7c3aed', marginTop: '4px' }}>
            {summary.total_dinas_luar || 0}
          </div>
        </div>

        <div className="card" style={{ padding: '16px', textAlign: 'center', gridColumn: 'span 1' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>TOTAL JAM KERJA</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#4f46e5', marginTop: '8px' }}>
            {summary.total_jam_kerja || '0 jam'}
          </div>
        </div>
      </div>

      {/* REKAP PER PEGAWAI (SUMMARY BREAKDOWN) */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">
              <Users size={20} color="#4f46e5" />
              Rekapitulasi Kehadiran per Pegawai
            </div>
            <div className="card-subtitle">
              Agregasi performa kedisiplinan dan jam kerja kumulatif tiap pegawai
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Pegawai</th>
                <th>Jabatan</th>
                <th>Total Hadir</th>
                <th>Tepat Waktu</th>
                <th>Terlambat</th>
                <th>Izin</th>
                <th>Sakit</th>
                <th>Dinas Luar</th>
                <th>Total Jam Kerja</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="9" style={{ textAlign: 'center', padding: '24px' }}>Menghitung data...</td></tr>
              ) : breakdown.length === 0 ? (
                <tr><td colSpan="9" style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>Tidak ada data pada periode ini.</td></tr>
              ) : (
                breakdown.map((b) => (
                  <tr key={b.pegawai_id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{b.nama}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>NIP: {b.nip}</div>
                    </td>
                    <td>{b.jabatan}</td>
                    <td style={{ fontWeight: 700, color: '#10b981' }}>{b.hadir}</td>
                    <td><span className="badge badge-success">{b.tepat_waktu}</span></td>
                    <td><span className={`badge ${b.terlambat > 0 ? 'badge-danger' : 'badge-default'}`}>{b.terlambat}</span></td>
                    <td><span className="badge badge-info">{b.izin}</span></td>
                    <td><span className="badge badge-warning">{b.sakit}</span></td>
                    <td><span className="badge badge-purple">{b.dinas_luar}</span></td>
                    <td style={{ fontWeight: 700, color: '#4f46e5' }}>
                      {Math.floor(b.durasi_menit / 60)}j {b.durasi_menit % 60}m
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL LOG TRANSAKSI ABSENSI */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">
              <Clock size={20} color="#4f46e5" />
              Rincian Log Transaksi Presensi
            </div>
            <div className="card-subtitle">
              Detail waktu masuk, pulang, status keterlambatan, dan durasi harian
            </div>
          </div>
          <span className="badge badge-default">{records.length} Catatan</span>
        </div>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Nama Pegawai</th>
                <th>Jam Masuk</th>
                <th>Jam Pulang</th>
                <th>Status</th>
                <th>Durasi</th>
                <th>Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '24px' }}>Memuat log...</td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>Tidak ada log transaksi absensi.</td></tr>
              ) : (
                records.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 600 }}>{r.tanggal}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{r.nama}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{r.jabatan}</div>
                    </td>
                    <td style={{ color: '#10b981', fontWeight: 600 }}>{r.jam_masuk || '-'}</td>
                    <td style={{ color: '#4f46e5', fontWeight: 600 }}>{r.jam_pulang || '-'}</td>
                    <td>
                      <span className={`badge ${r.status === 'Tepat waktu' ? 'badge-success' : 'badge-danger'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td>
                      {r.durasi_kerja_menit > 0
                        ? `${Math.floor(r.durasi_kerja_menit / 60)}j ${r.durasi_kerja_menit % 60}m`
                        : '-'}
                    </td>
                    <td style={{ color: '#64748b', fontSize: '0.8125rem' }}>{r.keterangan || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

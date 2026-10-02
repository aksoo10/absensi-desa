import React, { useState, useEffect } from 'react';
import { dashboardApi, leaveApi } from '../../api';
import {
  Users,
  UserCheck,
  AlertTriangle,
  UserX,
  FileClock,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Calendar,
  Eye,
  Check,
  X
} from 'lucide-react';

export default function AdminDashboard({ onNavigateTab }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [quickNote, setQuickNote] = useState('');
  const [selectedReq, setSelectedReq] = useState(null);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await dashboardApi.getAdminDashboard();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Error fetching admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleQuickAction = async (id, status) => {
    try {
      setProcessingId(id);
      await leaveApi.processRequest(id, status, quickNote || `Diproses cepat oleh Admin: ${status}`);
      setSelectedReq(null);
      setQuickNote('');
      await loadDashboard();
    } catch (err) {
      alert(err.message || 'Gagal memproses pengajuan.');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading && !data) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
        <Clock size={36} className="animate-spin" style={{ margin: '0 auto 12px auto', color: '#4f46e5' }} />
        <div>Memuat ringkasan sistem presensi...</div>
      </div>
    );
  }

  const chart = data?.chart_7_days || [];
  // Calculate max for chart scaling
  const maxChartVal = Math.max(...chart.map(c => Math.max(c.hadir, c.terlambat, c.izin_sakit, 5)), 5);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 5 KEY STAT CARDS ROW */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '16px'
      }}>
        {/* Total Pegawai Aktif */}
        <div className="card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#64748b' }}>Total Pegawai Aktif</span>
            <div style={{ background: '#eef2ff', color: '#4f46e5', padding: '8px', borderRadius: '10px' }}>
              <Users size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>
            {data?.total_pegawai || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
            Terdaftar di sistem
          </div>
        </div>

        {/* Hadir Hari Ini */}
        <div className="card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#64748b' }}>Hadir Hari Ini</span>
            <div style={{ background: '#ecfdf5', color: '#10b981', padding: '8px', borderRadius: '10px' }}>
              <UserCheck size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981' }}>
            {data?.hadir_hari_ini || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '4px', fontWeight: 600 }}>
            {data?.tepat_waktu_hari_ini || 0} Tepat Waktu
          </div>
        </div>

        {/* Terlambat Hari Ini */}
        <div className="card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#64748b' }}>Terlambat Hari Ini</span>
            <div style={{ background: '#fffbeb', color: '#f59e0b', padding: '8px', borderRadius: '10px' }}>
              <AlertTriangle size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b' }}>
            {data?.terlambat_hari_ini || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#b45309', marginTop: '4px' }}>
            Melebihi toleransi jadwal
          </div>
        </div>

        {/* Tidak Hadir Hari Ini */}
        <div className="card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#64748b' }}>Tidak Hadir (Alpa/Cuti)</span>
            <div style={{ background: '#fef2f2', color: '#ef4444', padding: '8px', borderRadius: '10px' }}>
              <UserX size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ef4444' }}>
            {data?.tidak_hadir_hari_ini || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
            {data?.izin_sakit_hari_ini || 0} Sedang Izin/Sakit
          </div>
        </div>

        {/* Pengajuan Pending */}
        <div className="card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#64748b' }}>Pengajuan Pending</span>
            <div style={{ background: '#f5f3ff', color: '#8b5cf6', padding: '8px', borderRadius: '10px' }}>
              <FileClock size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#8b5cf6' }}>
            {data?.pengajuan_pending || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#7c3aed', marginTop: '4px', fontWeight: 600 }}>
            Butuh verifikasi admin
          </div>
        </div>
      </div>

      {/* 7-DAY ATTENDANCE INTERACTIVE CHART CARD */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">
              <TrendingUp size={20} color="#4f46e5" />
              Grafik Absensi 7 Hari Terakhir
            </div>
            <div className="card-subtitle">Perbandingan kehadiran tepat waktu, terlambat, dan izin/sakit</div>
          </div>
          <div style={{ display: 'flex', gap: '16px', fontSize: '0.75rem', fontWeight: 600 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#10b981' }}></span> Tepat Waktu
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#f59e0b' }}></span> Terlambat
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#8b5cf6' }}></span> Izin / Sakit
            </span>
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${chart.length}, 1fr)`,
          gap: '12px',
          alignItems: 'flex-end',
          height: '240px',
          padding: '20px 10px 10px 10px',
          borderBottom: '1px solid #e2e8f0',
          position: 'relative'
        }}>
          {chart.map((day, idx) => {
            const tepatHeight = (day.tepat_waktu / maxChartVal) * 180;
            const lateHeight = (day.terlambat / maxChartVal) * 180;
            const leaveHeight = (day.izin_sakit / maxChartVal) * 180;

            return (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end', width: '100%', justifyContent: 'center' }}>
                  {/* Bar Tepat Waktu */}
                  <div
                    title={`Tepat Waktu: ${day.tepat_waktu}`}
                    style={{
                      width: '18px',
                      height: `${Math.max(4, tepatHeight)}px`,
                      background: 'linear-gradient(180deg, #10b981 0%, #059669 100%)',
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.4s ease'
                    }}
                  ></div>
                  {/* Bar Terlambat */}
                  <div
                    title={`Terlambat: ${day.terlambat}`}
                    style={{
                      width: '18px',
                      height: `${Math.max(4, lateHeight)}px`,
                      background: 'linear-gradient(180deg, #f59e0b 0%, #d97706 100%)',
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.4s ease'
                    }}
                  ></div>
                  {/* Bar Izin / Sakit */}
                  <div
                    title={`Izin/Sakit: ${day.izin_sakit}`}
                    style={{
                      width: '18px',
                      height: `${Math.max(4, leaveHeight)}px`,
                      background: 'linear-gradient(180deg, #8b5cf6 0%, #6d28d9 100%)',
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.4s ease'
                    }}
                  ></div>
                </div>
                <div style={{ marginTop: '10px', fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>
                  {day.dayLabel}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* TWO SECTIONS: TABEL ABSENSI HARI INI & PENGAJUAN PENDING */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        {/* Live Absensi Hari Ini */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <Clock size={20} color="#10b981" />
                Presensi Hari Ini (Realtime)
              </div>
              <div className="card-subtitle">{data?.today_attendances?.length || 0} pegawai telah absen masuk</div>
            </div>
            {onNavigateTab && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => onNavigateTab('laporan')}
              >
                Lihat Laporan
              </button>
            )}
          </div>

          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Nama Pegawai</th>
                  <th>Jam Masuk</th>
                  <th>Jam Pulang</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data?.today_attendances?.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                      Belum ada pegawai yang melakukan absensi hari ini.
                    </td>
                  </tr>
                ) : (
                  data?.today_attendances?.map((att) => (
                    <tr key={att.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{att.nama}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{att.jabatan}</div>
                      </td>
                      <td style={{ color: '#10b981', fontWeight: 600 }}>{att.jam_masuk}</td>
                      <td style={{ color: '#4f46e5', fontWeight: 600 }}>{att.jam_pulang || '-'}</td>
                      <td>
                        <span className={`badge ${att.status === 'Tepat waktu' ? 'badge-success' : 'badge-danger'}`}>
                          {att.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pengajuan Menunggu Persetujuan */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <FileClock size={20} color="#8b5cf6" />
                Pengajuan Perlu Validasi
              </div>
              <div className="card-subtitle">{data?.pending_requests?.length || 0} pengajuan menunggu tindakan</div>
            </div>
            {onNavigateTab && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => onNavigateTab('pengajuan')}
              >
                Kelola Semua
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data?.pending_requests?.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                <CheckCircle2 size={36} color="#10b981" style={{ margin: '0 auto 10px auto', opacity: 0.6 }} />
                <div>Semua pengajuan telah diproses!</div>
              </div>
            ) : (
              data?.pending_requests?.map((req) => (
                <div
                  key={req.id}
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{req.nama}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      <span className="badge badge-purple" style={{ marginRight: '6px' }}>{req.jenis}</span>
                      {req.tanggal_mulai} s/d {req.tanggal_selesai}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: '#334155', marginTop: '4px' }}>
                      {req.keterangan}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      className="btn btn-success btn-sm"
                      title="Setujui Pengajuan"
                      disabled={processingId === req.id}
                      onClick={() => handleQuickAction(req.id, 'Disetujui')}
                    >
                      <Check size={14} /> Setujui
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      title="Tolak Pengajuan"
                      disabled={processingId === req.id}
                      onClick={() => handleQuickAction(req.id, 'Ditolak')}
                    >
                      <X size={14} /> Tolak
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

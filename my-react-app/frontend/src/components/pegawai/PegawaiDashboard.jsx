import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { attendanceApi } from '../../api';
import AbsensiSection from './AbsensiSection';
import PengajuanSection from './PengajuanSection';
import {
  User,
  Clock,
  CalendarCheck,
  AlertTriangle,
  FileText,
  Activity,
  Briefcase,
  Plane,
  History,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

export default function PegawaiDashboard({
  activeTab: externalTab,
  setActiveTab: externalSetTab,
  onStatsLoaded
}) {
  const { user } = useAuth();
  const [internalTab, setInternalTab] = useState('dashboard'); // 'dashboard' | 'absensi' | 'pengajuan' | 'riwayat'
  const activeTab = externalTab !== undefined ? externalTab : internalTab;
  const setActiveTab = externalSetTab || setInternalTab;
  const [stats, setStats] = useState(null);
  const [todayData, setTodayData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const pegawai = user?.pegawai || {};

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, todayRes, histRes] = await Promise.all([
        attendanceApi.getStats(),
        attendanceApi.getToday(),
        attendanceApi.getHistory()
      ]);

      if (statsRes.success) {
        setStats(statsRes.stats);
        if (onStatsLoaded) onStatsLoaded(statsRes.stats);
      }
      if (todayRes.success) setTodayData(todayRes);
      if (histRes.success) setHistory(histRes.history);
    } catch (err) {
      console.error('Error fetching pegawai dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const schedule = todayData?.schedule;
  const todayAtt = todayData?.attendance;

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
      {/* Top Banner: Employee Profile Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
        borderRadius: '20px',
        padding: '30px',
        color: 'white',
        marginBottom: '24px',
        boxShadow: '0 10px 25px -5px rgba(49, 46, 129, 0.3)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            fontSize: '1.75rem',
            fontWeight: 800
          }}>
            {user?.name?.charAt(0) || 'P'}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{pegawai.nama || user?.name}</h2>
              <span style={{
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: 600
              }}>
                {pegawai.status_pegawai || 'Tetap'}
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '6px', fontSize: '0.875rem', opacity: 0.9 }}>
              <span>💼 {pegawai.jabatan || 'Pegawai'}</span>
              <span>🆔 NIP: <strong>{pegawai.nip || '-'}</strong></span>
              <span>💳 NIK: <strong>{pegawai.nik || '-'}</strong></span>
            </div>
          </div>
        </div>

        {/* Quick check-in shortcut */}
        <div>
          <button
            type="button"
            className="btn btn-success btn-lg"
            onClick={() => setActiveTab('absensi')}
            style={{ boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)' }}
          >
            <Clock size={20} />
            Buka Panel Presensi
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '1px solid #e2e8f0',
        marginBottom: '24px',
        overflowX: 'auto',
        paddingBottom: '8px'
      }}>
        {[
          { id: 'dashboard', label: 'Dashboard & Ringkasan', icon: Layers },
          { id: 'absensi', label: 'Absensi Masuk / Pulang', icon: Clock },
          { id: 'pengajuan', label: 'Pengajuan Izin / Sakit / Dinas', icon: FileText },
          { id: 'riwayat', label: 'Riwayat Absensi Lengkap', icon: History }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '10px',
                border: 'none',
                background: isActive ? '#4f46e5' : '#ffffff',
                color: isActive ? '#ffffff' : '#64748b',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: isActive ? '0 4px 12px rgba(79, 70, 229, 0.25)' : '0 1px 3px rgba(0,0,0,0.05)',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB: DASHBOARD OVERVIEW */}
      {activeTab === 'dashboard' && (
        <div className="animate-fade-in">
          {/* STAT CARDS ROW */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
            marginBottom: '24px'
          }}>
            {/* Jumlah Kehadiran */}
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#64748b' }}>Jumlah Kehadiran</span>
                <div style={{ background: '#ecfdf5', color: '#10b981', padding: '8px', borderRadius: '10px' }}>
                  <CalendarCheck size={18} />
                </div>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
                {stats?.total_kehadiran || 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '4px', fontWeight: 600 }}>
                {stats?.total_tepat_waktu || 0} Tepat Waktu
              </div>
            </div>

            {/* Keterlambatan */}
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#64748b' }}>Keterlambatan</span>
                <div style={{ background: '#fef2f2', color: '#ef4444', padding: '8px', borderRadius: '10px' }}>
                  <AlertTriangle size={18} />
                </div>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ef4444' }}>
                {stats?.total_terlambat || 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                Total kali terlambat
              </div>
            </div>

            {/* Izin */}
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#64748b' }}>Izin Disetujui</span>
                <div style={{ background: '#f0f9ff', color: '#0284c7', padding: '8px', borderRadius: '10px' }}>
                  <FileText size={18} />
                </div>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0284c7' }}>
                {stats?.total_izin || 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                Izin resmi disetujui
              </div>
            </div>

            {/* Sakit */}
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#64748b' }}>Sakit</span>
                <div style={{ background: '#fff1f2', color: '#e11d48', padding: '8px', borderRadius: '10px' }}>
                  <Activity size={18} />
                </div>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#e11d48' }}>
                {stats?.total_sakit || 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                Surat dokter disetujui
              </div>
            </div>

            {/* Dinas Luar */}
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#64748b' }}>Dinas Luar</span>
                <div style={{ background: '#f5f3ff', color: '#7c3aed', padding: '8px', borderRadius: '10px' }}>
                  <Plane size={18} />
                </div>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#7c3aed' }}>
                {stats?.total_dinas_luar || 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                Tugas luar kantor
              </div>
            </div>

            {/* Pengajuan Pending */}
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#64748b' }}>Pengajuan Pending</span>
                <div style={{ background: '#fffbeb', color: '#d97706', padding: '8px', borderRadius: '10px' }}>
                  <Clock size={18} />
                </div>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#d97706' }}>
                {stats?.pengajuan_pending || 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                Menunggu admin
              </div>
            </div>
          </div>

          {/* TWO COLUMN ROW: Status Hari Ini & Jadwal Kerja */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '24px' }}>
            {/* Status Absensi Hari Ini */}
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">
                    <Clock size={20} color="#4f46e5" />
                    Status Absensi Hari Ini
                  </div>
                  <div className="card-subtitle">
                    {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>
                {todayAtt ? (
                  <span className={`badge ${todayAtt.status === 'Tepat waktu' ? 'badge-success' : 'badge-danger'}`}>
                    {todayAtt.status}
                  </span>
                ) : (
                  <span className="badge badge-warning">Belum Absen</span>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px',
                  background: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0'
                }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>JAM MASUK</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: todayAtt?.jam_masuk ? '#10b981' : '#94a3b8' }}>
                      {todayAtt?.jam_masuk || '--:--:--'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>JAM PULANG</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: todayAtt?.jam_pulang ? '#4f46e5' : '#94a3b8' }}>
                      {todayAtt?.jam_pulang || '--:--:--'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Durasi Kerja Hari Ini:</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>
                    {todayAtt?.durasi_kerja_menit ? `${Math.floor(todayAtt.durasi_kerja_menit / 60)} jam ${todayAtt.durasi_kerja_menit % 60} menit` : '-'}
                  </span>
                </div>

                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={() => setActiveTab('absensi')}
                  style={{ width: '100%', marginTop: '6px' }}
                >
                  Buka Form Absensi Masuk / Pulang
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Jadwal Kerja */}
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">
                    <Calendar size={20} color="#4f46e5" />
                    Jadwal Kerja Anda
                  </div>
                  <div className="card-subtitle">{schedule?.nama_jadwal || 'Jadwal Reguler'}</div>
                </div>
                <span className="badge badge-purple">{schedule?.hari_kerja || 'Senin - Jumat'}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Waktu Jam Masuk:</span>
                  <span style={{ fontWeight: 700, color: '#10b981' }}>{schedule?.jam_masuk || '08:00:00'} WIB</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Toleransi Keterlambatan:</span>
                  <span style={{ fontWeight: 700, color: '#f59e0b' }}>+{schedule?.toleransi_menit || 15} Menit</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Waktu Jam Pulang:</span>
                  <span style={{ fontWeight: 700, color: '#4f46e5' }}>{schedule?.jam_pulang || '17:00:00'} WIB</span>
                </div>
                <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '6px', lineHeight: 1.5 }}>
                  * Kehadiran dicatat secara otomatis oleh server. Pastikan melakukan absensi masuk saat tiba di kantor dan absen pulang sebelum meninggalkan tempat kerja.
                </div>
              </div>
            </div>
          </div>

          {/* RIWAYAT ABSENSI TERBARU */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">
                  <History size={20} color="#4f46e5" />
                  Riwayat Absensi Terbaru
                </div>
                <div className="card-subtitle">Daftar kehadiran 10 hari kerja terakhir</div>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setActiveTab('riwayat')}
              >
                Lihat Semua Riwayat
              </button>
            </div>

            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Jam Masuk</th>
                    <th>Jam Pulang</th>
                    <th>Status</th>
                    <th>Durasi Kerja</th>
                    <th>Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {history.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                        Belum ada riwayat absensi.
                      </td>
                    </tr>
                  ) : (
                    history.slice(0, 7).map((row) => (
                      <tr key={row.id}>
                        <td style={{ fontWeight: 600 }}>{row.tanggal}</td>
                        <td style={{ color: '#10b981', fontWeight: 600 }}>{row.jam_masuk || '-'}</td>
                        <td style={{ color: '#4f46e5', fontWeight: 600 }}>{row.jam_pulang || '-'}</td>
                        <td>
                          <span className={`badge ${row.status === 'Tepat waktu' ? 'badge-success' : 'badge-danger'}`}>
                            {row.status}
                          </span>
                        </td>
                        <td>
                          {row.durasi_kerja_menit > 0
                            ? `${Math.floor(row.durasi_kerja_menit / 60)}j ${row.durasi_kerja_menit % 60}m`
                            : '-'}
                        </td>
                        <td style={{ color: '#64748b' }}>{row.keterangan || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: ABSENSI MASUK / PULANG */}
      {activeTab === 'absensi' && (
        <AbsensiSection onAttendanceUpdated={loadData} />
      )}

      {/* TAB: PENGAJUAN IZIN / SAKIT / DINAS */}
      {activeTab === 'pengajuan' && (
        <PengajuanSection onSubmitted={loadData} />
      )}

      {/* TAB: RIWAYAT LENGKAP */}
      {activeTab === 'riwayat' && (
        <div className="card animate-fade-in">
          <div className="card-header">
            <div>
              <div className="card-title">
                <History size={20} color="#4f46e5" />
                Semua Riwayat Absensi
              </div>
              <div className="card-subtitle">Log lengkap catatan kehadiran dan durasi kerja Anda</div>
            </div>
            <span className="badge badge-default">{history.length} Catatan</span>
          </div>

          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Jam Masuk</th>
                  <th>Jam Pulang</th>
                  <th>Status</th>
                  <th>Durasi Kerja</th>
                  <th>Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                      Belum ada catatan absensi.
                    </td>
                  </tr>
                ) : (
                  history.map((row) => (
                    <tr key={row.id}>
                      <td style={{ fontWeight: 600 }}>{row.tanggal}</td>
                      <td style={{ color: '#10b981', fontWeight: 600 }}>{row.jam_masuk || '-'}</td>
                      <td style={{ color: '#4f46e5', fontWeight: 600 }}>{row.jam_pulang || '-'}</td>
                      <td>
                        <span className={`badge ${row.status === 'Tepat waktu' ? 'badge-success' : 'badge-danger'}`}>
                          {row.status}
                        </span>
                      </td>
                      <td>
                        {row.durasi_kerja_menit > 0
                          ? `${Math.floor(row.durasi_kerja_menit / 60)} jam ${row.durasi_kerja_menit % 60} menit`
                          : '-'}
                      </td>
                      <td style={{ color: '#64748b' }}>{row.keterangan || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

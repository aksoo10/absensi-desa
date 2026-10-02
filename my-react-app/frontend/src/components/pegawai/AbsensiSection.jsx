import React, { useState, useEffect } from 'react';
import { attendanceApi } from '../../api';
import { Clock, CheckCircle2, AlertCircle, ArrowRightCircle, LogOut, Calendar, ShieldAlert } from 'lucide-react';

export default function AbsensiSection({ onAttendanceUpdated }) {
  const [time, setTime] = useState(new Date());
  const [todayData, setTodayData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [keterangan, setKeterangan] = useState('');

  // Live digital clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadTodayStatus = async () => {
    try {
      setLoading(true);
      const res = await attendanceApi.getToday();
      if (res.success) {
        setTodayData(res);
      }
    } catch (err) {
      console.error('Error loading today attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTodayStatus();
  }, []);

  // Alur 3: Absensi Masuk
  const handleCheckIn = async () => {
    setActionLoading(true);
    setMessage(null);
    try {
      const res = await attendanceApi.checkIn(keterangan);
      setMessage({ type: 'success', text: res.message });
      setKeterangan('');
      await loadTodayStatus();
      if (onAttendanceUpdated) onAttendanceUpdated();
    } catch (err) {
      setMessage({ type: 'danger', text: err.message || 'Gagal melakukan absensi masuk.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Alur 4: Absensi Pulang
  const handleCheckOut = async () => {
    setActionLoading(true);
    setMessage(null);
    try {
      const res = await attendanceApi.checkOut();
      setMessage({ type: 'success', text: res.message });
      await loadTodayStatus();
      if (onAttendanceUpdated) onAttendanceUpdated();
    } catch (err) {
      setMessage({ type: 'danger', text: err.message || 'Gagal melakukan absensi pulang.' });
    } finally {
      setActionLoading(false);
    }
  };

  const schedule = todayData?.schedule;
  const attendance = todayData?.attendance;
  const hasCheckedIn = !!attendance;
  const hasCheckedOut = !!attendance?.jam_pulang;

  const formattedDate = time.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const formattedTime = time.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return (
    <div className="animate-fade-in">
      {/* Alert Notification */}
      {message && (
        <div className={`alert alert-${message.type}`} style={{ marginBottom: '20px' }}>
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <div style={{ flex: 1, fontWeight: 500 }}>{message.text}</div>
          <button 
            type="button" 
            onClick={() => setMessage(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: 'inherit' }}
          >
            ✕
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Real-time Clock & Action Card */}
        <div className="card" style={{ textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '180px',
            height: '180px',
            background: 'radial-gradient(circle, rgba(79,70,229,0.08) 0%, transparent 70%)',
            borderRadius: '50%'
          }}></div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.875rem', marginBottom: '8px' }}>
            <Calendar size={16} />
            <span>{formattedDate}</span>
          </div>

          <div style={{
            fontSize: '3rem',
            fontWeight: 800,
            letterSpacing: '0.04em',
            color: '#0f172a',
            fontVariantNumeric: 'tabular-nums',
            margin: '8px 0 16px 0',
            fontFamily: 'monospace'
          }}>
            {formattedTime}
          </div>

          {/* Current Status Pill */}
          <div style={{ marginBottom: '24px' }}>
            {!hasCheckedIn ? (
              <span className="badge badge-warning" style={{ padding: '8px 16px', fontSize: '0.875rem' }}>
                <Clock size={16} /> Belum Melakukan Absensi Hari Ini
              </span>
            ) : !hasCheckedOut ? (
              <span className={`badge ${attendance.status === 'Tepat waktu' ? 'badge-success' : 'badge-danger'}`} style={{ padding: '8px 16px', fontSize: '0.875rem' }}>
                <CheckCircle2 size={16} /> Sudah Masuk ({attendance.status}) pukul {attendance.jam_masuk}
              </span>
            ) : (
              <span className="badge badge-info" style={{ padding: '8px 16px', fontSize: '0.875rem' }}>
                <CheckCircle2 size={16} /> Absensi Lengkap (Pulang: {attendance.jam_pulang})
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {/* Tombol Absen Masuk */}
            <button
              type="button"
              className="btn btn-success btn-lg"
              onClick={handleCheckIn}
              disabled={hasCheckedIn || actionLoading}
              style={{ minWidth: '170px' }}
            >
              <ArrowRightCircle size={20} />
              {hasCheckedIn ? 'Sudah Absen Masuk' : 'Absen Masuk'}
            </button>

            {/* Tombol Absen Pulang */}
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={handleCheckOut}
              disabled={!hasCheckedIn || hasCheckedOut || actionLoading}
              style={{ minWidth: '170px' }}
            >
              <LogOut size={20} />
              {hasCheckedOut ? 'Sudah Absen Pulang' : 'Absen Pulang'}
            </button>
          </div>

          {!hasCheckedIn && (
            <div style={{ marginTop: '16px' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Catatan absensi masuk (opsional)..."
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                style={{ maxWidth: '360px', margin: '0 auto', fontSize: '0.8125rem' }}
              />
            </div>
          )}
        </div>

        {/* Schedule & Rules Card */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <Clock size={20} color="#4f46e5" />
                Jadwal Kerja Aktif
              </div>
              <div className="card-subtitle">Ketentuan jam kerja dan batas toleransi sistem</div>
            </div>
            {schedule && (
              <span className="badge badge-purple">
                {schedule.nama_jadwal}
              </span>
            )}
          </div>

          {schedule ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Hari Kerja:</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{schedule.hari_kerja}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Jam Masuk Kantor:</span>
                <span style={{ fontWeight: 700, color: '#10b981' }}>{schedule.jam_masuk} WIB</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Toleransi Keterlambatan:</span>
                <span style={{ fontWeight: 700, color: '#f59e0b' }}>+{schedule.toleransi_menit} Menit</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Jam Pulang Kantor:</span>
                <span style={{ fontWeight: 700, color: '#4f46e5' }}>{schedule.jam_pulang} WIB</span>
              </div>

              <div style={{ fontSize: '0.75rem', color: '#64748b', background: '#eef2ff', padding: '10px 12px', borderRadius: '8px', borderLeft: '4px solid #4f46e5' }}>
                💡 <strong>Aturan Otomatis:</strong> Absen sebelum toleransi dinilai <strong>Tepat waktu</strong>. Lewat dari toleransi jam masuk secara otomatis tercatat <strong>Terlambat</strong>. Absen pulang hanya dapat dilakukan jika Anda sudah melakukan absen masuk.
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
              Memuat data jadwal...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, UserPlus, Lock, Mail, User, ShieldCheck, Briefcase, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

export default function LoginView() {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Login form state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  // Register form state
  const [regData, setRegData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    nip: '',
    nik: '',
    jabatan: '',
    status_pegawai: 'Tetap',
    no_hp: '',
    alamat: ''
  });

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await login(identifier, password);
    } catch (err) {
      setError(err.message || 'Login gagal. Periksa kembali email/username dan kata sandi Anda.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await register(regData);
      setSuccess(res.message || 'Registrasi berhasil! Silakan masuk dengan akun Anda.');
      setIsRegister(false);
      setIdentifier(regData.email);
      setPassword(regData.password);
    } catch (err) {
      setError(err.message || 'Gagal mendaftar. Silakan periksa kembali formulir.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoAccount = (u, p) => {
    setIdentifier(u);
    setPassword(p);
    setError('');
    setSuccess('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 10% 20%, #1e1b4b 0%, #0f172a 100%)',
      padding: '24px'
    }}>
      <div style={{
        maxWidth: isRegister ? '680px' : '440px',
        width: '100%',
        background: '#ffffff',
        borderRadius: '20px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
        padding: '36px',
        position: 'relative',
        transition: 'all 0.3s ease'
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 10px 20px rgba(79, 70, 229, 0.35)',
            marginBottom: '14px'
          }}>
            <ShieldCheck size={32} />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Presensi<span style={{ color: '#4f46e5' }}>Go</span>
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '4px' }}>
            Sistem Manajemen Presensi & Pengajuan Pegawai
          </p>
        </div>

        {/* Tab Selector */}
        <div style={{
          display: 'flex',
          background: '#f1f5f9',
          borderRadius: '12px',
          padding: '4px',
          marginBottom: '24px'
        }}>
          <button
            type="button"
            onClick={() => { setIsRegister(false); setError(''); setSuccess(''); }}
            style={{
              flex: 1,
              padding: '10px',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              background: !isRegister ? '#ffffff' : 'transparent',
              color: !isRegister ? '#4f46e5' : '#64748b',
              boxShadow: !isRegister ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            Masuk (Login)
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setError(''); setSuccess(''); }}
            style={{
              flex: 1,
              padding: '10px',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              background: isRegister ? '#ffffff' : 'transparent',
              color: isRegister ? '#4f46e5' : '#64748b',
              boxShadow: isRegister ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            Daftar Pegawai
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="alert alert-danger" style={{ marginBottom: '20px' }}>
            <AlertCircle size={20} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success" style={{ marginBottom: '20px' }}>
            <CheckCircle2 size={20} style={{ flexShrink: 0 }} />
            <span>{success}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        {!isRegister ? (
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label className="form-label">Email atau Username</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                <input
                  type="text"
                  className="form-control"
                  style={{ paddingLeft: '40px' }}
                  placeholder="admin atau nama@perusahaan.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">Kata Sandi</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                <input
                  type="password"
                  className="form-control"
                  style={{ paddingLeft: '40px' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ width: '100%', marginBottom: '24px' }}
            >
              <LogIn size={18} />
              {loading ? 'Memvalidasi akun...' : 'Masuk ke Aplikasi'}
            </button>

            {/* Quick Demo Access Bar */}
            <div style={{
              background: '#f8fafc',
              border: '1px dashed #cbd5e1',
              borderRadius: '12px',
              padding: '16px',
              marginTop: '12px'
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                ⚡ Akun Demo Siap Pakai:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setDemoAccount('admin', 'password123')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                    color: '#1e293b'
                  }}
                >
                  <span style={{ fontWeight: 600 }}>👑 Admin HRD</span>
                  <code style={{ fontSize: '0.75rem', color: '#6366f1' }}>admin / password123</code>
                </button>
                <button
                  type="button"
                  onClick={() => setDemoAccount('budi', 'password123')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                    color: '#1e293b'
                  }}
                >
                  <span style={{ fontWeight: 600 }}>👤 Pegawai (Budi Pratama)</span>
                  <code style={{ fontSize: '0.75rem', color: '#10b981' }}>budi / password123</code>
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* REGISTER FORM */
          <form onSubmit={handleRegisterSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Nama Lengkap & Gelar *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Contoh: Rian Anggara, S.Kom"
                  value={regData.name}
                  onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Jabatan / Posisi *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Contoh: Frontend Developer"
                  value={regData.jabatan}
                  onChange={(e) => setRegData({ ...regData, jabatan: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">NIP (Nomor Induk Pegawai) *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="18 digit NIP"
                  value={regData.nip}
                  onChange={(e) => setRegData({ ...regData, nip: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">NIK (Nomor Induk Kependudukan) *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="16 digit NIK"
                  value={regData.nik}
                  onChange={(e) => setRegData({ ...regData, nik: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Status Pegawai *</label>
                <select
                  className="form-control"
                  value={regData.status_pegawai}
                  onChange={(e) => setRegData({ ...regData, status_pegawai: e.target.value })}
                >
                  <option value="Tetap">Pegawai Tetap</option>
                  <option value="Kontrak">Pegawai Kontrak</option>
                  <option value="Magang">Magang / Intern</option>
                  <option value="Honorer">Honorer</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">No. Telepon / WhatsApp</label>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="08xxxxxxxxxx"
                  value={regData.no_hp}
                  onChange={(e) => setRegData({ ...regData, no_hp: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Perusahaan *</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="nama@perusahaan.com"
                  value={regData.email}
                  onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Kata Sandi Akun *</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Minimal 6 karakter"
                  value={regData.password}
                  onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '4px' }}>
              <label className="form-label">Alamat Domisili</label>
              <textarea
                className="form-control"
                rows="2"
                placeholder="Alamat lengkap tempat tinggal"
                value={regData.alamat}
                onChange={(e) => setRegData({ ...regData, alamat: e.target.value })}
              ></textarea>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ width: '100%', marginTop: '8px' }}
            >
              <UserPlus size={18} />
              {loading ? 'Mendaftarkan pegawai...' : 'Kirim Pendaftaran'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

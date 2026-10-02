import React, { useState, useEffect } from 'react';
import { leaveApi } from '../../api';
import { FileText, Send, Upload, Clock, CheckCircle2, XCircle, AlertCircle, FileCheck, Paperclip } from 'lucide-react';

export default function PengajuanSection({ onSubmitted }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  // Form State
  const [jenis, setJenis] = useState('Izin');
  const [tanggalMulai, setTanggalMulai] = useState('');
  const [tanggalSelesai, setTanggalSelesai] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [file, setFile] = useState(null);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const res = await leaveApi.getMyRequests();
      if (res.success) {
        setRequests(res.requests);
      }
    } catch (err) {
      console.error('Error loading my requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
    // Default today for start and end date
    const today = new Date().toISOString().split('T')[0];
    setTanggalMulai(today);
    setTanggalSelesai(today);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('jenis', jenis);
      formData.append('tanggal_mulai', tanggalMulai);
      formData.append('tanggal_selesai', tanggalSelesai);
      formData.append('keterangan', keterangan);
      if (file) {
        formData.append('dokumen_bukti', file);
      }

      const res = await leaveApi.submitRequest(formData);
      setMessage({ type: 'success', text: res.message });
      setKeterangan('');
      setFile(null);
      // Reset file input
      const fileInput = document.getElementById('dokumen_file_input');
      if (fileInput) fileInput.value = '';

      await loadRequests();
      if (onSubmitted) onSubmitted();
    } catch (err) {
      setMessage({ type: 'danger', text: err.message || 'Gagal mengirim pengajuan.' });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'Pending') {
      return <span className="badge badge-warning"><Clock size={12} /> Pending</span>;
    }
    if (status === 'Disetujui') {
      return <span className="badge badge-success"><CheckCircle2 size={12} /> Disetujui</span>;
    }
    if (status === 'Ditolak') {
      return <span className="badge badge-danger"><XCircle size={12} /> Ditolak</span>;
    }
    return <span className="badge badge-default">{status}</span>;
  };

  const getJenisBadge = (j) => {
    if (j === 'Izin') return <span className="badge badge-info">Izin</span>;
    if (j === 'Sakit') return <span className="badge badge-danger">Sakit</span>;
    return <span className="badge badge-purple">Dinas Luar</span>;
  };

  return (
    <div className="animate-fade-in">
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        {/* Form Pengajuan Card */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <FileText size={20} color="#4f46e5" />
                Formulir Pengajuan
              </div>
              <div className="card-subtitle">Buat pengajuan Izin, Sakit, atau Dinas Luar</div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Jenis Pengajuan *</label>
              <select
                className="form-control"
                value={jenis}
                onChange={(e) => setJenis(e.target.value)}
                required
              >
                <option value="Izin">Izin Tidak Masuk</option>
                <option value="Sakit">Sakit / Surat Dokter</option>
                <option value="Dinas Luar">Dinas Luar Kota / Kantor</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Tanggal Mulai *</label>
                <input
                  type="date"
                  className="form-control"
                  value={tanggalMulai}
                  onChange={(e) => setTanggalMulai(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tanggal Selesai *</label>
                <input
                  type="date"
                  className="form-control"
                  value={tanggalSelesai}
                  onChange={(e) => setTanggalSelesai(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Keterangan / Alasan Lengkap *</label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="Jelaskan secara detail alasan pengajuan Anda..."
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                required
              ></textarea>
            </div>

            <div className="form-group">
              <label className="form-label">Dokumen Bukti Lampiran (Opsional)</label>
              <div style={{
                border: '2px dashed #cbd5e1',
                padding: '14px',
                borderRadius: '10px',
                textAlign: 'center',
                background: '#f8fafc',
                cursor: 'pointer'
              }}>
                <input
                  id="dokumen_file_input"
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                  onChange={(e) => setFile(e.target.files[0])}
                  style={{ display: 'none' }}
                />
                <label htmlFor="dokumen_file_input" style={{ cursor: 'pointer', display: 'block' }}>
                  <Upload size={22} color="#64748b" style={{ margin: '0 auto 6px auto' }} />
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155' }}>
                    {file ? file.name : 'Pilih file dokumen bukti (PDF, JPG, PNG)'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    Maksimal 5MB (Surat dokter, surat tugas, bukti undangan, dll)
                  </div>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{ width: '100%', marginTop: '6px' }}
            >
              <Send size={16} />
              {submitting ? 'Mengirim Pengajuan...' : 'Kirim Pengajuan'}
            </button>
          </form>
        </div>

        {/* Riwayat Pengajuan Card */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <FileCheck size={20} color="#4f46e5" />
                Riwayat Pengajuan Anda
              </div>
              <div className="card-subtitle">Status persetujuan pengajuan oleh Admin</div>
            </div>
            <span className="badge badge-default">{requests.length} Total</span>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>Memuat riwayat...</div>
          ) : requests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
              <FileText size={36} style={{ margin: '0 auto 10px auto', opacity: 0.4 }} />
              <div>Belum ada riwayat pengajuan.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '460px', overflowY: 'auto' }}>
              {requests.map((req) => (
                <div
                  key={req.id}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    background: '#ffffff',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {getJenisBadge(req.jenis)}
                      <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                        {req.tanggal_mulai} s/d {req.tanggal_selesai}
                      </span>
                    </div>
                    {getStatusBadge(req.status)}
                  </div>

                  <div style={{ fontSize: '0.875rem', color: '#1e293b', marginBottom: '6px', fontWeight: 500 }}>
                    {req.keterangan}
                  </div>

                  {req.dokumen_bukti && (
                    <div style={{ marginBottom: '6px' }}>
                      <a
                        href={`/uploads/${req.dokumen_bukti}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '0.75rem',
                          color: '#4f46e5',
                          textDecoration: 'none',
                          fontWeight: 600
                        }}
                      >
                        <Paperclip size={14} /> Lihat Lampiran Bukti
                      </a>
                    </div>
                  )}

                  {req.catatan_admin && (
                    <div style={{
                      fontSize: '0.75rem',
                      background: '#f8fafc',
                      borderLeft: '3px solid #64748b',
                      padding: '6px 10px',
                      borderRadius: '4px',
                      color: '#475569',
                      marginTop: '6px'
                    }}>
                      <strong>Catatan Admin:</strong> {req.catatan_admin}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

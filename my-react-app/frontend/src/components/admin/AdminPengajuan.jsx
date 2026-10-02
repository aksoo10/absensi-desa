import React, { useState, useEffect } from 'react';
import { leaveApi } from '../../api';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Paperclip,
  Search,
  Filter,
  Check,
  X,
  Eye,
  AlertCircle
} from 'lucide-react';

export default function AdminPengajuan() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [jenisFilter, setJenisFilter] = useState('Semua');
  const [selectedReq, setSelectedReq] = useState(null); // Modal detail state
  const [catatanAdmin, setCatatanAdmin] = useState('');
  const [processing, setProcessing] = useState(false);
  const [notification, setNotification] = useState(null);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const res = await leaveApi.getAllRequests({
        status: statusFilter,
        jenis: jenisFilter
      });
      if (res.success) {
        setRequests(res.requests);
      }
    } catch (err) {
      console.error('Error fetching admin requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [statusFilter, jenisFilter]);

  const handleProcess = async (status) => {
    if (!selectedReq) return;
    setProcessing(true);
    try {
      const res = await leaveApi.processRequest(selectedReq.id, status, catatanAdmin);
      setNotification({ type: 'success', text: res.message });
      setSelectedReq(null);
      setCatatanAdmin('');
      await loadRequests();
    } catch (err) {
      setNotification({ type: 'danger', text: err.message || 'Gagal memproses pengajuan.' });
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'Pending') return <span className="badge badge-warning"><Clock size={12} /> Pending</span>;
    if (status === 'Disetujui') return <span className="badge badge-success"><CheckCircle2 size={12} /> Disetujui</span>;
    if (status === 'Ditolak') return <span className="badge badge-danger"><XCircle size={12} /> Ditolak</span>;
    return <span className="badge badge-default">{status}</span>;
  };

  const getJenisBadge = (j) => {
    if (j === 'Izin') return <span className="badge badge-info">Izin</span>;
    if (j === 'Sakit') return <span className="badge badge-danger">Sakit</span>;
    return <span className="badge badge-purple">Dinas Luar</span>;
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Page Title & Filters */}
      <div className="card">
        <div className="card-header" style={{ marginBottom: '16px' }}>
          <div>
            <div className="card-title">
              <FileText size={22} color="#4f46e5" />
              Kelola Pengajuan Pegawai (Izin / Sakit / Dinas Luar)
            </div>
            <div className="card-subtitle">
              Pemeriksaan dokumen, validasi, dan pemberian persetujuan/penolakan
            </div>
          </div>
          <button type="button" className="btn btn-secondary btn-sm" onClick={loadRequests}>
            Refresh Data
          </button>
        </div>

        {notification && (
          <div className={`alert alert-${notification.type}`} style={{ marginBottom: '16px' }}>
            {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span style={{ flex: 1 }}>{notification.text}</span>
            <button type="button" onClick={() => setNotification(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>✕</button>
          </div>
        )}

        {/* Filter Controls */}
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={16} color="#64748b" />
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Status:</span>
            <select
              className="form-control"
              style={{ width: '160px', padding: '6px 12px', fontSize: '0.8125rem' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="Semua">Semua Status</option>
              <option value="Pending">Pending (Perlu Diproses)</option>
              <option value="Disetujui">Disetujui</option>
              <option value="Ditolak">Ditolak</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Jenis:</span>
            <select
              className="form-control"
              style={{ width: '160px', padding: '6px 12px', fontSize: '0.8125rem' }}
              value={jenisFilter}
              onChange={(e) => setJenisFilter(e.target.value)}
            >
              <option value="Semua">Semua Jenis</option>
              <option value="Izin">Izin</option>
              <option value="Sakit">Sakit</option>
              <option value="Dinas Luar">Dinas Luar</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table List of Requests */}
      <div className="card">
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Pegawai</th>
                <th>Jenis</th>
                <th>Periode Tanggal</th>
                <th>Keterangan</th>
                <th>Lampiran</th>
                <th>Status</th>
                <th>Catatan Admin</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                    Memuat daftar pengajuan...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                    Tidak ada pengajuan yang sesuai kriteria filter.
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{req.nama}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{req.jabatan} (NIP: {req.nip})</div>
                    </td>
                    <td>{getJenisBadge(req.jenis)}</td>
                    <td style={{ fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                      <strong>{req.tanggal_mulai}</strong> s/d <strong>{req.tanggal_selesai}</strong>
                    </td>
                    <td style={{ maxWidth: '240px', fontSize: '0.8125rem' }}>
                      {req.keterangan}
                    </td>
                    <td>
                      {req.dokumen_bukti ? (
                        <a
                          href={`/uploads/${req.dokumen_bukti}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: '#4f46e5',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            textDecoration: 'none'
                          }}
                        >
                          <Paperclip size={14} /> Lihat File
                        </a>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Tidak ada</span>
                      )}
                    </td>
                    <td>{getStatusBadge(req.status)}</td>
                    <td style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {req.catatan_admin || '-'}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          setSelectedReq(req);
                          setCatatanAdmin(req.catatan_admin || '');
                        }}
                      >
                        <Eye size={14} /> Periksa Detail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL & PROCESS MODAL */}
      {selectedReq && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div style={{ fontWeight: 700, fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={20} color="#4f46e5" />
                Pemeriksaan Pengajuan Pegawai
              </div>
              <button
                type="button"
                onClick={() => setSelectedReq(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.875rem' }}>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>NAMA PEGAWAI</span>
                    <strong>{selectedReq.nama}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>JABATAN & NIP</span>
                    <span>{selectedReq.jabatan} ({selectedReq.nip})</span>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>JENIS PENGAJUAN</span>
                    {getJenisBadge(selectedReq.jenis)}
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>STATUS SAAT INI</span>
                    {getStatusBadge(selectedReq.status)}
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>RENTANG TANGGAL</span>
                    <strong>{selectedReq.tanggal_mulai}</strong> sampai dengan <strong>{selectedReq.tanggal_selesai}</strong>
                  </div>
                </div>
              </div>

              <div>
                <label className="form-label">Keterangan / Alasan dari Pegawai:</label>
                <div style={{ padding: '12px', background: '#f1f5f9', borderRadius: '8px', fontSize: '0.875rem', color: '#1e293b' }}>
                  {selectedReq.keterangan}
                </div>
              </div>

              {selectedReq.dokumen_bukti && (
                <div>
                  <label className="form-label">Dokumen Lampiran Bukti:</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <a
                      href={`/uploads/${selectedReq.dokumen_bukti}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-secondary btn-sm"
                    >
                      <Paperclip size={14} /> Buka / Unduh Dokumen ({selectedReq.dokumen_bukti})
                    </a>
                  </div>
                </div>
              )}

              <div className="form-group" style={{ marginTop: '8px' }}>
                <label className="form-label">Catatan Admin (Opsional):</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Berikan instruksi tambahan atau alasan jika menolak pengajuan..."
                  value={catatanAdmin}
                  onChange={(e) => setCatatanAdmin(e.target.value)}
                ></textarea>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSelectedReq(null)}
                disabled={processing}
              >
                Batal
              </button>
              <button
                type="button"
                className="btn btn-danger"
                disabled={processing}
                onClick={() => handleProcess('Ditolak')}
              >
                <X size={16} /> Tolak Pengajuan
              </button>
              <button
                type="button"
                className="btn btn-success"
                disabled={processing}
                onClick={() => handleProcess('Disetujui')}
              >
                <Check size={16} /> Setujui Pengajuan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

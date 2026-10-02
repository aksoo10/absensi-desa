import React, { useState, useEffect } from 'react';
import { schedulesApi } from '../../api';
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Star,
  Check
} from 'lucide-react';

export default function AdminJadwal() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nama_jadwal: '',
    hari_kerja: 'Senin - Jumat',
    jam_masuk: '08:00:00',
    jam_pulang: '17:00:00',
    toleransi_menit: 15,
    is_default: true
  });
  const [submitting, setSubmitting] = useState(false);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const res = await schedulesApi.getAll();
      if (res.success) {
        setSchedules(res.schedules);
      }
    } catch (err) {
      console.error('Error fetching schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedules();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      nama_jadwal: '',
      hari_kerja: 'Senin - Jumat',
      jam_masuk: '08:00:00',
      jam_pulang: '17:00:00',
      toleransi_menit: 15,
      is_default: schedules.length === 0
    });
    setIsModalOpen(true);
  };

  const openEditModal = (sch) => {
    setEditingId(sch.id);
    setFormData({
      nama_jadwal: sch.nama_jadwal,
      hari_kerja: sch.hari_kerja,
      jam_masuk: sch.jam_masuk,
      jam_pulang: sch.jam_pulang,
      toleransi_menit: sch.toleransi_menit,
      is_default: sch.is_default === 1 || sch.is_default === true
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        const res = await schedulesApi.update(editingId, formData);
        setNotification({ type: 'success', text: res.message });
      } else {
        const res = await schedulesApi.create(formData);
        setNotification({ type: 'success', text: res.message });
      }
      setIsModalOpen(false);
      await loadSchedules();
    } catch (err) {
      setNotification({ type: 'danger', text: err.message || 'Gagal menyimpan jadwal.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, nama) => {
    if (!window.confirm(`Hapus jadwal "${nama}"?`)) return;
    try {
      const res = await schedulesApi.delete(id);
      setNotification({ type: 'success', text: res.message });
      await loadSchedules();
    } catch (err) {
      setNotification({ type: 'danger', text: err.message || 'Gagal menghapus jadwal.' });
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Bar */}
      <div className="card">
        <div className="card-header" style={{ marginBottom: '16px' }}>
          <div>
            <div className="card-title">
              <Clock size={22} color="#4f46e5" />
              Kelola Jadwal Kerja & Jam Operasional
            </div>
            <div className="card-subtitle">
              Tentukan jam masuk, jam pulang, hari kerja, dan batas toleransi keterlambatan
            </div>
          </div>
          <button type="button" className="btn btn-primary" onClick={openAddModal}>
            <Plus size={16} /> Tambah Jadwal Baru
          </button>
        </div>

        {notification && (
          <div className={`alert alert-${notification.type}`} style={{ marginBottom: '16px' }}>
            {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span style={{ flex: 1 }}>{notification.text}</span>
            <button type="button" onClick={() => setNotification(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>✕</button>
          </div>
        )}

        <div style={{
          background: '#eef2ff',
          padding: '12px 16px',
          borderRadius: '10px',
          borderLeft: '4px solid #4f46e5',
          fontSize: '0.8125rem',
          color: '#312e81'
        }}>
          💡 <strong>Ketentuan Sistem:</strong> Jadwal yang ditandai sebagai <strong>Default (Aktif)</strong> akan secara otomatis digunakan mesin presensi saat pegawai menekan <em>Absen Masuk</em> untuk menentukan status <strong>Tepat Waktu</strong> atau <strong>Terlambat</strong>.
        </div>
      </div>

      {/* Grid of Schedules */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px'
      }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', gridColumn: '1 / -1' }}>
            Memuat daftar jadwal...
          </div>
        ) : schedules.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', gridColumn: '1 / -1' }}>
            Belum ada jadwal kerja yang dibuat. Silakan tambahkan jadwal kerja baru.
          </div>
        ) : (
          schedules.map((sch) => {
            const isDefault = sch.is_default === 1 || sch.is_default === true;
            return (
              <div
                key={sch.id}
                className="card"
                style={{
                  border: isDefault ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                  position: 'relative'
                }}
              >
                {isDefault && (
                  <div style={{
                    position: 'absolute',
                    top: '-12px',
                    right: '20px',
                    background: '#4f46e5',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: '0 4px 8px rgba(79, 70, 229, 0.3)'
                  }}>
                    <Star size={12} fill="white" /> JADWAL DEFAULT (DIGUNAKAN SISTEM)
                  </div>
                )}

                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                    {sch.nama_jadwal}
                  </h3>
                  <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '2px' }}>
                    🗓️ {sch.hari_kerja}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>Jam Masuk:</span>
                    <strong style={{ color: '#10b981' }}>{sch.jam_masuk} WIB</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>Toleransi Keterlambatan:</span>
                    <strong style={{ color: '#f59e0b' }}>+{sch.toleransi_menit} Menit</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>Jam Pulang:</span>
                    <strong style={{ color: '#4f46e5' }}>{sch.jam_pulang} WIB</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => openEditModal(sch)}
                  >
                    <Edit size={14} color="#4f46e5" /> Ubah
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    disabled={schedules.length === 1}
                    onClick={() => handleDelete(sch.id, sch.nama_jadwal)}
                  >
                    <Trash2 size={14} color="#ef4444" /> Hapus
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL: TAMBAH / UBAH JADWAL */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div style={{ fontWeight: 700, fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={20} color="#4f46e5" />
                {editingId ? 'Ubah Jadwal Kerja' : 'Tambah Jadwal Kerja Baru'}
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#64748b' }}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Nama Jadwal Kerja *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Contoh: Jadwal Reguler Kantor"
                    value={formData.nama_jadwal}
                    onChange={(e) => setFormData({ ...formData, nama_jadwal: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Hari Kerja *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Contoh: Senin - Jumat, atau Senin - Sabtu"
                    value={formData.hari_kerja}
                    onChange={(e) => setFormData({ ...formData, hari_kerja: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Jam Masuk (HH:mm:ss) *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="08:00:00"
                      value={formData.jam_masuk}
                      onChange={(e) => setFormData({ ...formData, jam_masuk: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Jam Pulang (HH:mm:ss) *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="17:00:00"
                      value={formData.jam_pulang}
                      onChange={(e) => setFormData({ ...formData, jam_pulang: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Toleransi Keterlambatan (Menit) *</label>
                  <input
                    type="number"
                    min="0"
                    max="120"
                    className="form-control"
                    value={formData.toleransi_menit}
                    onChange={(e) => setFormData({ ...formData, toleransi_menit: parseInt(e.target.value, 10) || 0 })}
                    required
                  />
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                    Pegawai yang absen masuk setelah jam masuk + menit toleransi akan berstatus <strong>Terlambat</strong>.
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: '#f8fafc',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0'
                }}>
                  <input
                    type="checkbox"
                    id="is_default_checkbox"
                    checked={formData.is_default}
                    onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <label htmlFor="is_default_checkbox" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b', cursor: 'pointer' }}>
                    Jadikan jadwal ini sebagai Jadwal Utama (Default Sistem)
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Menyimpan...' : 'Simpan Jadwal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

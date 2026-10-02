import React, { useState, useEffect } from 'react';
import { pegawaiApi } from '../../api';
import {
  Users,
  UserPlus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  IdCard,
  Phone,
  Mail,
  MapPin,
  CalendarCheck
} from 'lucide-react';

export default function AdminPegawai() {
  const [pegawaiList, setPegawaiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPegawai, setSelectedPegawai] = useState(null);
  const [pegawaiDetailData, setPegawaiDetailData] = useState(null);

  // Form State
  const initialFormState = {
    nama: '',
    nip: '',
    nik: '',
    jabatan: '',
    status_pegawai: 'Tetap',
    no_hp: '',
    alamat: '',
    email: '',
    username: '',
    password: ''
  };
  const [formData, setFormData] = useState(initialFormState);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  const loadPegawai = async () => {
    try {
      setLoading(true);
      const res = await pegawaiApi.getAll({ search, status_pegawai: statusFilter });
      if (res.success) {
        setPegawaiList(res.pegawai);
      }
    } catch (err) {
      console.error('Error fetching pegawai:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadPegawai();
    }, 250);
    return () => clearTimeout(delayDebounceFn);
  }, [search, statusFilter]);

  // Open Edit Modal
  const openEditModal = (p) => {
    setSelectedPegawai(p);
    setFormData({
      nama: p.nama,
      nip: p.nip,
      nik: p.nik,
      jabatan: p.jabatan,
      status_pegawai: p.status_pegawai,
      no_hp: p.no_hp || '',
      alamat: p.alamat || '',
      email: p.email || '',
      username: p.username || '',
      password: '' // leave blank if unchanged
    });
    setIsEditModalOpen(true);
  };

  // Open Detail Modal
  const openDetailModal = async (p) => {
    setSelectedPegawai(p);
    setIsDetailModalOpen(true);
    try {
      const res = await pegawaiApi.getById(p.id);
      if (res.success) {
        setPegawaiDetailData(res);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Add Submit
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await pegawaiApi.create(formData);
      setNotification({ type: 'success', text: res.message });
      setIsAddModalOpen(false);
      setFormData(initialFormState);
      await loadPegawai();
    } catch (err) {
      setNotification({ type: 'danger', text: err.message || 'Gagal menambahkan pegawai.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await pegawaiApi.update(selectedPegawai.id, formData);
      setNotification({ type: 'success', text: res.message });
      setIsEditModalOpen(false);
      await loadPegawai();
    } catch (err) {
      setNotification({ type: 'danger', text: err.message || 'Gagal mengubah data pegawai.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete
  const handleDelete = async (id, nama) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus data pegawai "${nama}"? Semua riwayat kehadiran dan pengajuan pegawai ini juga akan terhapus.`)) {
      return;
    }

    try {
      const res = await pegawaiApi.delete(id);
      setNotification({ type: 'success', text: res.message });
      await loadPegawai();
    } catch (err) {
      setNotification({ type: 'danger', text: err.message || 'Gagal menghapus pegawai.' });
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Bar */}
      <div className="card">
        <div className="card-header" style={{ marginBottom: '16px' }}>
          <div>
            <div className="card-title">
              <Users size={22} color="#4f46e5" />
              Kelola Data Pegawai
            </div>
            <div className="card-subtitle">
              Pendaftaran, pembaruan biodata, jabatan, status, serta akun login pegawai
            </div>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setFormData(initialFormState);
              setIsAddModalOpen(true);
            }}
          >
            <UserPlus size={16} />
            Tambah Pegawai Baru
          </button>
        </div>

        {notification && (
          <div className={`alert alert-${notification.type}`} style={{ marginBottom: '16px' }}>
            {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span style={{ flex: 1 }}>{notification.text}</span>
            <button type="button" onClick={() => setNotification(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>✕</button>
          </div>
        )}

        {/* Search and Filters */}
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '38px' }}
              placeholder="Cari nama, NIP, NIK, jabatan, atau email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={16} color="#64748b" />
            <select
              className="form-control"
              style={{ width: '180px' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="Semua">Semua Status</option>
              <option value="Tetap">Pegawai Tetap</option>
              <option value="Kontrak">Pegawai Kontrak</option>
              <option value="Magang">Magang / Intern</option>
              <option value="Honorer">Honorer</option>
            </select>
          </div>
        </div>
      </div>

      {/* Employees Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Pegawai</th>
                <th>NIP</th>
                <th>NIK</th>
                <th>Jabatan</th>
                <th>Status</th>
                <th>No. Telepon</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                    Memuat data pegawai...
                  </td>
                </tr>
              ) : pegawaiList.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                    Tidak ada pegawai ditemukan.
                  </td>
                </tr>
              ) : (
                pegawaiList.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{p.nama}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.email}</div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{p.nip}</td>
                    <td style={{ fontFamily: 'monospace', color: '#64748b' }}>{p.nik}</td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#334155' }}>{p.jabatan}</span>
                    </td>
                    <td>
                      <span className={`badge ${
                        p.status_pegawai === 'Tetap' ? 'badge-success' :
                        p.status_pegawai === 'Kontrak' ? 'badge-info' : 'badge-purple'
                      }`}>
                        {p.status_pegawai}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8125rem' }}>{p.no_hp || '-'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          title="Lihat Detail & Kehadiran"
                          onClick={() => openDetailModal(p)}
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          title="Ubah Data"
                          onClick={() => openEditModal(p)}
                        >
                          <Edit size={14} color="#4f46e5" />
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          title="Hapus Pegawai"
                          onClick={() => handleDelete(p.id, p.nama)}
                        >
                          <Trash2 size={14} color="#ef4444" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: TAMBAH PEGAWAI */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div style={{ fontWeight: 700, fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserPlus size={20} color="#4f46e5" />
                Tambah Pegawai Baru
              </div>
              <button type="button" onClick={() => setIsAddModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#64748b' }}>✕</button>
            </div>

            <form onSubmit={handleAddSubmit}>
              <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Nama Lengkap & Gelar *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Contoh: Rian Anggara, S.T."
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">NIP (Nomor Induk Pegawai) *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Contoh: 199105142019021005"
                    value={formData.nip}
                    onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">NIK (KTP) *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="16 digit NIK"
                    value={formData.nik}
                    onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Jabatan *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Contoh: Staff IT / HRD"
                    value={formData.jabatan}
                    onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Status Pegawai *</label>
                  <select
                    className="form-control"
                    value={formData.status_pegawai}
                    onChange={(e) => setFormData({ ...formData, status_pegawai: e.target.value })}
                  >
                    <option value="Tetap">Pegawai Tetap</option>
                    <option value="Kontrak">Pegawai Kontrak</option>
                    <option value="Magang">Magang / Intern</option>
                    <option value="Honorer">Honorer</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Email Login *</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="email@perusahaan.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Kata Sandi Default *</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Minimal 6 karakter"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">No. Telepon / WA</label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="08xxxxxxxxxx"
                    value={formData.no_hp}
                    onChange={(e) => setFormData({ ...formData, no_hp: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Username (Opsional)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="username login"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Alamat Domisili</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    placeholder="Alamat lengkap tempat tinggal"
                    value={formData.alamat}
                    onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  ></textarea>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Menyimpan...' : 'Simpan Pegawai'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT PEGAWAI */}
      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div style={{ fontWeight: 700, fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit size={20} color="#4f46e5" />
                Ubah Data Pegawai: {selectedPegawai?.nama}
              </div>
              <button type="button" onClick={() => setIsEditModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#64748b' }}>✕</button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Nama Lengkap & Gelar *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">NIP *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.nip}
                    onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">NIK *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.nik}
                    onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Jabatan *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.jabatan}
                    onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Status Pegawai *</label>
                  <select
                    className="form-control"
                    value={formData.status_pegawai}
                    onChange={(e) => setFormData({ ...formData, status_pegawai: e.target.value })}
                  >
                    <option value="Tetap">Pegawai Tetap</option>
                    <option value="Kontrak">Pegawai Kontrak</option>
                    <option value="Magang">Magang / Intern</option>
                    <option value="Honorer">Honorer</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Email Login</label>
                  <input
                    type="email"
                    className="form-control"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Ganti Kata Sandi (Kosongkan bila tidak diubah)</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Kosongkan jika tetap"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">No. Telepon / WA</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={formData.no_hp}
                    onChange={(e) => setFormData({ ...formData, no_hp: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Alamat Domisili</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    value={formData.alamat}
                    onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  ></textarea>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Memperbarui...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DETAIL PEGAWAI & STATS */}
      {isDetailModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <div style={{ fontWeight: 700, fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Eye size={20} color="#4f46e5" />
                Detail Pegawai: {selectedPegawai?.nama}
              </div>
              <button type="button" onClick={() => setIsDetailModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#64748b' }}>✕</button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Profile Card */}
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.875rem' }}>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>NIP</span>
                    <strong style={{ fontFamily: 'monospace' }}>{selectedPegawai?.nip}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>NIK</span>
                    <strong style={{ fontFamily: 'monospace' }}>{selectedPegawai?.nik}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>JABATAN</span>
                    <strong>{selectedPegawai?.jabatan}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>STATUS</span>
                    <span className="badge badge-success">{selectedPegawai?.status_pegawai}</span>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>EMAIL</span>
                    <span>{selectedPegawai?.email}</span>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>TELEPON</span>
                    <span>{selectedPegawai?.no_hp || '-'}</span>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>ALAMAT</span>
                    <span>{selectedPegawai?.alamat || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Attendance Mini Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div style={{ background: '#ecfdf5', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>
                    {pegawaiDetailData?.stats?.total_kehadiran || 0}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#065f46' }}>Total Hadir</div>
                </div>
                <div style={{ background: '#f0fdf4', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669' }}>
                    {pegawaiDetailData?.stats?.total_tepat_waktu || 0}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#047857' }}>Tepat Waktu</div>
                </div>
                <div style={{ background: '#fffbeb', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f59e0b' }}>
                    {pegawaiDetailData?.stats?.total_terlambat || 0}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#b45309' }}>Terlambat</div>
                </div>
              </div>

              {/* Recent Attendances */}
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '8px' }}>
                  Absensi Terakhir Pegawai:
                </div>
                <div className="table-responsive" style={{ maxHeight: '180px' }}>
                  <table className="custom-table" style={{ fontSize: '0.75rem' }}>
                    <thead>
                      <tr>
                        <th>Tanggal</th>
                        <th>Jam Masuk</th>
                        <th>Jam Pulang</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pegawaiDetailData?.recent_attendances?.length === 0 ? (
                        <tr><td colSpan="4" style={{ textAlign: 'center', padding: '10px' }}>Belum ada log absensi</td></tr>
                      ) : (
                        pegawaiDetailData?.recent_attendances?.map((att) => (
                          <tr key={att.id}>
                            <td>{att.tanggal}</td>
                            <td>{att.jam_masuk}</td>
                            <td>{att.jam_pulang || '-'}</td>
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
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setIsDetailModalOpen(false)}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

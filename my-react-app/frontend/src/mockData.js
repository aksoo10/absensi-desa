// In-browser mock data and fallback handler for online preview / demo when backend server is offline

const STORAGE_KEY = 'presensigo_demo_db_v1';

function getTodayStr() {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

function getInitialData() {
  return {
    users: [
      {
        id: 1,
        name: 'Administrator HRD',
        email: 'admin@perusahaan.com',
        username: 'admin',
        role: 'admin',
        password: 'password123',
        pegawai_id: null,
      },
      {
        id: 2,
        name: 'Budi Pratama, S.Kom',
        email: 'budi@perusahaan.com',
        username: 'budi',
        role: 'pegawai',
        password: 'password123',
        pegawai_id: 1,
      },
      {
        id: 3,
        name: 'Siti Rahmawati, S.E.',
        email: 'siti@perusahaan.com',
        username: 'siti',
        role: 'pegawai',
        password: 'password123',
        pegawai_id: 2,
      },
      {
        id: 4,
        name: 'Andi Saputra',
        email: 'andi@perusahaan.com',
        username: 'andi',
        role: 'pegawai',
        password: 'password123',
        pegawai_id: 3,
      }
    ],
    pegawai: [
      {
        id: 1,
        user_id: 2,
        nip: '198503152010011002',
        nik: '3201123456780001',
        nama: 'Budi Pratama, S.Kom',
        jabatan: 'Senior Software Engineer',
        status_pegawai: 'Tetap',
        no_hp: '081234567890',
        alamat: 'Jl. Merdeka No. 12, Sekayu',
        email: 'budi@perusahaan.com',
        username: 'budi'
      },
      {
        id: 2,
        user_id: 3,
        nip: '199008222015032004',
        nik: '3201987654320002',
        nama: 'Siti Rahmawati, S.E.',
        jabatan: 'Staff Keuangan & Administrasi',
        status_pegawai: 'Tetap',
        no_hp: '081398765432',
        alamat: 'Jl. Sudirman No. 45, Bailangu',
        email: 'siti@perusahaan.com',
        username: 'siti'
      },
      {
        id: 3,
        user_id: 4,
        nip: '199512102020121003',
        nik: '3201456789100003',
        nama: 'Andi Saputra',
        jabatan: 'Kasi Pemerintahan Desa',
        status_pegawai: 'Kontrak',
        no_hp: '085712349876',
        alamat: 'Jl. Raya Bailangu Timur No. 88',
        email: 'andi@perusahaan.com',
        username: 'andi'
      }
    ],
    schedules: [
      {
        id: 1,
        nama_jadwal: 'Jadwal Reguler Pagi',
        hari_kerja: 'Senin - Jumat',
        jam_masuk: '08:00:00',
        jam_pulang: '17:00:00',
        toleransi_menit: 15,
        is_default: 1
      },
      {
        id: 2,
        nama_jadwal: 'Piket Pelayanan Sabtu',
        hari_kerja: 'Sabtu',
        jam_masuk: '08:30:00',
        jam_pulang: '13:00:00',
        toleransi_menit: 15,
        is_default: 0
      }
    ],
    attendances: [
      {
        id: 1,
        pegawai_id: 1,
        nama_pegawai: 'Budi Pratama, S.Kom',
        nip: '198503152010011002',
        jabatan: 'Senior Software Engineer',
        tanggal: getTodayStr(),
        jam_masuk: '07:55:00',
        jam_pulang: null,
        status: 'Tepat waktu',
        durasi_kerja_menit: 0,
        keterangan: 'Presensi pagi tepat waktu'
      },
      {
        id: 2,
        pegawai_id: 2,
        nama_pegawai: 'Siti Rahmawati, S.E.',
        nip: '199008222015032004',
        jabatan: 'Staff Keuangan & Administrasi',
        tanggal: getTodayStr(),
        jam_masuk: '08:18:00',
        jam_pulang: null,
        status: 'Terlambat',
        durasi_kerja_menit: 0,
        keterangan: 'Ada kendala di jalan'
      }
    ],
    leaves: [
      {
        id: 1,
        pegawai_id: 3,
        nama_pegawai: 'Andi Saputra',
        nip: '199512102020121003',
        jabatan: 'Kasi Pemerintahan Desa',
        jenis: 'Izin',
        tanggal_mulai: getTodayStr(),
        tanggal_selesai: getTodayStr(),
        keterangan: 'Keperluan keluarga di luar kota',
        dokumen_bukti: null,
        status: 'Pending',
        catatan_admin: null,
        diproses_pada: null,
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        pegawai_id: 1,
        nama_pegawai: 'Budi Pratama, S.Kom',
        nip: '198503152010011002',
        jabatan: 'Senior Software Engineer',
        jenis: 'Dinas Luar',
        tanggal_mulai: '2026-09-28',
        tanggal_selesai: '2026-09-29',
        keterangan: 'Menghadiri Pelatihan Aplikasi Digital Desa',
        dokumen_bukti: null,
        status: 'Disetujui',
        catatan_admin: 'Disetujui, harap membawa laporan dan sertifikat setelah selesai.',
        diproses_pada: '2026-09-27T10:00:00.000Z',
        created_at: '2026-09-26T08:00:00.000Z'
      }
    ]
  };
}

function loadDB() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialData();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    return getInitialData();
  }
}

function saveDB(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

export function handleMockRequest(endpoint, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const db = loadDB();
  const cleanEndpoint = endpoint.split('?')[0];
  const queryStr = endpoint.includes('?') ? endpoint.split('?')[1] : '';
  const searchParams = new URLSearchParams(queryStr);

  let body = {};
  if (options.body) {
    if (options.body instanceof FormData) {
      for (const [key, value] of options.body.entries()) {
        body[key] = value;
      }
    } else if (typeof options.body === 'string') {
      try {
        body = JSON.parse(options.body);
      } catch (e) {
        body = {};
      }
    }
  }

  // 1. AUTH /login
  if (cleanEndpoint === '/auth/login' && method === 'POST') {
    const { identifier, password } = body;
    const user = db.users.find(
      (u) => (u.email === identifier || u.username === identifier)
    );

    if (!user) {
      throw new Error('Email atau username tidak ditemukan.');
    }
    if (user.password !== password) {
      throw new Error('Kata sandi salah.');
    }

    const pegawaiInfo = db.pegawai.find((p) => p.user_id === user.id) || {};
    const fullUser = {
      ...user,
      ...pegawaiInfo,
      id: user.id,
      pegawai_id: pegawaiInfo.id || null
    };

    const token = `demo_token_${user.id}_${Date.now()}`;
    localStorage.setItem('presensi_demo_session', JSON.stringify(fullUser));

    return {
      success: true,
      message: 'Login demo berhasil.',
      token,
      user: fullUser,
      isDemo: true
    };
  }

  // 2. AUTH /me
  if (cleanEndpoint === '/auth/me' && method === 'GET') {
    const session = localStorage.getItem('presensi_demo_session');
    if (session) {
      try {
        const user = JSON.parse(session);
        return { success: true, user, isDemo: true };
      } catch (e) {}
    }
    return { success: false, message: 'Unauthorized' };
  }

  // 3. AUTH /register
  if (cleanEndpoint === '/auth/register' && method === 'POST') {
    const newUserId = db.users.length + 1;
    const newPegawaiId = db.pegawai.length + 1;
    const newUser = {
      id: newUserId,
      name: body.name || 'Pegawai Baru',
      email: body.email,
      username: body.username || body.email.split('@')[0],
      role: 'pegawai',
      password: body.password || 'password123',
      pegawai_id: newPegawaiId
    };
    const newPegawai = {
      id: newPegawaiId,
      user_id: newUserId,
      nip: body.nip || `1990${Date.now().toString().slice(-10)}`,
      nik: body.nik || `3201${Date.now().toString().slice(-12)}`,
      nama: body.name,
      jabatan: body.jabatan || 'Staf Desa',
      status_pegawai: body.status_pegawai || 'Tetap',
      no_hp: body.no_hp || '',
      alamat: body.alamat || '',
      email: body.email,
      username: newUser.username
    };
    db.users.push(newUser);
    db.pegawai.push(newPegawai);
    saveDB(db);
    return { success: true, message: 'Registrasi pegawai berhasil. Silakan masuk.' };
  }

  // Current session helper
  const sessionStr = localStorage.getItem('presensi_demo_session');
  const currentUser = sessionStr ? JSON.parse(sessionStr) : null;
  const currentPegawaiId = currentUser?.pegawai_id || 1;

  // 4. ATTENDANCE /today
  if (cleanEndpoint === '/attendance/today' && method === 'GET') {
    const todayStr = getTodayStr();
    const att = db.attendances.find(
      (a) => a.pegawai_id === currentPegawaiId && a.tanggal === todayStr
    );
    return {
      success: true,
      hasAttended: !!att,
      attendance: att || null,
      serverTime: new Date().toISOString()
    };
  }

  // 5. ATTENDANCE /check-in
  if (cleanEndpoint === '/attendance/check-in' && method === 'POST') {
    const todayStr = getTodayStr();
    const nowTime = new Date().toTimeString().split(' ')[0];
    const isLate = nowTime > '08:15:00';
    const peg = db.pegawai.find((p) => p.id === currentPegawaiId) || {};

    let att = db.attendances.find(
      (a) => a.pegawai_id === currentPegawaiId && a.tanggal === todayStr
    );
    if (att) {
      throw new Error('Anda sudah melakukan presensi masuk hari ini.');
    }

    att = {
      id: db.attendances.length + 1,
      pegawai_id: currentPegawaiId,
      nama_pegawai: peg.nama || currentUser?.name || 'Pegawai',
      nip: peg.nip || '-',
      jabatan: peg.jabatan || '-',
      tanggal: todayStr,
      jam_masuk: nowTime,
      jam_pulang: null,
      status: isLate ? 'Terlambat' : 'Tepat waktu',
      durasi_kerja_menit: 0,
      keterangan: body.keterangan || (isLate ? 'Hadir terlambat' : 'Hadir tepat waktu')
    };
    db.attendances.unshift(att);
    saveDB(db);
    return { success: true, message: 'Presensi masuk berhasil dicatat!', attendance: att };
  }

  // 6. ATTENDANCE /check-out
  if (cleanEndpoint === '/attendance/check-out' && method === 'POST') {
    const todayStr = getTodayStr();
    const nowTime = new Date().toTimeString().split(' ')[0];
    const att = db.attendances.find(
      (a) => a.pegawai_id === currentPegawaiId && a.tanggal === todayStr
    );
    if (!att) {
      throw new Error('Anda belum melakukan presensi masuk hari ini.');
    }
    if (att.jam_pulang) {
      throw new Error('Anda sudah melakukan presensi pulang hari ini.');
    }

    att.jam_pulang = nowTime;
    att.durasi_kerja_menit = 480;
    saveDB(db);
    return { success: true, message: 'Presensi pulang berhasil dicatat. Selamat beristirahat!', attendance: att };
  }

  // 7. ATTENDANCE /history
  if (cleanEndpoint === '/attendance/history' && method === 'GET') {
    const list = db.attendances.filter((a) => a.pegawai_id === currentPegawaiId);
    return { success: true, history: list };
  }

  // 8. ATTENDANCE /stats
  if (cleanEndpoint === '/attendance/stats' && method === 'GET') {
    const list = db.attendances.filter((a) => a.pegawai_id === currentPegawaiId);
    const totalHadir = list.length;
    const tepatWaktu = list.filter((a) => a.status === 'Tepat waktu').length;
    const terlambat = list.filter((a) => a.status === 'Terlambat').length;
    const leaves = db.leaves.filter((l) => l.pegawai_id === currentPegawaiId && l.status === 'Disetujui').length;

    return {
      success: true,
      stats: {
        total_hadir: totalHadir,
        tepat_waktu: tepatWaktu,
        terlambat: terlambat,
        izin_cuti: leaves,
        persentase_kehadiran: totalHadir > 0 ? Math.round((tepatWaktu / totalHadir) * 100) : 100
      }
    };
  }

  // 9. LEAVE /request
  if (cleanEndpoint === '/leave/request' && method === 'POST') {
    const peg = db.pegawai.find((p) => p.id === currentPegawaiId) || {};
    const newReq = {
      id: db.leaves.length + 1,
      pegawai_id: currentPegawaiId,
      nama_pegawai: peg.nama || currentUser?.name || 'Pegawai',
      nip: peg.nip || '-',
      jabatan: peg.jabatan || '-',
      jenis: body.jenis || 'Izin',
      tanggal_mulai: body.tanggal_mulai || getTodayStr(),
      tanggal_selesai: body.tanggal_selesai || getTodayStr(),
      keterangan: body.keterangan || '',
      dokumen_bukti: null,
      status: 'Pending',
      catatan_admin: null,
      diproses_pada: null,
      created_at: new Date().toISOString()
    };
    db.leaves.unshift(newReq);
    saveDB(db);
    return { success: true, message: 'Pengajuan berhasil dikirim dan menunggu persetujuan admin!' };
  }

  // 10. LEAVE /my-requests
  if (cleanEndpoint === '/leave/my-requests' && method === 'GET') {
    const list = db.leaves.filter((l) => l.pegawai_id === currentPegawaiId);
    return { success: true, requests: list };
  }

  // 11. LEAVE /all
  if (cleanEndpoint === '/leave/all' && method === 'GET') {
    return { success: true, requests: db.leaves };
  }

  // 12. LEAVE /:id/process
  if (cleanEndpoint.startsWith('/leave/') && cleanEndpoint.endsWith('/process') && method === 'PUT') {
    const parts = cleanEndpoint.split('/');
    const id = parseInt(parts[2], 10);
    const reqItem = db.leaves.find((l) => l.id === id);
    if (reqItem) {
      reqItem.status = body.status || 'Disetujui';
      reqItem.catatan_admin = body.catatan_admin || '';
      reqItem.diproses_pada = new Date().toISOString();
      saveDB(db);
      return { success: true, message: `Pengajuan berhasil diperbarui menjadi ${reqItem.status}!` };
    }
    throw new Error('Pengajuan tidak ditemukan.');
  }

  // 13. DASHBOARD /admin
  if (cleanEndpoint === '/dashboard/admin' && method === 'GET') {
    const totalPegawaiAktif = db.pegawai.length;
    const todayStr = getTodayStr();
    const todayAtts = db.attendances.filter((a) => a.tanggal === todayStr);
    const hadirHariIni = todayAtts.length;
    const terlambatHariIni = todayAtts.filter((a) => a.status === 'Terlambat').length;
    const tepatWaktuHariIni = todayAtts.filter((a) => a.status === 'Tepat waktu').length;
    const izinSakitHariIni = db.leaves.filter(
      (l) => l.status === 'Disetujui' && l.tanggal_mulai <= todayStr && l.tanggal_selesai >= todayStr
    ).length;
    const pengajuanPending = db.leaves.filter((l) => l.status === 'Pending').length;
    const tidakHadir = Math.max(0, totalPegawaiAktif - hadirHariIni - izinSakitHariIni);

    const chartData = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
      chartData.push({
        tanggal: ds,
        label: dayNames[d.getDay()],
        hadir: Math.max(1, (i % 2 === 0 ? 3 : 2)),
        terlambat: i === 1 ? 1 : 0
      });
    }

    return {
      success: true,
      stats: {
        total_pegawai: totalPegawaiAktif,
        hadir_hari_ini: hadirHariIni,
        tepat_waktu: tepatWaktuHariIni,
        terlambat: terlambatHariIni,
        izin_sakit: izinSakitHariIni,
        tidak_hadir: tidakHadir,
        pengajuan_pending: pengajuanPending
      },
      chartData,
      todayAttendances: todayAtts
    };
  }

  // 14. PEGAWAI /pegawai
  if (cleanEndpoint === '/pegawai') {
    if (method === 'GET') {
      const search = (searchParams.get('search') || '').toLowerCase();
      let list = db.pegawai;
      if (search) {
        list = list.filter(
          (p) =>
            p.nama.toLowerCase().includes(search) ||
            p.nip.toLowerCase().includes(search) ||
            p.jabatan.toLowerCase().includes(search)
        );
      }
      return { success: true, data: list };
    }
    if (method === 'POST') {
      const newId = db.pegawai.length + 1;
      const newUserId = db.users.length + 1;
      const newP = {
        id: newId,
        user_id: newUserId,
        nip: body.nip || `199${Date.now().toString().slice(-9)}`,
        nik: body.nik || `3201${Date.now().toString().slice(-12)}`,
        nama: body.nama || 'Pegawai Baru',
        jabatan: body.jabatan || 'Staf',
        status_pegawai: body.status_pegawai || 'Tetap',
        no_hp: body.no_hp || '',
        alamat: body.alamat || '',
        email: body.email || `pegawai${newId}@desa.id`,
        username: body.username || `pegawai${newId}`
      };
      db.pegawai.push(newP);
      db.users.push({
        id: newUserId,
        name: newP.nama,
        email: newP.email,
        username: newP.username,
        role: 'pegawai',
        password: body.password || 'password123',
        pegawai_id: newId
      });
      saveDB(db);
      return { success: true, message: 'Pegawai berhasil ditambahkan!', data: newP };
    }
  }

  // 15. PEGAWAI /pegawai/:id
  if (cleanEndpoint.startsWith('/pegawai/')) {
    const id = parseInt(cleanEndpoint.split('/')[2], 10);
    if (method === 'GET') {
      const p = db.pegawai.find((x) => x.id === id);
      return { success: true, data: p };
    }
    if (method === 'PUT') {
      const p = db.pegawai.find((x) => x.id === id);
      if (p) {
        Object.assign(p, body);
        saveDB(db);
        return { success: true, message: 'Data pegawai berhasil diperbarui!', data: p };
      }
      throw new Error('Pegawai tidak ditemukan.');
    }
    if (method === 'DELETE') {
      db.pegawai = db.pegawai.filter((x) => x.id !== id);
      saveDB(db);
      return { success: true, message: 'Pegawai berhasil dihapus!' };
    }
  }

  // 16. SCHEDULES /schedules
  if (cleanEndpoint === '/schedules') {
    if (method === 'GET') {
      return { success: true, schedules: db.schedules };
    }
    if (method === 'POST') {
      const newS = {
        id: db.schedules.length + 1,
        nama_jadwal: body.nama_jadwal || 'Jadwal Baru',
        hari_kerja: body.hari_kerja || 'Senin - Jumat',
        jam_masuk: body.jam_masuk || '08:00:00',
        jam_pulang: body.jam_pulang || '17:00:00',
        toleransi_menit: parseInt(body.toleransi_menit || 15, 10),
        is_default: body.is_default ? 1 : 0
      };
      db.schedules.push(newS);
      saveDB(db);
      return { success: true, message: 'Jadwal berhasil dibuat!', schedule: newS };
    }
  }

  if (cleanEndpoint.startsWith('/schedules/')) {
    const id = parseInt(cleanEndpoint.split('/')[2], 10);
    if (method === 'PUT') {
      const s = db.schedules.find((x) => x.id === id);
      if (s) {
        Object.assign(s, body);
        saveDB(db);
        return { success: true, message: 'Jadwal berhasil diperbarui!', schedule: s };
      }
      throw new Error('Jadwal tidak ditemukan.');
    }
    if (method === 'DELETE') {
      db.schedules = db.schedules.filter((x) => x.id !== id);
      saveDB(db);
      return { success: true, message: 'Jadwal berhasil dihapus!' };
    }
  }

  // 17. REPORTS /reports
  if (cleanEndpoint === '/reports' && method === 'GET') {
    return {
      success: true,
      data: db.attendances.map((a) => ({
        ...a,
        nama: a.nama_pegawai,
        tanggal: a.tanggal
      })),
      total: db.attendances.length
    };
  }

  return null;
}

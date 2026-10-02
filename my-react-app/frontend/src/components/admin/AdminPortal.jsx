import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import AppSidebar from '../common/AppSidebar';
import AdminDashboard from './AdminDashboard';
import AdminPegawai from './AdminPegawai';
import AdminJadwal from './AdminJadwal';
import AdminPengajuan from './AdminPengajuan';
import AdminLaporan from './AdminLaporan';
import { dashboardApi, leaveApi, pegawaiApi } from '../../api';
import {
  Menu,
  ShieldCheck,
  Bell,
  LogOut,
  Sparkles,
  Calendar,
  Layers
} from 'lucide-react';

export default function AdminPortal() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Live badge stats
  const [badges, setBadges] = useState({
    pendingLeave: 0,
    totalPegawai: 0
  });

  const loadBadgeStats = async () => {
    try {
      const [dashRes, pegRes] = await Promise.all([
        dashboardApi.getAdminDashboard().catch(() => null),
        pegawaiApi.getAll().catch(() => null)
      ]);

      setBadges({
        pendingLeave: dashRes?.data?.pengajuan_pending || 0,
        totalPegawai: pegRes?.pegawai?.length || dashRes?.data?.total_pegawai || 0
      });
    } catch (e) {
      console.error('Error loading badge stats:', e);
    }
  };

  useEffect(() => {
    loadBadgeStats();
    const interval = setInterval(loadBadgeStats, 15000); // Polling every 15s for live badge updates
    return () => clearInterval(interval);
  }, []);

  const tabTitles = {
    dashboard: 'Dashboard Utama Administrator',
    pegawai: 'Manajemen Biodata & Akun Pegawai',
    jadwal: 'Jadwal Kerja & Toleransi Jam Kerja',
    pengajuan: 'Persetujuan Izin, Sakit & Dinas Luar',
    laporan: 'Laporan Rekapitulasi Presensi'
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-page)' }}>
      {/* PROFESSIONAL REUSABLE SIDEBAR */}
      <AppSidebar
        role="admin"
        user={user}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        logout={logout}
        badges={badges}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* MAIN CONTENT AREA */}
      <div
        className="main-content"
        style={{
          flex: 1,
          marginLeft: collapsed ? '82px' : '270px',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {/* Top Header Bar */}
        <header
          className="topbar no-print"
          style={{
            height: '70px',
            background: '#ffffff',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 28px',
            position: 'sticky',
            top: 0,
            zIndex: 90,
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Mobile Hamburger Button */}
            <button
              type="button"
              className="btn btn-secondary btn-sm sidebar-mobile-toggle"
              onClick={() => setSidebarOpen(true)}
              style={{ padding: '8px' }}
            >
              <Menu size={18} />
            </button>

            <div>
              <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}>
                {tabTitles[activeTab] || 'Panel Administrator'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                PT Perusahaan Sejahtera • Sistem Presensi Terintegrasi
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Server Online Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              background: '#ecfdf5',
              color: '#059669',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 600,
              border: '1px solid #a7f3d0'
            }}>
              <span className="sidebar-online-dot"></span>
              <span>MySQL Server Aktif</span>
            </div>

            {/* Quick Pending Alert if any */}
            {badges.pendingLeave > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab('pengajuan')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  background: '#fffbeb',
                  color: '#b45309',
                  border: '1px solid #fde68a',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <Bell size={14} />
                <span>{badges.pendingLeave} Menunggu Persetujuan</span>
              </button>
            )}

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={logout}
              title="Keluar dari akun"
            >
              <LogOut size={14} /> Keluar
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main style={{ padding: '28px', flex: 1 }}>
          {activeTab === 'dashboard' && <AdminDashboard onNavigateTab={setActiveTab} />}
          {activeTab === 'pegawai' && <AdminPegawai />}
          {activeTab === 'jadwal' && <AdminJadwal />}
          {activeTab === 'pengajuan' && <AdminPengajuan />}
          {activeTab === 'laporan' && <AdminLaporan />}
        </main>
      </div>
    </div>
  );
}

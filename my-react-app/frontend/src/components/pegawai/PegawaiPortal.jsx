import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import AppSidebar from '../common/AppSidebar';
import PegawaiDashboard from './PegawaiDashboard';
import {
  Menu,
  ShieldCheck,
  LogOut,
  Calendar,
  Clock,
  Briefcase
} from 'lucide-react';

export default function PegawaiPortal() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [myBadges, setMyBadges] = useState({
    myPending: 0
  });

  const tabTitles = {
    dashboard: 'Dashboard Pegawai',
    absensi: 'Presensi Kehadiran (Masuk / Pulang)',
    pengajuan: 'Layanan Pengajuan (Izin / Sakit / Dinas)',
    riwayat: 'Log Riwayat Presensi Lengkap'
  };

  const handleStatsLoaded = (stats) => {
    if (stats) {
      setMyBadges({
        myPending: stats.pengajuan_pending || 0
      });
    }
  };

  const todayFormatted = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-page)' }}>
      {/* PROFESSIONAL SIDEBAR FOR PEGAWAI */}
      <AppSidebar
        role="pegawai"
        user={user}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        logout={logout}
        badges={myBadges}
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
                {tabTitles[activeTab] || 'Portal Pegawai'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={13} />
                <span>{todayFormatted}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Status Pill */}
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
              <span>Akun Terverifikasi</span>
            </div>

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
          <PegawaiDashboard
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onStatsLoaded={handleStatsLoaded}
          />
        </main>
      </div>
    </div>
  );
}

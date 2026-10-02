import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Clock,
  FileText,
  FileSpreadsheet,
  LogOut,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CalendarCheck,
  History,
  CheckCircle2,
  Calendar,
  Building2,
  SlidersHorizontal
} from 'lucide-react';

export default function AppSidebar({
  role = 'admin',
  user,
  activeTab,
  onSelectTab,
  logout,
  badges = {},
  sidebarOpen,
  setSidebarOpen,
  collapsed: externalCollapsed,
  setCollapsed: externalSetCollapsed
}) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const collapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;
  const setCollapsed = externalSetCollapsed || setInternalCollapsed;

  // Admin menu groupings
  const adminSections = [
    {
      group: 'MENU UTAMA',
      items: [
        { id: 'dashboard', label: 'Dashboard Admin', icon: LayoutDashboard, badge: null }
      ]
    },
    {
      group: 'MANAJEMEN',
      items: [
        { id: 'pegawai', label: 'Data Pegawai', icon: Users, badge: badges.totalPegawai ? `${badges.totalPegawai}` : null, badgeType: 'indigo' },
        { id: 'jadwal', label: 'Jadwal Kerja', icon: Clock, badge: 'Aktif', badgeType: 'emerald' }
      ]
    },
    {
      group: 'VERIFIKASI & LAPORAN',
      items: [
        {
          id: 'pengajuan',
          label: 'Persetujuan Pengajuan',
          icon: FileText,
          badge: badges.pendingLeave ? `${badges.pendingLeave} Pending` : null,
          badgeType: 'amber'
        },
        { id: 'laporan', label: 'Laporan Absensi', icon: FileSpreadsheet, badge: 'Rekap', badgeType: 'indigo' }
      ]
    }
  ];

  // Pegawai menu groupings
  const pegawaiSections = [
    {
      group: 'MENU UTAMA',
      items: [
        { id: 'dashboard', label: 'Dashboard Pegawai', icon: LayoutDashboard, badge: null },
        { id: 'absensi', label: 'Absensi Masuk / Pulang', icon: Clock, badge: 'Hari Ini', badgeType: 'emerald' }
      ]
    },
    {
      group: 'LAYANAN MANDIRI',
      items: [
        {
          id: 'pengajuan',
          label: 'Pengajuan Izin / Sakit',
          icon: FileText,
          badge: badges.myPending ? `${badges.myPending} Pending` : null,
          badgeType: 'amber'
        },
        { id: 'riwayat', label: 'Riwayat Absensi', icon: History, badge: null }
      ]
    }
  ];

  const sections = role === 'admin' ? adminSections : pegawaiSections;

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 98
          }}
        />
      )}

      {/* SIDEBAR MAIN WRAPPER */}
      <aside
        className={`sidebar-wrapper ${collapsed ? 'collapsed' : 'expanded'} ${sidebarOpen ? 'mobile-open' : ''} no-print`}
      >
        {/* BRAND HEADER */}
        <div className="sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
            <div className="sidebar-logo-icon">
              <ShieldCheck size={24} />
            </div>

            {!collapsed && (
              <div className="sidebar-brand-text">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 800, fontSize: '1.25rem', color: '#ffffff', letterSpacing: '-0.02em' }}>
                    Presensi<span style={{ color: '#818cf8' }}>Go</span>
                  </span>
                  <span style={{
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    background: role === 'admin' ? 'rgba(99, 102, 241, 0.25)' : 'rgba(16, 185, 129, 0.25)',
                    color: role === 'admin' ? '#a5b4fc' : '#6ee7b7',
                    border: `1px solid ${role === 'admin' ? 'rgba(99, 102, 241, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`,
                    padding: '2px 6px',
                    borderRadius: '6px'
                  }}>
                    {role === 'admin' ? 'HR PRO' : 'PORTAL'}
                  </span>
                </div>
                <div style={{ fontSize: '0.6875rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                  <span className="sidebar-online-dot"></span>
                  <span>PT Perusahaan Sejahtera</span>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            type="button"
            className="sidebar-collapse-btn"
            title={collapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* NAVIGATION SECTIONS */}
        <div
          className="sidebar-nav-container"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: collapsed ? '16px 8px' : '16px 14px',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {sections.map((sec, secIdx) => (
            <div key={secIdx} style={{ marginBottom: '16px' }}>
              {!collapsed ? (
                <div className="sidebar-section-label">
                  <span>{sec.group}</span>
                </div>
              ) : (
                <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.08)', margin: '10px 4px' }} />
              )}

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`sidebar-item-btn ${isActive ? 'active' : ''}`}
                      title={collapsed ? item.label : undefined}
                      onClick={() => {
                        onSelectTab(item.id);
                        if (setSidebarOpen) setSidebarOpen(false);
                      }}
                      style={{
                        justifyContent: collapsed ? 'center' : 'flex-start',
                        padding: collapsed ? '12px 0' : '11px 14px'
                      }}
                    >
                      <div className="sidebar-icon-box">
                        <Icon size={19} />
                      </div>

                      {!collapsed && (
                        <>
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.label}
                          </span>

                          {item.badge && (
                            <span className={`sidebar-badge sidebar-badge-${item.badgeType || 'indigo'}`}>
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Quick Schedule / Workday Banner (Desktop Expanded Only) */}
          {!collapsed && (
            <div style={{
              marginTop: 'auto',
              marginBottom: '12px',
              padding: '12px 14px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {role === 'admin' ? 'Status Presensi' : 'Jadwal Hari Ini'}
                </span>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></span>
              </div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#f1f5f9' }}>
                {role === 'admin' ? 'Jadwal Reguler Pagi' : '08:00 - 17:00 WIB'}
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#64748b', marginTop: '2px' }}>
                {role === 'admin' ? 'Toleransi Terlambat: +15m' : 'Toleransi: 15 Menit'}
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM USER CARD */}
        <div className="sidebar-user-card">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '11px',
                background: role === 'admin'
                  ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)'
                  : 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.9375rem',
                flexShrink: 0,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
              }}>
                {user?.name?.charAt(0) || 'U'}
              </div>

              {!collapsed && (
                <div style={{ minWidth: 0, overflow: 'hidden' }}>
                  <div style={{
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    color: '#ffffff',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden'
                  }}>
                    {user?.name || 'Pengguna'}
                  </div>
                  <div style={{
                    fontSize: '0.6875rem',
                    color: '#94a3b8',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden'
                  }}>
                    {role === 'admin' ? 'Admin HRD Utama' : (user?.pegawai?.jabatan || 'Pegawai')}
                  </div>
                </div>
              )}
            </div>

            {!collapsed && (
              <button
                type="button"
                className="sidebar-collapse-btn"
                title="Keluar (Logout)"
                onClick={logout}
                style={{
                  color: '#f87171',
                  background: 'rgba(239, 68, 68, 0.1)',
                  borderColor: 'rgba(239, 68, 68, 0.25)'
                }}
              >
                <LogOut size={15} />
              </button>
            )}
          </div>

          {collapsed && (
            <div style={{ marginTop: '10px', textAlign: 'center' }}>
              <button
                type="button"
                className="sidebar-collapse-btn"
                title="Keluar (Logout)"
                onClick={logout}
                style={{
                  margin: '0 auto',
                  color: '#f87171',
                  background: 'rgba(239, 68, 68, 0.1)',
                  borderColor: 'rgba(239, 68, 68, 0.25)'
                }}
              >
                <LogOut size={15} />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

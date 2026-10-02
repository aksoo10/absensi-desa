import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginView from './components/LoginView';
import AdminPortal from './components/admin/AdminPortal';
import PegawaiPortal from './components/pegawai/PegawaiPortal';
import { ShieldCheck } from 'lucide-react';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0f172a',
        color: '#ffffff',
        gap: '16px'
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 25px rgba(79, 70, 229, 0.5)'
        }}>
          <ShieldCheck size={32} />
        </div>
        <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>Memuat Sistem PresensiGo...</div>
      </div>
    );
  }

  // 1. Alur awal sistem: Mulai -> Login/Register -> Validasi akun -> Dashboard sesuai role
  if (!user) {
    return <LoginView />;
  }

  if (user.role === 'admin') {
    return <AdminPortal />;
  }

  return <PegawaiPortal />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

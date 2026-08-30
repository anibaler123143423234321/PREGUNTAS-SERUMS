import React, { useState, useRef, useEffect } from 'react';
import { LogOut, User, CheckCircle2, ChevronDown, Sparkles } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export function AuthButton({ onOpenAuthModal }) {
  const { user, isAuthenticated, isAdmin, logout, loading } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div style={{ height: '32px', width: '32px', borderRadius: '50%', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }} />
    );
  }

  // Google SVG Icon
  const GoogleIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      <path
        fill="#EA4335"
        d="M12 5c1.54 0 2.93.53 4.02 1.57l3.01-3.01C17.21 1.83 14.8 1 12 1 7.37 1 3.4 3.66 1.45 7.55l3.66 2.84C6.01 7.38 8.78 5 12 5z"
      />
      <path
        fill="#4285F4"
        d="M23.49 12.28c0-.82-.07-1.6-.21-2.28H12v4.51h6.47c-.28 1.48-1.12 2.73-2.39 3.58l3.71 2.88c2.17-2 3.7-4.94 3.7-8.69z"
      />
      <path
        fill="#FBBC05"
        d="M5.11 14.61c-.24-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29L1.45 7.19C.53 9.03 0 11.11 0 13.32s.53 4.29 1.45 6.13l3.66-2.84z"
      />
      <path
        fill="#34A853"
        d="M12 23.64c3.24 0 5.95-1.08 7.93-2.91l-3.71-2.88c-1.07.72-2.45 1.15-4.22 1.15-3.22 0-5.99-2.38-6.89-5.39L1.45 16.45C3.4 20.34 7.37 23.64 12 23.64z"
      />
    </svg>
  );

  if (!isAuthenticated) {
    return (
      <button
        id="btn-google-login-header"
        onClick={onOpenAuthModal}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.35rem 0.75rem',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-full)',
          color: 'var(--text-main)',
          fontSize: '0.75rem',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}
        title="Iniciar sesión con Google para sincronizar tus exámenes y progreso en la nube"
      >
        <GoogleIcon />
        <span className="hide-on-mobile">Acceder</span>
      </button>
    );
  }

  const userMetadata = user.user_metadata || {};
  const avatarUrl = userMetadata.avatar_url || userMetadata.picture;
  const fullName = userMetadata.full_name || userMetadata.name || user.email?.split('@')[0] || 'Médico SERUMS';
  const email = user.email || '';

  return (
    <div style={{ position: 'relative' }} ref={menuRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.2rem 0.5rem 0.2rem 0.25rem',
          background: isAdmin ? 'rgba(139, 92, 246, 0.15)' : 'rgba(2, 132, 199, 0.1)',
          border: `1px solid ${isAdmin ? 'rgba(139, 92, 246, 0.4)' : 'rgba(2, 132, 199, 0.3)'}`,
          borderRadius: 'var(--radius-full)',
          cursor: 'pointer'
        }}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={fullName}
            style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: isAdmin ? '#8b5cf6' : 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700 }}>
            {isAdmin ? '🛡️' : fullName.charAt(0).toUpperCase()}
          </div>
        )}
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} className="hide-on-mobile">
          {isAdmin ? 'Admin' : fullName.split(' ')[0]}
        </span>
        <ChevronDown size={13} color="var(--text-muted)" />
      </button>

      {dropdownOpen && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 6px)',
            width: '230px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
            zIndex: 1000,
            animation: 'fadeIn 0.15s ease-out'
          }}
        >
          <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span>{fullName}</span>
              <CheckCircle2 size={13} color="#10b981" />
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {email}
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.35rem', background: isAdmin ? 'rgba(139, 92, 246, 0.2)' : 'rgba(2, 132, 199, 0.15)', color: isAdmin ? '#a78bfa' : 'var(--primary)', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.66rem', fontWeight: 700 }}>
              <Sparkles size={10} /> {isAdmin ? 'Administrador Maestro 🛡️' : 'Médico Postulante 2027'}
            </div>
          </div>

          <button
            onClick={() => {
              logout();
              setDropdownOpen(false);
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.4rem 0.5rem',
              background: 'transparent',
              border: 'none',
              borderRadius: 'var(--radius-xs)',
              color: 'var(--danger)',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <LogOut size={14} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      )}
    </div>
  );
}

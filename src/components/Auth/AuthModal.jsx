import React, { useState } from 'react';
import { X, ShieldCheck, Sparkles, Cloud, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export function AuthModal({ isOpen, onClose }) {
  const { loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
    } catch (err) {
      setError(err.message || 'Error al conectar con Google OAuth 2.');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={onClose}>
      <div
        className="modal-content"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-lg)',
          width: '100%',
          maxWidth: '440px',
          padding: '1.5rem',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          textAlign: 'center'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.25rem' }}>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        {/* Logo & Header */}
        <div style={{ width: '48px', height: '48px', margin: '0 auto 0.85rem auto', background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(2, 132, 199, 0.3)' }}>
          <Sparkles size={24} color="var(--primary)" />
        </div>

        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.4rem 0', color: 'var(--text-main)' }}>
          Acceso CODESOFT SERUMS
        </h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 1.25rem 0', lineHeight: 1.45 }}>
          Inicia sesión con tu cuenta de Google para sincronizar automáticamente tus exámenes, banco de fallos y simulacros en la nube.
        </p>

        {/* Benefits List */}
        <div style={{ textAlign: 'left', background: 'var(--bg-surface)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', marginBottom: '1.25rem', fontSize: '0.78rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem', color: 'var(--text-main)' }}>
            <CheckCircle size={14} color="#10b981" />
            <span>Sincronización multi-dispositivo (PC, Tablet, Móvil)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem', color: 'var(--text-main)' }}>
            <CheckCircle size={14} color="#10b981" />
            <span>Historial y estadísticas de puntaje vigesimal guardados</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)' }}>
            <CheckCircle size={14} color="#10b981" />
            <span>Respaldo instantáneo en Supabase Cloud</span>
          </div>
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', color: 'var(--danger)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-xs)', fontSize: '0.75rem', marginBottom: '1rem', textAlign: 'left' }}>
            <AlertCircle size={14} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Google OAuth Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.65rem',
            padding: '0.7rem 1rem',
            background: '#ffffff',
            border: '1px solid #dadce0',
            borderRadius: 'var(--radius-sm)',
            color: '#3c4043',
            fontSize: '0.86rem',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
            transition: 'background 0.2s ease',
            marginBottom: '0.85rem'
          }}
        >
          {loading ? (
            <RefreshCw size={16} className="animate-spin" color="var(--primary)" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24">
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
          )}
          <span>{loading ? 'Conectando con Google...' : 'Continuar con Google'}</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          <ShieldCheck size={13} color="#10b981" />
          <span>Acceso seguro protegido por Supabase Auth & Google Cloud</span>
        </div>
      </div>
    </div>
  );
}

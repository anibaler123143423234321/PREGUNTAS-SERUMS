import React, { useState } from 'react';
import { Stethoscope, Sparkles, ShieldCheck, Mail, Lock, User, ArrowRight, CheckCircle2, RefreshCw, AlertCircle, Award, Database, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { sanitizeInput, isValidEmail } from '../../utils/securitySanitizer';
import { PulseRadarLoader, EcgHeartbeatLoader } from '../Common/AnimatedIcons';

export function AuthGate() {
  const { loginWithGoogle, loginWithEmail, registerWithEmail, loading, error: authError } = useAuth();
  const [authMode, setAuthMode] = useState('login'); // 'login' o 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setRegisterSuccess(false);

    const cleanEmail = sanitizeInput(email).toLowerCase();
    const cleanName = sanitizeInput(fullName, { maxLength: 80 });

    if (!cleanEmail || !password) {
      setLocalError('Por favor completa todos los campos requeridos.');
      return;
    }

    if (!isValidEmail(cleanEmail)) {
      setLocalError('Por favor ingresa un formato de correo electrónico válido.');
      return;
    }

    if (password.length < 6) {
      setLocalError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (authMode === 'register') {
        const data = await registerWithEmail(cleanEmail, password, cleanName);
        if (data?.user && !data.session) {
          setRegisterSuccess(true);
        }
      } else {
        await loginWithEmail(cleanEmail, password);
      }
    } catch (err) {
      setLocalError(err.message || 'Error en la autenticación.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLocalError('');
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      setLocalError(err.message || 'Error al conectar con Google OAuth.');
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem 1rem' }}>
      
      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem', maxWidth: '520px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', background: 'linear-gradient(135deg, var(--primary) 0%, #8b5cf6 100%)', borderRadius: '16px', color: '#fff', boxShadow: '0 8px 24px rgba(2, 132, 199, 0.35)', marginBottom: '0.85rem' }}>
          <Stethoscope size={30} strokeWidth={2.5} />
        </div>
        <h1 style={{ fontSize: '1.65rem', fontWeight: 900, color: 'var(--text-main)', margin: '0 0 0.35rem 0', letterSpacing: '-0.02em' }}>
          CODESOFT <span style={{ color: 'var(--primary)' }}>SERUMS 2027</span>
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
          Plataforma de Simulación & Evaluación Médica Oficial del MINSA (Ley 23330)
        </p>
      </div>

      {/* Main Auth Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.75rem',
          boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
          marginBottom: '1.5rem'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 0.3rem 0' }}>
            {authMode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta Gratuita'}
          </h2>
          <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: 0 }}>
            {authMode === 'login' 
              ? 'Accede para sincronizar tus respuestas, banco de fallos y simulacros'
              : 'Regístrate para guardar tu progreso médico en la nube de Supabase'}
          </p>
        </div>

        {/* 1-Click Google OAuth Button */}
        <button
          id="btn-auth-gate-google"
          type="button"
          onClick={handleGoogleAuth}
          disabled={isSubmitting || loading}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.65rem',
            padding: '0.68rem 1rem',
            background: '#ffffff',
            border: '1px solid #dadce0',
            borderRadius: 'var(--radius-sm)',
            color: '#3c4043',
            fontSize: '0.84rem',
            fontWeight: 700,
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            boxShadow: '0 2px 5px rgba(0,0,0,0.12)',
            transition: 'all 0.2s ease',
            marginBottom: '1.1rem'
          }}
        >
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
          <span>Continuar con Google</span>
        </button>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.1rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>o con tu correo</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
        </div>

        {/* Error Alert */}
        {(localError || authError) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', color: 'var(--danger)', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-xs)', fontSize: '0.76rem', marginBottom: '1rem' }}>
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>{localError || authError}</span>
          </div>
        )}

        {/* Register Success Alert */}
        {registerSuccess && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10b981', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-xs)', fontSize: '0.76rem', marginBottom: '1rem' }}>
            <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
            <span>¡Cuenta creada con éxito! Revisa tu correo o inicia sesión con tus credenciales.</span>
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {authMode === 'register' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                Nombre Completo / Médico:
              </label>
              <div style={{ position: 'relative' }}>
                <User size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Dr(a). Nombre y Apellido"
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem 0.55rem 2.2rem',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-main)',
                    fontSize: '0.82rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
              Correo Electrónico:
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="medico@hospital.gob.pe o personal"
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem 0.55rem 2.2rem',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-main)',
                  fontSize: '0.82rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
              Contraseña:
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                style={{
                  width: '100%',
                  padding: '0.55rem 2.5rem 0.55rem 2.2rem',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-main)',
                  fontSize: '0.82rem',
                  outline: 'none'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '0.65rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              fontSize: '0.82rem',
              fontWeight: 700,
              marginTop: '0.35rem'
            }}
          >
            {isSubmitting ? (
              <PulseRadarLoader size={16} color="#ffffff" />
            ) : (
              <>
                <span>{authMode === 'login' ? 'Ingresar a la Plataforma' : 'Crear Cuenta'}</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>

        {/* Switch Login / Register */}
        <div style={{ textAlign: 'center', marginTop: '1.1rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
          {authMode === 'login' ? (
            <span>
              ¿No tienes cuenta aún?{' '}
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setLocalError('');
                }}
                style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
              >
                Regístrate gratis
              </button>
            </span>
          ) : (
            <span>
              ¿Ya tienes una cuenta?{' '}
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setLocalError('');
                }}
                style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
              >
                Inicia sesión
              </button>
            </span>
          )}
        </div>
      </div>

      {/* Trust & Features Footer Badges */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', maxWidth: '780px', width: '100%' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '0.65rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: '0.73rem', color: 'var(--text-secondary)' }}>
            <strong>Generador IA Ultra-Rápido</strong> (~2.5s) con Groq LPU y casos de 25 regiones
          </span>
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '0.65rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Award size={16} color="#f59e0b" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: '0.73rem', color: 'var(--text-secondary)' }}>
            <strong>Normas NTS MINSA 2024-2026</strong> (Anemia 213, TB 221, Dengue 211)
          </span>
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '0.65rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Database size={16} color="#10b981" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: '0.73rem', color: 'var(--text-secondary)' }}>
            <strong>Sincronización en Nube</strong> de respuestas, fallos y simulacros
          </span>
        </div>
      </div>
    </div>
  );
}

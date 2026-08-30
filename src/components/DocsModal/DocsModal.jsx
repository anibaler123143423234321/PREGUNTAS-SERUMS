import React, { useState } from 'react';
import { X, BookOpen, Cpu, Database, Award, MapPin, ExternalLink, ShieldCheck, Zap, Copy, Check } from 'lucide-react';

export function DocsModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('ai_limits');
  const [copiedSql, setCopiedSql] = useState(false);

  if (!isOpen) return null;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const sqlSchema = `-- TABLA OFICIAL EN SUPABASE: preguntas_ia
CREATE TABLE IF NOT EXISTS public.preguntas_ia (
    id TEXT PRIMARY KEY,
    question TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_answer VARCHAR(5) NOT NULL,
    category VARCHAR(50) DEFAULT 'salud_publica',
    difficulty VARCHAR(50) DEFAULT 'standard',
    year TEXT DEFAULT 'Generado con IA (Groq LPU)',
    why_this_question TEXT,
    explanation TEXT,
    pearl TEXT,
    "references" TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Actualizar columnas si ya tenías la tabla creada:
ALTER TABLE public.preguntas_ia ADD COLUMN IF NOT EXISTS option_a TEXT;
ALTER TABLE public.preguntas_ia ADD COLUMN IF NOT EXISTS option_b TEXT;
ALTER TABLE public.preguntas_ia ADD COLUMN IF NOT EXISTS option_c TEXT;
ALTER TABLE public.preguntas_ia ADD COLUMN IF NOT EXISTS option_d TEXT;
ALTER TABLE public.preguntas_ia ADD COLUMN IF NOT EXISTS difficulty VARCHAR(50) DEFAULT 'standard';
ALTER TABLE public.preguntas_ia DROP COLUMN IF EXISTS options;
ALTER TABLE public.preguntas_ia DROP COLUMN IF EXISTS full_json;

-- Habilitar Políticas RLS
ALTER TABLE public.preguntas_ia ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir lectura publica de preguntas" ON public.preguntas_ia FOR SELECT USING (true);
CREATE POLICY "Permitir insercion con clave anon" ON public.preguntas_ia FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir actualizacion con clave anon" ON public.preguntas_ia FOR UPDATE USING (true);`;

  return (
    <div className="modal-overlay" style={{ zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={onClose}>
      <div
        className="modal-content"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-lg)',
          width: '100%',
          maxWidth: '850px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ padding: '0.4rem', background: 'rgba(2, 132, 199, 0.15)', color: 'var(--primary)', borderRadius: 'var(--radius-sm)' }}>
              <BookOpen size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Centro de Documentación Técnica</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>Guía oficial de Motores de IA, Cuotas, Supabase Cloud y Normativa SERUMS 2026</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.3rem' }}>
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '0.35rem', padding: '0.6rem 1.25rem', background: 'var(--bg-surface-secondary)', borderBottom: '1px solid var(--border-subtle)', overflowX: 'auto' }}>
          <button
            onClick={() => setActiveTab('ai_limits')}
            style={{
              padding: '0.4rem 0.75rem',
              fontSize: '0.78rem',
              fontWeight: 700,
              borderRadius: 'var(--radius-xs)',
              border: 'none',
              background: activeTab === 'ai_limits' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'ai_limits' ? '#fff' : 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <Zap size={14} /> Motores de IA & Cuotas
          </button>
          <button
            onClick={() => setActiveTab('supabase')}
            style={{
              padding: '0.4rem 0.75rem',
              fontSize: '0.78rem',
              fontWeight: 700,
              borderRadius: 'var(--radius-xs)',
              border: 'none',
              background: activeTab === 'supabase' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'supabase' ? '#fff' : 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <Database size={14} /> Supabase Cloud & SQL
          </button>
          <button
            onClick={() => setActiveTab('normativa')}
            style={{
              padding: '0.4rem 0.75rem',
              fontSize: '0.78rem',
              fontWeight: 700,
              borderRadius: 'var(--radius-xs)',
              border: 'none',
              background: activeTab === 'normativa' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'normativa' ? '#fff' : 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <Award size={14} /> Normativa MINSA NTS
          </button>
          <button
            onClick={() => setActiveTab('oauth')}
            style={{
              padding: '0.4rem 0.75rem',
              fontSize: '0.78rem',
              fontWeight: 700,
              borderRadius: 'var(--radius-xs)',
              border: 'none',
              background: activeTab === 'oauth' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'oauth' ? '#fff' : 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <ShieldCheck size={14} /> Google OAuth 2.0 (Login)
          </button>
          <button
            onClick={() => setActiveTab('geografia')}
            style={{
              padding: '0.4rem 0.75rem',
              fontSize: '0.78rem',
              fontWeight: 700,
              borderRadius: 'var(--radius-xs)',
              border: 'none',
              background: activeTab === 'geografia' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'geografia' ? '#fff' : 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <MapPin size={14} /> Diversidad Geográfica (25 Regiones)
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '1.25rem', overflowY: 'auto', flex: 1, fontSize: '0.84rem', lineHeight: 1.55 }}>
          {/* TAB 1: Motores de IA y Cuotas */}
          {activeTab === 'ai_limits' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Cpu size={16} color="var(--primary)" /> Límites Oficiales de Groq Cloud (Free Tier)
                </h4>
                <a href="https://console.groq.com/docs/rate-limits" target="_blank" rel="noreferrer" style={{ fontSize: '0.74rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  Doc Oficial Groq <ExternalLink size={12} />
                </a>
              </div>

              <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', border: '1px solid var(--border-subtle)' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-surface-secondary)', textAlign: 'left' }}>
                      <th style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>Modelo de IA</th>
                      <th style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>Req / Minuto (RPM)</th>
                      <th style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>Req / Día (RPD)</th>
                      <th style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>Tokens / Día</th>
                      <th style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>Velocidad Promedio</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(2, 132, 199, 0.05)' }}>
                      <td style={{ padding: '0.5rem', fontWeight: 700, color: 'var(--primary)' }}>openai/gpt-oss-120b (Activo)</td>
                      <td style={{ padding: '0.5rem' }}>30 req/min</td>
                      <td style={{ padding: '0.5rem', fontWeight: 700 }}>1,000 preguntas/día</td>
                      <td style={{ padding: '0.5rem' }}>200,000 tok/día</td>
                      <td style={{ padding: '0.5rem', color: '#10b981', fontWeight: 700 }}>~2.5 segundos</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '0.5rem' }}>qwen/qwen3.8-27b</td>
                      <td style={{ padding: '0.5rem' }}>30 req/min</td>
                      <td style={{ padding: '0.5rem' }}>1,000 preguntas/día</td>
                      <td style={{ padding: '0.5rem' }}>2,000,000 tok/día</td>
                      <td style={{ padding: '0.5rem' }}>~1.8 segundos</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '0.5rem' }}>NVIDIA NIM (LLaMA 3.2 Vision)</td>
                      <td style={{ padding: '0.5rem' }}>10 req/min</td>
                      <td style={{ padding: '0.5rem' }}>1,000 créditos totales</td>
                      <td style={{ padding: '0.5rem' }}>Variable</td>
                      <td style={{ padding: '0.5rem', color: 'var(--text-muted)' }}>~24 segundos</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div style={{ background: 'var(--bg-surface)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', marginBottom: '0.75rem' }}>
                <h5 style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <ShieldCheck size={14} color="#10b981" /> ¿Cómo se renueva tu cuota?
                </h5>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  <li>Tu límite de <strong>1,000 preguntas al día</strong> se reinicia automáticamente cada 24 horas a las <strong>00:00 UTC</strong> (7:00 PM hora peruana).</li>
                  <li>No hay ningún costo ni cobro sorpresa. Es 100% permanente en el nivel gratuito.</li>
                  <li>Si necesitas más claves, puedes crear API keys adicionales en <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>console.groq.com</a>.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: Supabase Cloud */}
          {activeTab === 'supabase' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Database size={16} color="var(--primary)" /> Esquema Relacional de Base de Datos (PostgreSQL)
                </h4>
                <button onClick={() => copyToClipboard(sqlSchema)} className="action-btn-sm" style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  {copiedSql ? <Check size={12} color="#10b981" /> : <Copy size={12} />} {copiedSql ? 'Copiado' : 'Copiar SQL'}
                </button>
              </div>

              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Las preguntas se guardan con columnas independientes para cada alternativa (<strong>option_a, option_b, option_c, option_d</strong>), facilitando la lectura directa y exportación.
              </p>

              <pre style={{ background: 'var(--bg-surface-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)', padding: '0.75rem', fontSize: '0.74rem', overflowX: 'auto', color: 'var(--text-main)', marginBottom: '0.75rem' }}>
                {sqlSchema}
              </pre>

              <div style={{ background: 'rgba(2, 132, 199, 0.05)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(2, 132, 199, 0.2)' }}>
                <h5 style={{ fontSize: '0.8rem', fontWeight: 700, margin: '0 0 0.25rem 0', color: 'var(--primary)' }}>Variables en .env:</h5>
                <code style={{ fontSize: '0.74rem', display: 'block' }}>VITE_SUPABASE_URL=https://sohwmpvtxnqyifsiomxo.supabase.co</code>
                <code style={{ fontSize: '0.74rem', display: 'block' }}>VITE_SUPABASE_ANON_KEY=sb_publishable_...</code>
                <code style={{ fontSize: '0.74rem', display: 'block' }}>VITE_GROQ_API_KEY=gsk_...</code>
              </div>
            </div>
          )}

          {/* TAB 3: Normativa MINSA */}
          {activeTab === 'normativa' && (
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Award size={16} color="var(--primary)" /> Calibración con Normas Técnicas de Salud (NTS)
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.65rem' }}>
                <div style={{ background: 'var(--bg-surface)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <strong style={{ color: 'var(--primary)', fontSize: '0.8rem' }}>NTS N° 213-MINSA/DGIESP-2024</strong>
                  <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Manejo integral y prevención de la anemia en el niño menor de 36 meses. Dosificación preventiva de 2 mg/kg/día y terapéutica de 3 mg/kg/día por 6 meses.
                  </p>
                </div>

                <div style={{ background: 'var(--bg-surface)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <strong style={{ color: 'var(--primary)', fontSize: '0.8rem' }}>NTS N° 221-MINSA/DGIESP-2024</strong>
                  <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Prevención y control de la Tuberculosis. Diagnóstico molecular con GeneXpert MTB/RIF, esquema 2HREZ/4H3R3 y TPT con esquema semanal 3HP.
                  </p>
                </div>

                <div style={{ background: 'var(--bg-surface)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <strong style={{ color: 'var(--primary)', fontSize: '0.8rem' }}>NTS N° 211-MINSA (Dengue)</strong>
                  <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Manejo de Dengue con signos de alarma. Hidratación endovenosa inmediata con ClNa 0.9% y contraindicación absoluta de AINEs y vía intramuscular.
                  </p>
                </div>

                <div style={{ background: 'var(--bg-surface)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <strong style={{ color: 'var(--primary)', fontSize: '0.8rem' }}>Código Rojo & Preeclampsia Zuspan</strong>
                  <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Protocolo de hemorragia posparto (4T, Oxitocina, Ácido Tranexámico 1g IV) y prevención de eclampsia con Sulfato de Magnesio (bolo 4g + infusión 1-2g/h).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB: Google OAuth 2.0 */}
          {activeTab === 'oauth' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <ShieldCheck size={16} color="#10b981" /> Guía de Activación: Google OAuth 2.0 en Supabase
                </h4>
                <a href="https://supabase.com/docs/guides/auth/social-login/auth-google" target="_blank" rel="noreferrer" style={{ fontSize: '0.74rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  Doc Supabase Google Auth <ExternalLink size={12} />
                </a>
              </div>

              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
                El sistema ya cuenta con el módulo completo de autenticación. Para habilitar el inicio de sesión con Google en producción, solo debes seguir estos 3 pasos:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ background: 'var(--bg-surface)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <strong style={{ color: 'var(--primary)', fontSize: '0.82rem' }}>1. Crear Credenciales en Google Cloud Console</strong>
                  <ul style={{ margin: '0.3rem 0 0 0', paddingLeft: '1.2rem', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                    <li>Ingresa a <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>Google Cloud Console &gt; Credenciales</a>.</li>
                    <li>Crea un <strong>ID de cliente de OAuth 2.0</strong> de tipo <em>Aplicación Web</em>.</li>
                    <li>En <strong>URIs de redireccionamiento autorizados</strong>, coloca la URL de callback de tu Supabase:
                      <code style={{ display: 'block', background: 'var(--bg-surface-secondary)', padding: '0.3rem', margin: '0.25rem 0', borderRadius: '3px', color: 'var(--primary)' }}>
                        https://sohwmpvtxnqyifsiomxo.supabase.co/auth/v1/callback
                      </code>
                    </li>
                  </ul>
                </div>

                <div style={{ background: 'var(--bg-surface)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <strong style={{ color: 'var(--primary)', fontSize: '0.82rem' }}>2. Activar Proveedor Google en Supabase Dashboard</strong>
                  <ul style={{ margin: '0.3rem 0 0 0', paddingLeft: '1.2rem', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                    <li>Ve a tu proyecto en <a href="https://supabase.com/dashboard/project/sohwmpvtxnqyifsiomxo/auth/providers" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>Supabase &gt; Authentication &gt; Providers</a>.</li>
                    <li>Activa el toggle de <strong>Google</strong>.</li>
                    <li>Pega tu <strong>Client ID</strong> y <strong>Client Secret</strong> generados en Google Cloud y guarda los cambios.</li>
                  </ul>
                </div>

                <div style={{ background: 'var(--bg-surface)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <strong style={{ color: 'var(--primary)', fontSize: '0.82rem' }}>3. ¡Listo! Acceso Médico Multi-Dispositivo</strong>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                    Los médicos podrán hacer clic en <strong>"Acceder"</strong> o <strong>"Continuar con Google"</strong> y su sesión, avatar, exámenes y errores se respaldarán automáticamente en la nube.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Geografía Nacional */}
          {activeTab === 'geografia' && (
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <MapPin size={16} color="var(--primary)" /> Cobertura Geográfica de las 25 Regiones del Perú
              </h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                El generador rota aleatoriamente entre 47 establecimientos del MINSA con su altitud, provincia y realidad epidemiológica local:
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.4rem', fontSize: '0.72rem' }}>
                <div style={{ padding: '0.4rem 0.6rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)' }}>
                  <strong>🏔️ Puno</strong>: Macusani (4,315m), Asillo, Cojata
                </div>
                <div style={{ padding: '0.4rem 0.6rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)' }}>
                  <strong>🏔️ Cusco</strong>: Espinar (3,928m), Quillabamba, Paucartambo
                </div>
                <div style={{ padding: '0.4rem 0.6rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)' }}>
                  <strong>🌴 VRAEM / Ayacucho</strong>: Llochegua, Chuschi, Puquio
                </div>
                <div style={{ padding: '0.4rem 0.6rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)' }}>
                  <strong>🌴 Junín</strong>: San Martín de Pangoa, Pichanaqui, Tarma
                </div>
                <div style={{ padding: '0.4rem 0.6rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)' }}>
                  <strong>🌴 Amazonas</strong>: Nieva (Awajún), Imaza, Lamud
                </div>
                <div style={{ padding: '0.4rem 0.6rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)' }}>
                  <strong>🌴 San Martín</strong>: Juanjuí, Jepelacio, San Pablo
                </div>
                <div style={{ padding: '0.4rem 0.6rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)' }}>
                  <strong>🌾 Piura</strong>: Canchaque, Paimas, Lancones (Frontera)
                </div>
                <div style={{ padding: '0.4rem 0.6rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)' }}>
                  <strong>🌾 Cajamarca</strong>: San Ignacio, Chota, Jaén
                </div>
                <div style={{ padding: '0.4rem 0.6rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)' }}>
                  <strong>🏔️ Huancavelica</strong>: Pampas (3,276m), Lircay
                </div>
                <div style={{ padding: '0.4rem 0.6rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)' }}>
                  <strong>🏔️ Ancash</strong>: Chavín de Huántar, Marcará
                </div>
                <div style={{ padding: '0.4rem 0.6rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)' }}>
                  <strong>🌊 Costa Sur</strong>: Paracas, Pisco, Palpa, Nazca
                </div>
                <div style={{ padding: '0.4rem 0.6rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)' }}>
                  <strong>🏔️ Arequipa / Colca</strong>: Chivay (3,635m)
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>CODESOFT SERUMS 2027 • Plataforma Médica Oficial</span>
          <button className="action-btn" onClick={onClose} style={{ fontSize: '0.76rem', padding: '0.35rem 0.85rem' }}>
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}

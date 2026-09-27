import React from 'react';
import { X, Check, GraduationCap } from 'lucide-react';
import { CAREER_LIST } from '../../data/careers';

// Selector de carrera SERUMS.
// - Sin onClose: pantalla completa obligatoria (primer ingreso).
// - Con onClose: modal para cambiar de carrera en cualquier momento.
export function CareerSelector({ currentCareerId, onSelect, onClose, bankCounts = {} }) {
  const isOnboarding = !onClose;

  const content = (
    <div
      className="career-selector-card"
      onClick={(e) => e.stopPropagation()}
      style={{
        width: '100%',
        maxWidth: '780px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem',
        boxShadow: 'var(--shadow-lg)',
        maxHeight: isOnboarding ? 'none' : '90vh',
        overflowY: 'auto'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1.1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--primary)', fontWeight: 800, fontSize: '0.78rem', marginBottom: '0.3rem' }}>
            <GraduationCap size={16} />
            <span>SERUMS · Evaluación por carrera</span>
          </div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 0.3rem 0', color: 'var(--text-main)' }}>
            ¿Cuál es tu carrera?
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
            Te mostraremos las preguntas de tu carrera y el generador IA se adaptará a ella.
            {isOnboarding && ' Puedes cambiarla cuando quieras desde la barra superior.'}
          </p>
        </div>
        {!isOnboarding && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar selector de carrera"
            className="icon-circle-btn"
            style={{ background: 'var(--bg-surface)', color: 'var(--text-main)', border: '1px solid var(--border-medium)' }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '0.55rem' }}>
        {CAREER_LIST.map((career) => {
          const isSelected = currentCareerId === career.id;
          const count = bankCounts[career.id] || 0;
          return (
            <button
              key={career.id}
              type="button"
              id={`career-option-${career.id}`}
              onClick={() => onSelect(career.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.7rem 0.8rem',
                borderRadius: 'var(--radius-md)',
                background: isSelected ? 'var(--primary-light)' : 'var(--bg-surface)',
                border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-medium)',
                color: 'var(--text-main)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'var(--transition)'
              }}
            >
              <span style={{ fontSize: '1.5rem', lineHeight: 1, flexShrink: 0 }} aria-hidden="true">{career.emoji}</span>
              <span style={{ minWidth: 0, flex: 1 }}>
                <strong style={{ display: 'block', fontSize: '0.88rem' }}>{career.name}</strong>
                <span style={{ display: 'block', fontSize: '0.72rem', color: count > 0 ? 'var(--success)' : 'var(--text-muted)', fontWeight: count > 0 ? 700 : 500 }}>
                  {count > 0 ? `${count} preguntas oficiales + IA` : 'Generador IA (banco oficial pendiente)'}
                </span>
              </span>
              {isSelected && (
                <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Check size={13} strokeWidth={3} />
                </span>
              )}
            </button>
          );
        })}
      </div>

      <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: '1rem 0 0 0', lineHeight: 1.45 }}>
        La modalidad de plaza (remunerada o equivalente) no cambia el contenido de la evaluación: elige solo tu carrera.
      </p>
    </div>
  );

  if (isOnboarding) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-app)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem 1rem' }}>
        {content}
      </div>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(2, 6, 23, 0.7)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
    >
      {content}
    </div>
  );
}

// Aviso para carreras que todavía no tienen cuadernillos oficiales cargados.
export function NoOfficialBank({ career, onGoToAi, onChangeCareer }) {
  return (
    <div style={{ maxWidth: '680px', margin: '1rem auto', background: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-lg)', padding: '1.75rem', textAlign: 'center', boxShadow: 'var(--shadow-md)' }}>
      <div style={{ fontSize: '2.4rem', marginBottom: '0.6rem' }} aria-hidden="true">{career.emoji}</div>
      <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>
        Aún no hay exámenes oficiales de {career.name}
      </h2>
      <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.55, margin: '0 0 1.25rem 0' }}>
        El simulacro, el modo tutor, las flashcards y el buscador usan los cuadernillos oficiales del MINSA,
        y por ahora solo están cargados los de Medicina Humana. Mientras tanto puedes practicar con el
        Generador IA, que ya está adaptado a {career.name}.
      </p>
      <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button type="button" className="btn-primary" onClick={onGoToAi} style={{ padding: '0.6rem 1.2rem', fontWeight: 700 }}>
          Ir al Generador IA
        </button>
        <button type="button" className="btn-secondary" onClick={onChangeCareer} style={{ padding: '0.6rem 1.2rem' }}>
          Cambiar carrera
        </button>
      </div>
    </div>
  );
}

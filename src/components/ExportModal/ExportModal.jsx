import React, { useState } from 'react';
import { Printer, X, FileText, CheckCircle2, Sparkles } from 'lucide-react';
import { EXAM_YEARS, CATEGORIES } from '../../data/categories';

export function ExportModal({
  allQuestions,
  onClose
}) {
  const [selectedYear, setSelectedYear] = useState('2026-I');
  const [showAnswers, setShowAnswers] = useState(false);
  const [showPearls, setShowPearls] = useState(false);

  const printQuestions = allQuestions.filter((q) => {
    if (selectedYear === 'all') return true;
    return q.year === selectedYear;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop" id="export-modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Printer size={22} color="var(--primary)" />
              Exportar e Imprimir Examen SERUMS
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Genera una versión lista para imprimir o guardar como PDF para estudio físico.
            </p>
          </div>
          <button className="tool-icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Configuration Controls */}
        <div style={{ background: 'var(--bg-surface)', padding: '1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', fontWeight: 600 }}>
              Proceso a Imprimir:
            </label>
            <select
              className="exam-selector-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {EXAM_YEARS.map((y) => (
                <option key={y.id} value={y.id}>
                  {y.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', marginTop: '1.25rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={showAnswers}
                onChange={(e) => setShowAnswers(e.target.checked)}
              />
              <span>Incluir Claves de Respuesta</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={showPearls}
                onChange={(e) => setShowPearls(e.target.checked)}
                disabled={!showAnswers}
                style={{ opacity: !showAnswers ? 0.5 : 1 }}
              />
              <span style={{ opacity: !showAnswers ? 0.5 : 1 }}>Incluir Perlas Clínicas</span>
            </label>
          </div>

          <div style={{ marginLeft: 'auto', marginTop: '1rem' }}>
            <button className="btn-primary" onClick={handlePrint}>
              <Printer size={17} />
              <span>Imprimir / Guardar PDF ({printQuestions.length} Preguntas)</span>
            </button>
          </div>
        </div>

        {/* Printable Document Preview */}
        <div style={{ maxHeight: '420px', overflowY: 'auto', padding: '1rem', background: 'var(--bg-app)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '2px solid var(--border-medium)' }}>
            <h3 style={{ fontSize: '1.2rem' }}>MINISTERIO DE SALUD DEL PERÚ — EXAMEN SERUMS MEDICINA</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Proceso Oficial: {selectedYear === 'all' ? 'Banco Consolidado 2024-2026' : selectedYear} • 100 Preguntas
            </p>
          </div>

          {printQuestions.map((q, idx) => (
            <div key={q.id} style={{ marginBottom: '1.5rem', pageBreakInside: 'avoid' }}>
              <p style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                {idx + 1}. {q.question}
              </p>
              <div style={{ paddingLeft: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem', fontSize: '0.88rem' }}>
                {Object.entries(q.options).map(([letter, text]) => {
                  const isCorrect = showAnswers && letter === q.correctAnswer;
                  return (
                    <div
                      key={letter}
                      style={{
                        color: isCorrect ? 'var(--success)' : 'var(--text-main)',
                        fontWeight: isCorrect ? 700 : 400
                      }}
                    >
                      <strong>{letter})</strong> {text} {isCorrect ? '✓' : ''}
                    </div>
                  );
                })}
              </div>

              {showAnswers && showPearls && (
                <div style={{ marginTop: '0.5rem', padding: '0.5rem 0.75rem', background: 'var(--bg-card)', borderRadius: '4px', fontSize: '0.82rem', color: 'var(--text-secondary)', borderLeft: '3px solid var(--primary)' }}>
                  <strong>Perla SERUMS:</strong> {q.pearl || q.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

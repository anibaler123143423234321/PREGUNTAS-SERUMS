import React, { useState } from 'react';
import { Printer, X, FileText, CheckCircle2, Sparkles, Eye, Download, BookOpen } from 'lucide-react';
import { EXAM_YEARS, CATEGORIES } from '../../data/categories';

export function ExportModal({
  allQuestions,
  onClose
}) {
  const [selectedYear, setSelectedYear] = useState('2026-II');
  const [showAnswers, setShowAnswers] = useState(false);
  const [showPearls, setShowPearls] = useState(false);
  const [columnsLayout, setColumnsLayout] = useState('2'); // '1' o '2' columnas

  const printQuestions = allQuestions.filter((q) => {
    if (selectedYear === 'all') return true;
    return q.year === selectedYear;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop export-modal-backdrop" id="export-modal-backdrop" onClick={onClose}>
      <div className="modal-content export-modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '960px' }}>
        
        {/* Screen Only: Modal Header */}
        <div className="no-print export-dialog-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800 }}>
              <Printer size={22} color="var(--primary)" />
              Exportar e Imprimir Examen SERUMS Oficial
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Genera un cuadernillo oficial de 100 preguntas listo para imprimir o guardar en PDF de alta fidelidad.
            </p>
          </div>
          <button className="tool-icon-btn" onClick={onClose} aria-label="Cerrar modal">
            <X size={18} />
          </button>
        </div>

        {/* Screen Only: Configuration Bar */}
        <div className="no-print export-config-panel" style={{ background: 'var(--bg-surface)', padding: '1.15rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            
            {/* Exam Select */}
            <div style={{ minWidth: '220px' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', fontWeight: 700 }}>
                Proceso Oficial:
              </label>
              <select
                className="exam-selector-select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                style={{ width: '100%', background: 'var(--bg-card)', color: 'var(--text-main)', padding: '0.5rem 0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)' }}
              >
                {EXAM_YEARS.map((y) => (
                  <option key={y.id} value={y.id}>
                    {y.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Layout Options */}
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.88rem', cursor: 'pointer', fontWeight: 500 }}>
                <input
                  type="checkbox"
                  checked={showAnswers}
                  onChange={(e) => setShowAnswers(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                />
                <span>Mostrar Claves de Respuesta</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.88rem', cursor: 'pointer', fontWeight: 500, opacity: !showAnswers ? 0.4 : 1 }}>
                <input
                  type="checkbox"
                  checked={showPearls}
                  onChange={(e) => setShowPearls(e.target.checked)}
                  disabled={!showAnswers}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                />
                <span>Incluir Perlas Clínicas MINSA</span>
              </label>
            </div>

            {/* Action Buttons */}
            <div>
              <button 
                id="btn-trigger-print"
                className="btn-primary" 
                onClick={handlePrint}
                style={{ padding: '0.75rem 1.6rem', fontSize: '0.95rem', fontWeight: 700 }}
              >
                <Printer size={18} />
                <span>Imprimir / Guardar PDF ({printQuestions.length} Preguntas)</span>
              </button>
            </div>

          </div>
        </div>

        {/* Screen Preview Wrapper (scrollable on screen, full-page on print) */}
        <div className="export-preview-scrollable-container" style={{ maxHeight: '440px', overflowY: 'auto', background: 'var(--bg-app)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          
          {/* Official Printable Exam Document (This will print 100% full-page) */}
          <div className="printable-exam-document" id="printable-exam-document">
            
            {/* Official MINSA Header */}
            <div className="print-header-block">
              <div className="print-logo-row">
                <div className="print-institution-title">
                  <h2>MINISTERIO DE SALUD DEL PERÚ</h2>
                  <h3>EVALUACIÓN PARA EL SERVICIO RURAL Y URBANO MARGINAL DE SALUD — SERUMS</h3>
                  <h4>PROFESIÓN: MEDICINA HUMANA</h4>
                </div>
              </div>
              <div className="print-exam-meta-bar">
                <span><strong>PROCESO:</strong> {selectedYear === 'all' ? 'BANCO CONSOLIDADO MINSA (500 PREGUNTAS)' : `EVALUACIÓN OFICIAL ${selectedYear}`}</span>
                <span><strong>TOTAL PREGUNTAS:</strong> {printQuestions.length}</span>
                <span><strong>DURACIÓN OFICIAL:</strong> 120 MINUTOS</span>
              </div>
              <div className="print-instructions-box">
                <p><strong>INSTRUCCIONES:</strong> Lea atentamente cada enunciado y marque la alternativa correspondiente en la ficha óptica. Cada pregunta consta de una única respuesta válida. No se permite el uso de dispositivos electrónicos ni apuntes.</p>
              </div>
            </div>

            {/* Questions List */}
            <div className="print-questions-grid">
              {printQuestions.map((q, idx) => (
                <div key={q.id || idx} className="print-question-item">
                  <div className="print-question-stem">
                    <span className="print-q-number">{idx + 1}.</span> {q.question}
                  </div>
                  
                  <div className="print-options-container">
                    {Object.entries(q.options).map(([letter, text]) => {
                      const isCorrect = showAnswers && letter === q.correctAnswer;
                      return (
                        <div key={letter} className={`print-option-row ${isCorrect ? 'is-correct-answer' : ''}`}>
                          <span className="print-option-letter">{letter})</span>
                          <span className="print-option-text">{text}</span>
                          {isCorrect && <span className="print-correct-mark"> [CLAVE CORRECTA]</span>}
                        </div>
                      );
                    })}
                  </div>

                  {showAnswers && showPearls && (q.pearl || q.explanation) && (
                    <div className="print-pearl-box">
                      <strong>Fundamento & Perla SERUMS:</strong> {q.pearl || q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Answer Key Table at the End (Optional) */}
            {showAnswers && (
              <div className="print-answer-key-section">
                <div className="print-key-header">
                  <h3>CUADRO CONSOLIDADO DE CLAVES OFICIALES</h3>
                  <p>Evaluación SERUMS Medicina — {selectedYear}</p>
                </div>
                <div className="print-key-grid">
                  {printQuestions.map((q, idx) => (
                    <div key={idx} className="print-key-cell">
                      <span className="key-num">{idx + 1}:</span>
                      <span className="key-ans">{q.correctAnswer}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Document Footer */}
            <div className="print-document-footer">
              <p>CODESOFT — Plataforma de Entrenamiento Médico de Alto Rendimiento • SERUMS 2026</p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

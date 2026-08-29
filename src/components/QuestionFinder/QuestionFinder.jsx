import React, { useState, useMemo } from 'react';
import { Search, Filter, Sparkles, CheckCircle2, Bookmark, Eye, X } from 'lucide-react';
import { CATEGORIES, EXAM_YEARS } from '../../data/categories';

export function QuestionFinder({
  allQuestions,
  savedQuestions,
  onToggleSave,
  fontSize
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeQuestionModal, setActiveQuestionModal] = useState(null);

  const filteredList = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return allQuestions.filter((q) => {
      const matchYear = selectedYear === 'all' || q.year === selectedYear;
      const matchCat = selectedCategory === 'all' || q.category === selectedCategory;

      if (!matchYear || !matchCat) return false;

      if (!term) return true;

      const fullText = (
        q.question + ' ' +
        Object.values(q.options).join(' ') + ' ' +
        (q.pearl || '') + ' ' +
        (q.explanation || '')
      ).toLowerCase();

      return fullText.includes(term);
    });
  }, [allQuestions, searchTerm, selectedYear, selectedCategory]);

  return (
    <div className="question-finder-view" id="question-finder-view">
      {/* Search and Filters Bar (Ultra-Compact) */}
      <div style={{ background: 'var(--bg-card)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '1rem' }}>
        <div className="search-bar-container" style={{ marginBottom: '0.65rem' }}>
          <div className="search-input-wrapper" style={{ minWidth: '100%' }}>
            <Search className="search-icon" size={16} />
            <input
              id="search-questions-input"
              type="text"
              placeholder="Buscar término clínico, norma técnica, fármaco (ej. dengue, anemia 2024, Zuspan, GeneXpert)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '0.55rem 0.85rem 0.55rem 2.2rem', fontSize: '0.86rem' }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Process Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', overflowX: 'auto', scrollbarWidth: 'none', marginBottom: '0.5rem', paddingBottom: '0.15rem' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, whiteSpace: 'nowrap', marginRight: '0.2rem' }}>Año:</span>
          {EXAM_YEARS.map((y) => {
            const isSelected = selectedYear === y.id;
            return (
              <button
                key={y.id}
                onClick={() => setSelectedYear(y.id)}
                style={{
                  padding: '0.2rem 0.55rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.73rem',
                  fontWeight: isSelected ? 700 : 500,
                  background: isSelected ? 'var(--primary-gradient)' : 'var(--bg-surface)',
                  color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                  border: isSelected ? '1px solid transparent' : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'var(--transition)'
                }}
              >
                {y.short || y.name}
              </button>
            );
          })}
        </div>

        {/* Category Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', overflowX: 'auto', scrollbarWidth: 'none', marginBottom: '0.65rem', paddingBottom: '0.15rem' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, whiteSpace: 'nowrap', marginRight: '0.2rem' }}>Área:</span>
          {Object.values(CATEGORIES).map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: '0.2rem 0.55rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.73rem',
                  fontWeight: isSelected ? 700 : 500,
                  background: isSelected ? 'var(--primary-gradient)' : 'var(--bg-surface)',
                  color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                  border: isSelected ? '1px solid transparent' : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'var(--transition)'
                }}
              >
                {cat.shortName}
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          <span><strong>{filteredList.length}</strong> preguntas encontradas.</span>
          {(searchTerm || selectedYear !== 'all' || selectedCategory !== 'all') && (
            <button
              style={{ color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', fontSize: '0.75rem' }}
              onClick={() => {
                setSearchTerm('');
                setSelectedYear('all');
                setSelectedCategory('all');
              }}
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Results List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredList.map((q) => {
          const cat = CATEGORIES[q.category] || CATEGORIES.all;
          const isSaved = !!savedQuestions[q.id];

          return (
            <div
              key={q.id}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem',
                cursor: 'pointer',
                transition: 'var(--transition)'
              }}
              onClick={() => setActiveQuestionModal(q)}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                  <span
                    className="category-tag"
                    style={{
                      backgroundColor: cat.bgColor,
                      color: cat.color,
                      border: `1px solid ${cat.borderColor}`
                    }}
                  >
                    {cat.shortName}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {q.year} • Pregunta {q.number}
                  </span>
                </div>
                <p style={{ fontSize: '0.98rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.3rem', lineHeight: 1.5 }}>
                  {q.question}
                </p>
                <p style={{ fontSize: '0.85rem', color: 'var(--success)', fontWeight: 500 }}>
                  Clave {q.correctAnswer}: {q.options[q.correctAnswer]}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={(e) => e.stopPropagation()}>
                <button
                  className={`tool-icon-btn ${isSaved ? 'saved' : ''}`}
                  onClick={() => onToggleSave(q)}
                  title={isSaved ? 'Quitar de guardadas' : 'Guardar en favoritas'}
                >
                  <Bookmark size={16} />
                </button>
                <button
                  className="tool-icon-btn"
                  onClick={() => setActiveQuestionModal(q)}
                  title="Ver detalle completo"
                >
                  <Eye size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Question Details Modal */}
      {activeQuestionModal && (
        <div className="modal-backdrop" onClick={() => setActiveQuestionModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '850px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span
                  className="category-tag"
                  style={{
                    backgroundColor: CATEGORIES[activeQuestionModal.category]?.bgColor || 'var(--bg-surface)',
                    color: CATEGORIES[activeQuestionModal.category]?.color || 'var(--primary)',
                    border: `1px solid ${CATEGORIES[activeQuestionModal.category]?.borderColor || 'var(--border-subtle)'}`
                  }}
                >
                  {CATEGORIES[activeQuestionModal.category]?.name || 'General'}
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {activeQuestionModal.year} • Pregunta {activeQuestionModal.number}
                </span>
              </div>
              <button
                className="tool-icon-btn"
                onClick={() => setActiveQuestionModal(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              {activeQuestionModal.question}
            </div>

            <div className="options-list" style={{ marginBottom: '1.5rem' }}>
              {Object.entries(activeQuestionModal.options).map(([letter, text]) => {
                const isCorrect = letter === activeQuestionModal.correctAnswer;
                return (
                  <div
                    key={letter}
                    className={`option-item ${isCorrect ? 'correct' : ''}`}
                    style={{ cursor: 'default' }}
                  >
                    <div className="option-letter">{letter}</div>
                    <div className="option-text">{text}</div>
                    {isCorrect && (
                      <CheckCircle2 size={20} color="var(--success)" style={{ marginLeft: 'auto' }} />
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: '1.25rem', padding: '1rem 1.15rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
              {activeQuestionModal.whyThisQuestion && (
                <div style={{ marginBottom: '0.85rem', padding: '0.65rem 0.85rem', background: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.25)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#a78bfa', fontWeight: 700, fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                    <Sparkles size={14} />
                    <span>¿Por qué se formuló este caso? (Relevancia SERUMS):</span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-main)', margin: 0, lineHeight: 1.45 }}>
                    {activeQuestionModal.whyThisQuestion}
                  </p>
                </div>
              )}

              <div style={{ marginBottom: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.3rem' }}>
                  <CheckCircle2 size={16} />
                  <span>Fundamento Clínico de la Respuesta:</span>
                </div>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-main)', margin: 0, lineHeight: 1.5 }}>
                  {activeQuestionModal.explanation || activeQuestionModal.pearl}
                </p>
              </div>

              {activeQuestionModal.pearl && activeQuestionModal.pearl !== activeQuestionModal.explanation && (
                <div style={{ marginBottom: activeQuestionModal.references ? '0.85rem' : '0', padding: '0.65rem 0.85rem', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f59e0b', fontWeight: 700, fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                    <Sparkles size={14} />
                    <span>Perla Médica SERUMS:</span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-main)', margin: 0, lineHeight: 1.45 }}>
                    {activeQuestionModal.pearl}
                  </p>
                </div>
              )}

              {activeQuestionModal.references && (
                <div style={{ padding: '0.5rem 0.75rem', background: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.25)', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  <strong style={{ color: '#06b6d4' }}>Referencia Normativa: </strong>
                  <span>{activeQuestionModal.references}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
      {/* Search and Filters Bar */}
      <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', marginBottom: '1.75rem' }}>
        <div className="search-bar-container">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={18} />
            <input
              id="search-questions-input"
              type="text"
              placeholder="Buscar por término clínico, norma técnica, medicamento o concepto (ej. dengue, anemia, oxitocina)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          <select
            className="exam-selector-select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            style={{ background: 'var(--bg-surface)' }}
          >
            {EXAM_YEARS.map((y) => (
              <option key={y.id} value={y.id}>
                {y.name}
              </option>
            ))}
          </select>

          <select
            className="exam-selector-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ background: 'var(--bg-surface)' }}
          >
            {Object.values(CATEGORIES).map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <span>Se encontraron <strong>{filteredList.length}</strong> preguntas que coinciden con tu criterio.</span>
          {searchTerm && (
            <button
              style={{ color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}
              onClick={() => {
                setSearchTerm('');
                setSelectedYear('all');
                setSelectedCategory('all');
              }}
            >
              Restablecer filtros
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

            <div className="pearl-card">
              <div className="pearl-header">
                <Sparkles size={18} />
                <span>Perla Médica & Fundamento SERUMS:</span>
              </div>
              <p className="pearl-body">{activeQuestionModal.pearl || activeQuestionModal.explanation}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

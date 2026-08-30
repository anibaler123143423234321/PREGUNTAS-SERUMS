import React, { useState } from 'react';
import { AlertTriangle, Bookmark, Trash2, Play, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';
import { CATEGORIES } from '../../data/categories';
import { QuestionCard } from '../ExamSimulator/QuestionCard';

export function MistakeBank({
  mistakes,
  onClearMistakes,
  onRemoveMistake,
  savedQuestions,
  onToggleSave,
  fontSize
}) {
  const [activeSubTab, setActiveSubTab] = useState('mistakes'); // 'mistakes' (errores) | 'saved' (guardadas)
  const [practiceMode, setPracticeMode] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});

  const savedList = Object.values(savedQuestions);
  const currentList = activeSubTab === 'mistakes' ? mistakes : savedList;

  const handleStartPractice = () => {
    if (currentList.length > 0) {
      setPracticeMode(true);
      setCurrentIndex(0);
      setUserAnswers({});
    }
  };

  const handleSelectOption = (letter) => {
    const currentQ = currentList[currentIndex];
    if (!currentQ) return;
    setUserAnswers((prev) => ({
      ...prev,
      [currentQ.id]: letter
    }));
  };

  if (practiceMode && currentList.length > 0) {
    const currentQ = currentList[currentIndex];
    const isSaved = currentQ ? !!savedQuestions[currentQ.id] : false;
    const selectedOption = currentQ ? userAnswers[currentQ.id] : null;

    return (
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={20} color="var(--warning)" />
            Entrenamiento Focalizado: {activeSubTab === 'mistakes' ? 'Banco de Errores' : 'Guardadas'}
          </h3>
          <button className="btn-secondary" onClick={() => setPracticeMode(false)}>
            Salir del Entrenamiento
          </button>
        </div>

        {currentQ && (
          <QuestionCard
            question={currentQ}
            currentIndex={currentIndex}
            totalQuestions={currentList.length}
            selectedOption={selectedOption}
            onSelectOption={handleSelectOption}
            onNext={() => currentIndex < currentList.length - 1 && setCurrentIndex(currentIndex + 1)}
            onPrev={() => currentIndex > 0 && setCurrentIndex(currentIndex - 1)}
            isFlagged={false}
            onToggleFlag={() => {}}
            isSaved={isSaved}
            onToggleSave={() => onToggleSave(currentQ)}
            fontSize={fontSize}
            showInstantFeedback={true}
          />
        )}
      </div>
    );
  }

  return (
    <div className="mistake-bank-view" id="mistake-bank-view">
      {/* Subtabs and Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            id="subtab-mistakes"
            className={`btn-secondary ${activeSubTab === 'mistakes' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('mistakes')}
            style={{
              backgroundColor: activeSubTab === 'mistakes' ? 'var(--primary)' : 'var(--bg-surface)',
              color: activeSubTab === 'mistakes' ? '#ffffff' : 'var(--text-secondary)'
            }}
          >
            <AlertTriangle size={17} />
            <span>Preguntas Erradas ({mistakes.length})</span>
          </button>

          <button
            id="subtab-saved"
            className={`btn-secondary ${activeSubTab === 'saved' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('saved')}
            style={{
              backgroundColor: activeSubTab === 'saved' ? 'var(--primary)' : 'var(--bg-surface)',
              color: activeSubTab === 'saved' ? '#ffffff' : 'var(--text-secondary)'
            }}
          >
            <Bookmark size={17} />
            <span>Guardadas / Favoritas ({savedList.length})</span>
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {currentList.length > 0 && (
            <button
              id="btn-practice-mistakes"
              className="btn-primary"
              onClick={handleStartPractice}
            >
              <Play size={16} />
              <span>Entrenar estas {currentList.length} preguntas</span>
            </button>
          )}

          {activeSubTab === 'mistakes' && mistakes.length > 0 && (
            <button
              id="btn-clear-mistakes"
              className="btn-danger"
              onClick={onClearMistakes}
              title="Borrar historial de preguntas falladas"
            >
              <Trash2 size={16} />
              <span>Limpiar Errores</span>
            </button>
          )}
        </div>
      </div>

      {/* List Display */}
      {currentList.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
            {activeSubTab === 'mistakes' ? <CheckCircle2 size={32} color="var(--success)" /> : <Bookmark size={32} color="var(--primary)" />}
          </div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
            {activeSubTab === 'mistakes' ? '¡Excelente! No tienes preguntas erradas registradas.' : 'No tienes preguntas guardadas aún.'}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '480px', margin: '0 auto' }}>
            {activeSubTab === 'mistakes'
              ? 'A medida que completes simulacros, las preguntas en las que falles se guardarán aquí automáticamente para reentrenarlas.'
              : 'Haz clic en el ícono de marcador en cualquier pregunta para guardarla aquí para repaso futuro.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {currentList.map((q, idx) => {
            const cat = CATEGORIES[q.category] || CATEGORIES.all;
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
                  transition: 'var(--transition)'
                }}
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
                  <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
                    {q.question}
                  </p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--success)', fontWeight: 500 }}>
                    Clave {q.correctAnswer}: {q.options[q.correctAnswer]}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {activeSubTab === 'mistakes' && (
                    <button
                      className="tool-icon-btn"
                      onClick={() => onRemoveMistake(q.id)}
                      title="Quitar de la lista de errores"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                  {activeSubTab === 'saved' && (
                    <button
                      className="tool-icon-btn saved"
                      onClick={() => onToggleSave(q)}
                      title="Quitar de guardadas"
                    >
                      <Bookmark size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

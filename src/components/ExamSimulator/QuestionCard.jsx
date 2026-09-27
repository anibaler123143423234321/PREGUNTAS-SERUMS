import React, { useState, useEffect } from 'react';
import { Flag, Bookmark, Sparkles, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Target, BookOpen, Bot, RefreshCw } from 'lucide-react';
import { CATEGORIES } from '../../data/categories';
import { explainOfficialQuestion } from '../../services/aiService';
import { useCareer } from '../../context/CareerContext';

// Explicaciones IA de preguntas oficiales, guardadas en el navegador para no repetir llamadas
const EXPLANATION_CACHE_KEY = 'serums_ai_explanations';
const MAX_CACHED_EXPLANATIONS = 500;

function readCachedExplanation(questionId) {
  try {
    const cache = JSON.parse(localStorage.getItem(EXPLANATION_CACHE_KEY) || '{}');
    return cache[questionId] || '';
  } catch {
    return '';
  }
}

function cacheExplanation(questionId, text) {
  try {
    const cache = JSON.parse(localStorage.getItem(EXPLANATION_CACHE_KEY) || '{}');
    cache[questionId] = text;
    const ids = Object.keys(cache);
    if (ids.length > MAX_CACHED_EXPLANATIONS) {
      ids.slice(0, ids.length - MAX_CACHED_EXPLANATIONS).forEach((id) => delete cache[id]);
    }
    localStorage.setItem(EXPLANATION_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // localStorage lleno o no disponible: la explicación solo se muestra en pantalla
  }
}

export function QuestionCard({
  question,
  currentIndex,
  totalQuestions,
  selectedOption,
  onSelectOption,
  onNext,
  onPrev,
  isFlagged,
  onToggleFlag,
  isSaved,
  onToggleSave,
  fontSize,
  isReviewMode,
  showInstantFeedback = false,
  allowInfiniteNext = false,
  nextButtonLabel = 'Siguiente',
  isLoadingNext = false
}) {
  const career = useCareer();
  const [aiExplanation, setAiExplanation] = useState('');
  const [isExplaining, setIsExplaining] = useState(false);
  const [explainError, setExplainError] = useState('');

  useEffect(() => {
    setAiExplanation(question ? readCachedExplanation(question.id) : '');
    setExplainError('');
    setIsExplaining(false);
  }, [question?.id]);

  if (!question) return null;

  // Las preguntas oficiales solo traen la clave; las generadas con IA ya incluyen su explicación
  const isOfficialQuestion = !question.whyThisQuestion && !String(question.id).startsWith('ai-gen');

  const handleExplainWithAi = async () => {
    const questionId = question.id;
    setIsExplaining(true);
    setExplainError('');
    try {
      const text = await explainOfficialQuestion({ question, careerId: question.career || career.id });
      cacheExplanation(questionId, text);
      setAiExplanation(text);
    } catch (err) {
      setExplainError(err.message || 'No se pudo generar la explicación.');
    } finally {
      setIsExplaining(false);
    }
  };

  const category = CATEGORIES[question.category] || CATEGORIES.all;
  const isFirst = currentIndex === 0;
  const isLast = allowInfiniteNext ? false : (currentIndex === totalQuestions - 1);

  const isAnswered = selectedOption !== undefined && selectedOption !== null;
  const isCorrect = isAnswered && selectedOption === question.correctAnswer;

  return (
    <article className="question-card" id={`question-card-${question.id}`}>
      {/* Header Meta */}
      <div className="question-header-meta">
        <div className="question-number-tag">
          <span>Pregunta {currentIndex + 1} de {totalQuestions}</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            ({question.year} • Pág. {question.page})
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span
            className="category-tag"
            style={{
              backgroundColor: category.bgColor,
              color: category.color,
              border: `1px solid ${category.borderColor}`
            }}
          >
            {category.shortName}
          </span>

          <div className="question-tools">
            <button
              id={`btn-flag-${question.id}`}
              className={`tool-icon-btn ${isFlagged ? 'flagged' : ''}`}
              onClick={onToggleFlag}
              title={isFlagged ? 'Desmarcar pregunta' : 'Marcar para revisión (F)'}
            >
              <Flag size={17} />
            </button>

            <button
              id={`btn-save-${question.id}`}
              className={`tool-icon-btn ${isSaved ? 'saved' : ''}`}
              onClick={onToggleSave}
              title={isSaved ? 'Quitar de preguntas guardadas' : 'Guardar en favoritas'}
            >
              <Bookmark size={17} />
            </button>
          </div>
        </div>
      </div>

      {/* Question Stem */}
      <div
        className="question-stem"
        style={{ fontSize: `${fontSize}rem` }}
      >
        {question.question}
      </div>

      {/* Options List */}
      <div className="options-list">
        {Object.entries(question.options).map(([letter, text]) => {
          const isSelected = selectedOption === letter;
          let optionClass = 'option-item';

          if (isReviewMode || (showInstantFeedback && isAnswered)) {
            if (letter === question.correctAnswer) {
              optionClass += ' correct';
            } else if (isSelected && letter !== question.correctAnswer) {
              optionClass += ' incorrect';
            }
          } else {
            if (isSelected) optionClass += ' selected';
          }

          return (
            <button
              key={letter}
              id={`option-${question.id}-${letter}`}
              className={optionClass}
              onClick={() => onSelectOption(letter)}
              disabled={isReviewMode}
            >
              <div className="option-letter">{letter}</div>
              <div className="option-text" style={{ fontSize: `${fontSize * 0.95}rem` }}>
                {text}
              </div>
              {(isReviewMode || (showInstantFeedback && isAnswered)) && (
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
                  {letter === question.correctAnswer && (
                    <CheckCircle2 size={20} color="var(--success)" />
                  )}
                  {isSelected && letter !== question.correctAnswer && (
                    <XCircle size={20} color="var(--danger)" />
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* High-Yield Clinical Feedback & MINSA References */}
      {(isReviewMode || (showInstantFeedback && isAnswered)) && (
        <div style={{ marginTop: '1.25rem', padding: '1rem 1.15rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
          
          {/* Motivo de formulación si existe */}
          {question.whyThisQuestion && (
            <div style={{ marginBottom: '0.85rem', padding: '0.65rem 0.85rem', background: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.25)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#a78bfa', fontWeight: 700, fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                <Target size={15} />
                <span>¿Por qué se formuló este caso? (Relevancia SERUMS):</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-main)', margin: 0, lineHeight: 1.45 }}>
                {question.whyThisQuestion}
              </p>
            </div>
          )}

          {/* Fundamento Clínico & Descarte */}
          <div style={{ marginBottom: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.35rem' }}>
              <CheckCircle2 size={16} />
              <span>{isOfficialQuestion ? 'Clave oficial MINSA:' : 'Justificación Clínica & Normativa MINSA:'}</span>
            </div>
            <div style={{ fontSize: '0.84rem', color: 'var(--text-main)', margin: 0, lineHeight: 1.6, whiteSpace: 'pre-line', background: 'var(--bg-card)', padding: '0.75rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              {question.explanation || question.pearl || 'Justificación basada en las Normas Técnicas de Salud vigentes del MINSA.'}
            </div>
          </div>

          {/* Explicación con IA para preguntas oficiales */}
          {isOfficialQuestion && (
            <div style={{ marginBottom: '0.85rem' }}>
              {aiExplanation ? (
                <div style={{ padding: '0.75rem 0.85rem', background: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.25)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#a78bfa', fontWeight: 700, fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                    <Bot size={15} />
                    <span>Explicación con IA</span>
                  </div>
                  <div style={{ fontSize: '0.83rem', color: 'var(--text-main)', lineHeight: 1.55, whiteSpace: 'pre-line' }}>
                    {aiExplanation}
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '0.5rem 0 0 0' }}>
                    Generada con IA a partir de la clave oficial del MINSA. Puede contener errores: contrástala con la norma técnica vigente.
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  className="action-btn-sm"
                  onClick={handleExplainWithAi}
                  disabled={isExplaining}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', padding: '0.45rem 0.8rem', background: 'rgba(139, 92, 246, 0.1)', borderColor: 'rgba(139, 92, 246, 0.35)', color: '#a78bfa', fontWeight: 700 }}
                >
                  {isExplaining ? <RefreshCw size={14} className="animate-spin" /> : <Bot size={14} />}
                  <span>{isExplaining ? 'Explicando...' : 'Explicar con IA por qué es la respuesta correcta'}</span>
                </button>
              )}
              {explainError && (
                <p style={{ fontSize: '0.76rem', color: 'var(--danger)', margin: '0.45rem 0 0 0' }}>{explainError}</p>
              )}
            </div>
          )}

          {/* Perla Médica Clave */}
          {question.pearl && question.pearl !== question.explanation && (
            <div style={{ marginBottom: question.references ? '0.85rem' : '0', padding: '0.65rem 0.85rem', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f59e0b', fontWeight: 700, fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                <Sparkles size={15} />
                <span>Perla SERUMS de Alto Rendimiento:</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-main)', margin: 0, lineHeight: 1.45 }}>
                {question.pearl}
              </p>
            </div>
          )}

          {/* Referencias Normativas Oficiales MINSA */}
          {question.references && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', padding: '0.5rem 0.75rem', background: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.25)', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              <BookOpen size={14} color="#06b6d4" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ color: '#06b6d4' }}>Referencia normativa: </strong>
                <span>{question.references}</span>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Navigation Footer */}
      <footer className="question-navigation">
        <button
          id="btn-prev-question"
          className="btn-secondary"
          onClick={onPrev}
          disabled={isFirst}
          style={{ opacity: isFirst ? 0.4 : 1, cursor: isFirst ? 'not-allowed' : 'pointer' }}
        >
          <ChevronLeft size={18} />
          <span>Anterior</span>
        </button>

        <span className="keyboard-shortcuts-hint" style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Atajos: <kbd>1-4 / A-D</kbd> responder • <kbd>← / →</kbd> navegar • <kbd>F</kbd> marcar
        </span>

        <button
          id="btn-next-question"
          className="btn-primary"
          onClick={onNext}
          disabled={isLast || isLoadingNext}
          style={{
            opacity: (isLast || isLoadingNext) ? 0.5 : 1,
            cursor: (isLast || isLoadingNext) ? 'not-allowed' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          {isLoadingNext ? (
            <>
              <Sparkles size={16} className="animate-spin" />
              <span>Generando...</span>
            </>
          ) : (
            <>
              <span>{nextButtonLabel}</span>
              <ChevronRight size={18} />
            </>
          )}
        </button>
      </footer>
    </article>
  );
}

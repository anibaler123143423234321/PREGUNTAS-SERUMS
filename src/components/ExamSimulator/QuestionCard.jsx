import React from 'react';
import { Flag, Bookmark, Sparkles, HelpCircle, ChevronLeft, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';
import { CATEGORIES } from '../../data/categories';

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
  showInstantFeedback = false
}) {
  if (!question) return null;

  const category = CATEGORIES[question.category] || CATEGORIES.all;
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalQuestions - 1;

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

      {/* High-Yield Clinical Pearl (Tutor / Review Mode) */}
      {(isReviewMode || (showInstantFeedback && isAnswered)) && (
        <div className="pearl-card">
          <div className="pearl-header">
            <Sparkles size={18} />
            <span>Perla Médica & Fundamento SERUMS:</span>
          </div>
          <p className="pearl-body">{question.pearl || question.explanation}</p>
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

        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Atajos: <kbd>1-4 / A-D</kbd> responder • <kbd>← / →</kbd> navegar • <kbd>F</kbd> marcar
        </span>

        <button
          id="btn-next-question"
          className="btn-primary"
          onClick={onNext}
          disabled={isLast}
          style={{ opacity: isLast ? 0.4 : 1, cursor: isLast ? 'not-allowed' : 'pointer' }}
        >
          <span>Siguiente</span>
          <ChevronRight size={18} />
        </button>
      </footer>
    </article>
  );
}

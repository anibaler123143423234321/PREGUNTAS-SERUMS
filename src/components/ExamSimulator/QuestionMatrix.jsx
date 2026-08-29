import React, { useState } from 'react';
import { Filter, Bookmark, Flag, CheckCircle2 } from 'lucide-react';

export function QuestionMatrix({
  questions,
  currentIndex,
  onSelectQuestion,
  userAnswers,
  flaggedQuestions,
  isReviewMode
}) {
  const [filter, setFilter] = useState('all'); // all, answered, pending, flagged

  const filteredQuestions = questions.filter((q, idx) => {
    const isAnswered = !!userAnswers[q.id];
    const isFlagged = !!flaggedQuestions[q.id];

    if (filter === 'answered') return isAnswered;
    if (filter === 'pending') return !isAnswered;
    if (filter === 'flagged') return isFlagged;
    return true;
  });

  return (
    <aside className="matrix-sidebar" id="question-matrix-sidebar">
      <div className="matrix-header">
        <h3 style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <CheckCircle2 size={18} color="var(--primary)" />
          Navegación de Preguntas
        </h3>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {Object.keys(userAnswers).length} de {questions.length}
        </span>
      </div>

      <div className="matrix-filters">
        <button
          className={`matrix-filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Todas ({questions.length})
        </button>
        <button
          className={`matrix-filter-btn ${filter === 'answered' ? 'active' : ''}`}
          onClick={() => setFilter('answered')}
        >
          Respondidas ({Object.keys(userAnswers).length})
        </button>
        <button
          className={`matrix-filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pendientes ({questions.length - Object.keys(userAnswers).length})
        </button>
        <button
          className={`matrix-filter-btn ${filter === 'flagged' ? 'active' : ''}`}
          onClick={() => setFilter('flagged')}
        >
          Marcadas ({Object.keys(flaggedQuestions).length})
        </button>
      </div>

      <div className="matrix-grid">
        {questions.map((q, idx) => {
          const isAnswered = !!userAnswers[q.id];
          const isFlagged = !!flaggedQuestions[q.id];
          const isCurrent = currentIndex === idx;

          let statusClass = '';
          if (isReviewMode) {
            const isCorrect = userAnswers[q.id] === q.correctAnswer;
            statusClass = isCorrect ? 'correct-rev' : 'incorrect-rev';
          } else {
            if (isAnswered) statusClass = 'answered';
          }

          if (isFlagged) statusClass += ' flagged';
          if (isCurrent) statusClass += ' current';

          // Hidden by filter check
          const isVisible =
            filter === 'all' ||
            (filter === 'answered' && isAnswered) ||
            (filter === 'pending' && !isAnswered) ||
            (filter === 'flagged' && isFlagged);

          return (
            <button
              key={q.id}
              id={`matrix-item-${idx + 1}`}
              className={`matrix-item ${statusClass}`}
              style={{ opacity: isVisible ? 1 : 0.25 }}
              onClick={() => onSelectQuestion(idx)}
              title={`Pregunta ${idx + 1}${isFlagged ? ' (Marcada)' : ''}${isAnswered ? ' (Respondida)' : ''}`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>
    </aside>
  );
}

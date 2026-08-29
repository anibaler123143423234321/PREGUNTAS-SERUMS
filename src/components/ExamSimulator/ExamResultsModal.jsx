import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Award, CheckCircle2, XCircle, HelpCircle, ArrowRight, RotateCcw, Eye, Sparkles } from 'lucide-react';
import { CATEGORIES } from '../../data/categories';

export function ExamResultsModal({
  results,
  onClose,
  onReviewAnswers,
  onRestartExam
}) {
  if (!results) return null;

  const {
    vigesimalGrade,
    percentage,
    correctCount,
    incorrectCount,
    unansweredCount,
    totalQuestions,
    isPassed,
    feedback,
    categoryStats
  } = results;

  useEffect(() => {
    if (isPassed) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [isPassed]);

  return (
    <div className="modal-backdrop" id="results-modal-backdrop">
      <div className="modal-content" id="results-modal-content">
        {/* Header Display */}
        <div className="score-display-card">
          <div
            className="score-badge"
            style={{
              backgroundColor: isPassed ? 'var(--success-bg)' : 'var(--danger-bg)',
              color: isPassed ? 'var(--success)' : 'var(--danger)',
              border: `1px solid ${isPassed ? 'var(--success-border)' : 'var(--danger-border)'}`
            }}
          >
            {feedback.badge}
          </div>

          <div className="score-vigesimal">
            {vigesimalGrade.toFixed(2)}
            <span style={{ fontSize: '1.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>/ 20</span>
          </div>

          <h2 style={{ fontSize: '1.4rem', marginBottom: '0.4rem' }}>{feedback.title}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '520px', margin: '0 auto' }}>
            {feedback.message}
          </p>
        </div>

        {/* Global Stats Grid */}
        <div className="stats-breakdown-grid">
          <div className="stat-box">
            <div className="stat-box-val" style={{ color: 'var(--success)' }}>
              {correctCount}
            </div>
            <div className="stat-box-lbl">Aciertos ({percentage}%)</div>
          </div>

          <div className="stat-box">
            <div className="stat-box-val" style={{ color: 'var(--danger)' }}>
              {incorrectCount}
            </div>
            <div className="stat-box-lbl">Desaciertos</div>
          </div>

          <div className="stat-box">
            <div className="stat-box-val" style={{ color: 'var(--warning)' }}>
              {unansweredCount}
            </div>
            <div className="stat-box-lbl">Sin Responder</div>
          </div>
        </div>

        {/* Performance by Specialty */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={18} color="var(--primary)" />
            Rendimiento por Especialidad Médica
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {Object.entries(categoryStats).map(([catKey, stats]) => {
              const cat = CATEGORIES[catKey] || { name: catKey, color: '#0ea5e9' };
              const catPercent = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;

              return (
                <div key={catKey} className="cat-progress-item">
                  <div className="cat-progress-labels">
                    <span style={{ color: 'var(--text-main)' }}>{cat.name}</span>
                    <span style={{ color: cat.color }}>
                      {stats.correct}/{stats.total} ({catPercent}%)
                    </span>
                  </div>
                  <div className="progress-bar-bg">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${catPercent}%`,
                        backgroundColor: cat.color
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button
            id="btn-modal-restart"
            className="btn-secondary"
            onClick={onRestartExam}
          >
            <RotateCcw size={16} />
            <span>Repetir Simulacro</span>
          </button>

          <button
            id="btn-modal-review"
            className="btn-primary"
            onClick={onReviewAnswers}
          >
            <Eye size={16} />
            <span>Revisar Respuestas y Claves</span>
          </button>
        </div>
      </div>
    </div>
  );
}

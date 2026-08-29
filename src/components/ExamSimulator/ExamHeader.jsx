import React from 'react';
import { Clock, Pause, Play, CheckCircle, Flag, Award, RefreshCw } from 'lucide-react';

export function ExamHeader({
  formatTime,
  secondsLeft,
  isPaused,
  onTogglePause,
  answeredCount,
  flaggedCount,
  totalQuestions,
  onFinishExam,
  isReviewMode,
  onRestartExam
}) {
  const isTimeWarning = secondsLeft <= 900 && secondsLeft > 300; // < 15 min
  const isTimeDanger = secondsLeft <= 300; // < 5 min

  let timerClass = 'timer-box';
  if (isTimeDanger) timerClass += ' danger';
  else if (isTimeWarning) timerClass += ' warning';

  const progressPercent = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  return (
    <div className="exam-top-bar" id="exam-top-bar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        {/* Timer Box */}
        {!isReviewMode ? (
          <div className={timerClass} title="Tiempo restante para el examen">
            <Clock size={20} />
            <span>{isPaused ? 'EN PAUSA' : formatTime()}</span>
          </div>
        ) : (
          <div className="timer-box" style={{ borderColor: 'var(--success)', color: 'var(--success)' }}>
            <Award size={20} />
            <span>MODO REVISIÓN</span>
          </div>
        )}

        {/* Pause/Resume Button */}
        {!isReviewMode && (
          <button
            id="btn-pause-exam"
            className="action-btn-sm"
            onClick={onTogglePause}
            style={{ color: 'var(--text-main)', borderColor: 'var(--border-medium)', background: 'var(--bg-surface)' }}
          >
            {isPaused ? <Play size={16} /> : <Pause size={16} />}
            <span>{isPaused ? 'Reanudar' : 'Pausar'}</span>
          </button>
        )}
      </div>

      {/* Metrics */}
      <div className="exam-metrics">
        <div className="metric-pill">
          <CheckCircle size={17} color="var(--primary)" />
          <span>Respondidas:</span>
          <strong>{answeredCount} / {totalQuestions}</strong>
        </div>

        <div className="metric-pill">
          <Flag size={17} color="var(--flagged)" />
          <span>Marcadas:</span>
          <strong>{flaggedCount}</strong>
        </div>

        {/* Action button: Finish or Restart */}
        {!isReviewMode ? (
          <button
            id="btn-finish-exam"
            className="btn-primary"
            onClick={onFinishExam}
          >
            <span>Finalizar Examen</span>
          </button>
        ) : (
          <button
            id="btn-restart-exam"
            className="btn-secondary"
            onClick={onRestartExam}
          >
            <RefreshCw size={16} />
            <span>Nuevo Intento</span>
          </button>
        )}
      </div>
    </div>
  );
}

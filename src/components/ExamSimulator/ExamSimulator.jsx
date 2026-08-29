import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle, Award, Clock, Play, BookOpen } from 'lucide-react';
import { ExamHeader } from './ExamHeader';
import { QuestionCard } from './QuestionCard';
import { QuestionMatrix } from './QuestionMatrix';
import { ExamResultsModal } from './ExamResultsModal';
import { useTimer } from '../../hooks/useTimer';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { calculateScore } from '../../utils/scoring';

export function ExamSimulator({
  questions,
  savedQuestions,
  onToggleSave,
  onRecordMistakes,
  onSaveExamHistory,
  fontSize,
  onSwitchToTutor
}) {
  const [isExamStarted, setIsExamStarted] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(7200); // 120 min by default
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState({});
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [examResults, setExamResults] = useState(null);

  // Timer initialized with selected duration
  const timer = useTimer(selectedDuration, () => {
    // Auto-finish on timer expiry
    handleFinishExam();
  });

  // Start timer only when exam is explicitly started
  const handleStartExam = () => {
    setIsExamStarted(true);
    setUserAnswers({});
    setFlaggedQuestions({});
    setCurrentIndex(0);
    timer.reset(selectedDuration);
    timer.start();
  };

  // Handle option selection
  const handleSelectOption = (letter) => {
    if (isReviewMode) return;
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    setUserAnswers((prev) => ({
      ...prev,
      [currentQ.id]: letter
    }));
  };

  // Toggle flag
  const handleToggleFlag = () => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    setFlaggedQuestions((prev) => {
      const next = { ...prev };
      if (next[currentQ.id]) {
        delete next[currentQ.id];
      } else {
        next[currentQ.id] = true;
      }
      return next;
    });
  };

  // Navigation handlers
  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Finish exam and compute score
  const handleFinishExam = () => {
    timer.pause();
    const results = calculateScore(questions, userAnswers);
    setExamResults(results);
    setShowResultsModal(true);

    // Record mistakes
    const failedQuestions = questions.filter((q) => {
      const ans = userAnswers[q.id];
      return ans && ans !== q.correctAnswer;
    });
    if (onRecordMistakes && failedQuestions.length > 0) {
      onRecordMistakes(failedQuestions);
    }

    // Save to exam history
    if (onSaveExamHistory) {
      onSaveExamHistory({
        date: new Date().toISOString(),
        score: results.vigesimalGrade,
        percentage: results.percentage,
        correctCount: results.correctCount,
        totalQuestions: questions.length,
        timeSpentSeconds: 7200 - timer.secondsLeft
      });
    }
  };

  // Restart exam
  const handleRestartExam = () => {
    setUserAnswers({});
    setFlaggedQuestions({});
    setIsReviewMode(false);
    setShowResultsModal(false);
    setExamResults(null);
    setCurrentIndex(0);
    timer.reset(7200);
    timer.start();
  };

  // Enter review mode
  const handleReviewAnswers = () => {
    setShowResultsModal(false);
    setIsReviewMode(true);
    setCurrentIndex(0);
  };

  // Setup keyboard shortcuts
  useKeyboardShortcuts({
    onSelectOption: handleSelectOption,
    onNext: handleNext,
    onPrev: handlePrev,
    onFlag: handleToggleFlag,
    isEnabled: isExamStarted && !showResultsModal && !timer.isPaused
  });

  const currentQ = questions[currentIndex];
  const isFlagged = currentQ ? !!flaggedQuestions[currentQ.id] : false;
  const isSaved = currentQ ? !!savedQuestions[currentQ.id] : false;
  const selectedOption = currentQ ? userAnswers[currentQ.id] : null;

  // Pre-exam start screen (Ultra-Compact)
  if (!isExamStarted && !isReviewMode) {
    return (
      <div className="exam-intro-screen" style={{ maxWidth: '720px', margin: '0.5rem auto' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-md)', textAlign: 'center' }}>
          
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.2rem 0.75rem', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.65rem' }}>
            <Sparkles size={14} />
            <span>MODALIDAD OFICIAL MINSA</span>
          </div>

          <h2 style={{ fontSize: '1.4rem', marginBottom: '0.4rem', letterSpacing: '-0.02em', fontWeight: 800 }}>
            Simulacro Oficial SERUMS Medicina
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', maxWidth: '540px', margin: '0 auto 1.1rem auto', lineHeight: 1.45 }}>
            Condiciones reales de examen: temporizador activo y claves ocultas hasta la entrega final.
          </p>

          {/* Compact Info Badges Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.65rem', marginBottom: '1.25rem', textAlign: 'left' }}>
            <div style={{ background: 'var(--bg-surface)', padding: '0.75rem 0.9rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem' }}>
                <CheckCircle size={16} />
                <span>{questions.length} Preguntas</span>
              </div>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                Opción múltiple, respuesta única.
              </p>
            </div>

            <div style={{ background: 'var(--bg-surface)', padding: '0.75rem 0.9rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--success)', fontWeight: 700, fontSize: '0.85rem' }}>
                <Award size={16} />
                <span>Escala 0 a 20</span>
              </div>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                0.20 pts c/u • Aprobatorio: 11.00.
              </p>
            </div>

            <div style={{ background: 'var(--bg-surface)', padding: '0.75rem 0.9rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--warning)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                <Clock size={16} />
                <span>Tiempo Límite</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem' }}>
                {[
                  { value: 7200, label: '120m (Oficial)' },
                  { value: 5400, label: '90m' },
                  { value: 10800, label: '180m' },
                  { value: 36000, label: 'Sin límite' }
                ].map((dur) => {
                  const isSelected = selectedDuration === dur.value;
                  return (
                    <button
                      key={dur.value}
                      onClick={() => setSelectedDuration(dur.value)}
                      style={{
                        padding: '0.22rem 0.4rem',
                        borderRadius: 'var(--radius-xs)',
                        fontSize: '0.72rem',
                        fontWeight: isSelected ? 800 : 500,
                        background: isSelected ? 'var(--warning-bg)' : 'var(--bg-card)',
                        color: isSelected ? 'var(--warning)' : 'var(--text-secondary)',
                        border: isSelected ? '1.5px solid var(--warning)' : '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        transition: 'var(--transition)'
                      }}
                    >
                      {dur.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {onSwitchToTutor && (
              <button
                className="btn-secondary"
                onClick={onSwitchToTutor}
                style={{ padding: '0.65rem 1.15rem', fontSize: '0.85rem' }}
              >
                <BookOpen size={16} />
                <span>Modo Tutor / Estudio</span>
              </button>
            )}

            <button
              id="btn-start-exam"
              className="btn-primary"
              onClick={handleStartExam}
              style={{ padding: '0.65rem 1.6rem', fontSize: '0.9rem', fontWeight: 700 }}
            >
              <Play size={18} />
              <span>Comenzar Simulacro</span>
            </button>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="exam-simulator-view" id="exam-simulator-view">
      <ExamHeader
        formatTime={timer.formatTime}
        secondsLeft={timer.secondsLeft}
        isPaused={timer.isPaused}
        onTogglePause={() => (timer.isPaused ? timer.resume() : timer.pause())}
        answeredCount={Object.keys(userAnswers).length}
        flaggedCount={Object.keys(flaggedQuestions).length}
        totalQuestions={questions.length}
        onFinishExam={handleFinishExam}
        isReviewMode={isReviewMode}
        onRestartExam={handleRestartExam}
      />

      <div className="exam-grid-layout">
        <main>
          {currentQ && (
            <QuestionCard
              question={currentQ}
              currentIndex={currentIndex}
              totalQuestions={questions.length}
              selectedOption={selectedOption}
              onSelectOption={handleSelectOption}
              onNext={handleNext}
              onPrev={handlePrev}
              isFlagged={isFlagged}
              onToggleFlag={handleToggleFlag}
              isSaved={isSaved}
              onToggleSave={() => onToggleSave(currentQ)}
              fontSize={fontSize}
              isReviewMode={isReviewMode}
            />
          )}
        </main>

        <QuestionMatrix
          questions={questions}
          currentIndex={currentIndex}
          onSelectQuestion={(idx) => setCurrentIndex(idx)}
          userAnswers={userAnswers}
          flaggedQuestions={flaggedQuestions}
          isReviewMode={isReviewMode}
        />
      </div>

      {showResultsModal && (
        <ExamResultsModal
          results={examResults}
          onClose={() => setShowResultsModal(false)}
          onReviewAnswers={handleReviewAnswers}
          onRestartExam={handleRestartExam}
        />
      )}
    </div>
  );
}

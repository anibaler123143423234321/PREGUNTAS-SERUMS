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

  // Pre-exam start screen
  if (!isExamStarted && !isReviewMode) {
    return (
      <div className="exam-intro-screen" style={{ maxWidth: '840px', margin: '1rem auto' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '2.5rem', boxShadow: 'var(--shadow-md)', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 1rem', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            <Sparkles size={16} />
            <span>MODALIDAD DE EVALUACIÓN OFICIAL MINSA</span>
          </div>

          <h2 style={{ fontSize: '2rem', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
            Simulacro Oficial SERUMS Medicina
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '600px', margin: '0 auto 2rem auto', lineHeight: 1.6 }}>
            Prepárate en condiciones reales de evaluación. Al iniciar el examen, el temporizador comenzará su cuenta regresiva y las claves correctas permanecerán ocultas hasta la entrega final.
          </p>

          {/* Quick info boxes */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem', textAlign: 'left' }}>
            <div style={{ background: 'var(--bg-surface)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 700, marginBottom: '0.35rem', fontSize: '0.95rem' }}>
                <CheckCircle size={18} />
                <span>Preguntas Oficiales</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <strong>{questions.length} preguntas</strong> del proceso seleccionado con única respuesta correcta.
              </p>
            </div>

            <div style={{ background: 'var(--bg-surface)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', fontWeight: 700, marginBottom: '0.35rem', fontSize: '0.95rem' }}>
                <Award size={18} />
                <span>Escala Vigesimal</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Calificación de <strong>0.00 a 20.00</strong> (0.20 pts por acierto). Aprobatorio: <strong>11.00</strong>.
              </p>
            </div>

            <div style={{ background: 'var(--bg-surface)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--warning)', fontWeight: 700, marginBottom: '0.35rem', fontSize: '0.95rem' }}>
                <Clock size={18} />
                <span>Duración del Examen</span>
              </div>
              <select
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(Number(e.target.value))}
                style={{
                  width: '100%',
                  marginTop: '0.25rem',
                  padding: '0.4rem 0.6rem',
                  background: 'var(--bg-card)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value={7200}>120 Minutos (2 horas - Oficial)</option>
                <option value={5400}>90 Minutos (1.5 horas - Rápido)</option>
                <option value={10800}>180 Minutos (3 horas - Extendido)</option>
                <option value={36000}>Sin límite de tiempo</option>
              </select>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {onSwitchToTutor && (
              <button
                className="btn-secondary"
                onClick={onSwitchToTutor}
                style={{ padding: '0.85rem 1.5rem', fontSize: '0.95rem' }}
              >
                <BookOpen size={18} />
                <span>Ir al Modo Tutor / Estudio</span>
              </button>
            )}

            <button
              id="btn-start-exam"
              className="btn-primary"
              onClick={handleStartExam}
              style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}
            >
              <Play size={20} />
              <span>Comenzar Simulacro Oficial</span>
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

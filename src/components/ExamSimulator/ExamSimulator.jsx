import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle, Award, Clock, Play, BookOpen, Check } from 'lucide-react';
import { EXAM_YEARS } from '../../data/categories';
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
  onSwitchToTutor,
  selectedYear,
  onSelectYear
}) {
  const [isExamStarted, setIsExamStarted] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(7200); // 120 min by default
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState({});
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [examResults, setExamResults] = useState(null);

  // Temporizador inicializado con la duracion seleccionada
  const timer = useTimer(selectedDuration, () => {
    // Finalizacion automatica al expirar el tiempo
    handleFinishExam();
  });

  // Iniciar temporizador al comenzar el examen
  const handleStartExam = () => {
    setIsExamStarted(true);
    setUserAnswers({});
    setFlaggedQuestions({});
    setCurrentIndex(0);
    timer.reset(selectedDuration);
    timer.start();
  };

  // Seleccionar opcion de respuesta
  const handleSelectOption = (letter) => {
    if (isReviewMode) return;
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    setUserAnswers((prev) => ({
      ...prev,
      [currentQ.id]: letter
    }));
  };

  // Alternar marca de pregunta dudosa
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

  // Controladores de navegacion
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

  // Finalizar examen y calcular nota vigesimal
  const handleFinishExam = () => {
    timer.pause();
    const results = calculateScore(questions, userAnswers);
    setExamResults(results);
    setShowResultsModal(true);

    // Registrar errores en el banco de fallos
    const failedQuestions = questions.filter((q) => {
      const ans = userAnswers[q.id];
      return ans && ans !== q.correctAnswer;
    });
    if (onRecordMistakes && failedQuestions.length > 0) {
      onRecordMistakes(failedQuestions);
    }

    // Guardar en el historial de rendimiento
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

  const currentExamObj = EXAM_YEARS.find((y) => y.id === selectedYear) || EXAM_YEARS[1] || EXAM_YEARS[0];

  // Pre-exam start screen
  if (!isExamStarted && !isReviewMode) {
    return (
      <div className="exam-intro-screen" style={{ maxWidth: '820px', margin: '0.5rem auto' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-lg)', padding: '1.75rem', boxShadow: 'var(--shadow-md)' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '1.35rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.2rem 0.75rem', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              <Sparkles size={14} />
              <span>EVALUACIÓN OFICIAL MINSA (LEY 23330)</span>
            </div>

            <h2 style={{ fontSize: '1.45rem', marginBottom: '0.35rem', letterSpacing: '-0.02em', fontWeight: 800, color: 'var(--text-main)' }}>
              Simulador Oficial de Exámenes SERUMS
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', maxWidth: '580px', margin: '0 auto', lineHeight: 1.45 }}>
              Selecciona el proceso oficial que deseas rendir. Cronómetro activo con retroalimentación y cálculo de nota al finalizar.
            </p>
          </div>

          {/* Step 1: Mandatory Exam Selector */}
          <div style={{ marginBottom: '1.35rem', background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.75rem' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', background: 'var(--primary)', color: '#fff', borderRadius: '50%', fontSize: '0.75rem' }}>1</span>
              <span>Selecciona el Proceso / Examen Oficial a Rendir:</span>
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '0.55rem' }}>
              {EXAM_YEARS.map((y) => {
                const isSelected = selectedYear === y.id;
                return (
                  <button
                    key={y.id}
                    type="button"
                    onClick={() => onSelectYear && onSelectYear(y.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      background: isSelected ? 'var(--primary-light)' : 'var(--bg-card)',
                      border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-medium)',
                      color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 3px 10px rgba(2, 132, 199, 0.2)' : 'none'
                    }}
                  >
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.84rem' }}>{y.name}</strong>
                      <span style={{ fontSize: '0.72rem', color: isSelected ? 'var(--primary)' : 'var(--text-secondary)' }}>
                        {y.id === 'all' ? '500 preguntas oficiales' : '100 preguntas completas'}
                      </span>
                    </div>
                    {isSelected && (
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Check size={13} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Exam Conditions & Timer */}
          <div style={{ marginBottom: '1.5rem', background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.75rem' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', background: 'var(--primary)', color: '#fff', borderRadius: '50%', fontSize: '0.75rem' }}>2</span>
              <span>Condiciones y Tiempo de Examen:</span>
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.65rem' }}>
              <div style={{ background: 'var(--bg-card)', padding: '0.75rem 0.9rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem' }}>
                  <CheckCircle size={16} />
                  <span>{questions.length} Preguntas</span>
                </div>
                <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                  Opción múltiple con clave única oficial.
                </p>
              </div>

              <div style={{ background: 'var(--bg-card)', padding: '0.75rem 0.9rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--success)', fontWeight: 700, fontSize: '0.85rem' }}>
                  <Award size={16} />
                  <span>Escala 0 a 20</span>
                </div>
                <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                  {(20 / (questions.length || 100)).toFixed(2)} pts c/u • Aprobatorio: 11.00.
                </p>
              </div>

              <div style={{ background: 'var(--bg-card)', padding: '0.75rem 0.9rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
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
                        type="button"
                        onClick={() => setSelectedDuration(dur.value)}
                        style={{
                          padding: '0.22rem 0.4rem',
                          borderRadius: 'var(--radius-xs)',
                          fontSize: '0.72rem',
                          fontWeight: isSelected ? 800 : 500,
                          background: isSelected ? 'var(--warning-bg)' : 'var(--bg-surface)',
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
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {onSwitchToTutor && (
              <button
                className="btn-secondary"
                onClick={onSwitchToTutor}
                style={{ padding: '0.7rem 1.25rem', fontSize: '0.86rem', fontWeight: 600 }}
              >
                <BookOpen size={16} />
                <span>Estudiar en Modo Tutor</span>
              </button>
            )}

            <button
              id="btn-start-exam"
              className="btn-primary"
              onClick={handleStartExam}
              style={{
                padding: '0.75rem 1.8rem',
                fontSize: '0.94rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)'
              }}
            >
              <Play size={18} />
              <span>
                Comenzar Simulacro • {currentExamObj.name} ({questions.length} Preguntas)
              </span>
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

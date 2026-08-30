import React, { useState, useMemo } from 'react';
import { Sparkles, BookOpen, Layers, RotateCcw, Shuffle, Bookmark, Flag, ChevronDown } from 'lucide-react';
import { CATEGORIES, EXAM_YEARS } from '../../data/categories';
import { QuestionCard } from '../ExamSimulator/QuestionCard';

export function TutorMode({
  allQuestions,
  savedQuestions,
  onToggleSave,
  onRecordMistakes,
  fontSize,
  selectedYear,
  onSelectYear
}) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState({});

  // Filtrar preguntas segun la especialidad seleccionada
  const filteredQuestions = useMemo(() => {
    if (selectedCategory === 'all') return allQuestions;
    return allQuestions.filter((q) => q.category === selectedCategory);
  }, [allQuestions, selectedCategory]);

  // Reiniciar indice cuando cambia la categoria
  const handleCategoryChange = (catId) => {
    setSelectedCategory(catId);
    setCurrentIndex(0);
  };

  const handleSelectOption = (letter) => {
    const currentQ = filteredQuestions[currentIndex];
    if (!currentQ) return;
    setUserAnswers((prev) => ({
      ...prev,
      [currentQ.id]: letter
    }));

    if (letter !== currentQ.correctAnswer && onRecordMistakes) {
      onRecordMistakes([{
        ...currentQ,
        userAnswer: letter
      }]);
    }
  };

  const handleToggleFlag = () => {
    const currentQ = filteredQuestions[currentIndex];
    if (!currentQ) return;
    setFlaggedQuestions((prev) => {
      const next = { ...prev };
      if (next[currentQ.id]) delete next[currentQ.id];
      else next[currentQ.id] = true;
      return next;
    });
  };

  const handleNext = () => {
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const currentQ = filteredQuestions[currentIndex];
  const isFlagged = currentQ ? !!flaggedQuestions[currentQ.id] : false;
  const isSaved = currentQ ? !!savedQuestions[currentQ.id] : false;
  const selectedOption = currentQ ? userAnswers[currentQ.id] : null;

  return (
    <div className="tutor-mode-view" id="tutor-mode-view">
      {/* Top Strip with Exam Process & Specialty Pills */}
      <div style={{ marginBottom: '0.85rem', background: 'var(--bg-card)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', display: 'flex', flexDirection: 'column', gap: '0.5rem', boxShadow: 'var(--shadow-sm)' }}>
        
        {/* Row 1: Exam Process Selector */}
        {onSelectYear && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', paddingBottom: '0.45rem', borderBottom: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginRight: '0.2rem' }}>
              <Layers size={13} />
              <span>Examen:</span>
            </span>
            {EXAM_YEARS.map((y) => {
              const isSelected = selectedYear === y.id;
              return (
                <button
                  key={y.id}
                  type="button"
                  onClick={() => onSelectYear(y.id)}
                  style={{
                    padding: '0.2rem 0.55rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.72rem',
                    fontWeight: isSelected ? 800 : 500,
                    background: isSelected ? 'var(--primary)' : 'var(--bg-surface)',
                    color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                    border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {y.short || y.name}
                </button>
              );
            })}
          </div>
        )}

        {/* Row 2: Category Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginRight: '0.2rem' }}>
            <BookOpen size={13} color="var(--primary)" />
            <span>Área:</span>
          </span>
          {Object.values(CATEGORIES).map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                id={`cat-pill-${cat.id}`}
                onClick={() => handleCategoryChange(cat.id)}
                style={{
                  padding: '0.22rem 0.55rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.72rem',
                  fontWeight: isSelected ? 800 : 500,
                  background: isSelected ? 'var(--primary-light)' : 'var(--bg-surface)',
                  color: isSelected ? 'var(--primary)' : 'var(--text-secondary)',
                  border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                {cat.shortName}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Question Display */}
      {currentQ ? (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <QuestionCard
            question={currentQ}
            currentIndex={currentIndex}
            totalQuestions={filteredQuestions.length}
            selectedOption={selectedOption}
            onSelectOption={handleSelectOption}
            onNext={handleNext}
            onPrev={handlePrev}
            isFlagged={isFlagged}
            onToggleFlag={handleToggleFlag}
            isSaved={isSaved}
            onToggleSave={() => onToggleSave(currentQ)}
            fontSize={fontSize}
            showInstantFeedback={true}
          />
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          No hay preguntas disponibles para esta categoría.
        </div>
      )}
    </div>
  );
}

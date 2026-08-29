import React, { useState, useMemo } from 'react';
import { Sparkles, BookOpen, Layers, RotateCcw, Shuffle, Bookmark, Flag } from 'lucide-react';
import { CATEGORIES } from '../../data/categories';
import { QuestionCard } from '../ExamSimulator/QuestionCard';

export function TutorMode({
  allQuestions,
  savedQuestions,
  onToggleSave,
  fontSize
}) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState({});

  // Filter questions based on selected specialty
  const filteredQuestions = useMemo(() => {
    if (selectedCategory === 'all') return allQuestions;
    return allQuestions.filter((q) => q.category === selectedCategory);
  }, [allQuestions, selectedCategory]);

  // Reset index if category changes
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
      {/* Category Pills Header */}
      <div style={{ marginBottom: '1.5rem', background: 'var(--bg-card)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={20} color="var(--primary)" />
            Modo Tutor & Estudio Clínico Guiado
          </h3>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {filteredQuestions.length} preguntas en esta especialidad
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
          {Object.values(CATEGORIES).map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                id={`cat-pill-${cat.id}`}
                onClick={() => handleCategoryChange(cat.id)}
                style={{
                  padding: '0.45rem 0.9rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                  backgroundColor: isSelected ? cat.color : 'var(--bg-surface)',
                  color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                  border: `1px solid ${isSelected ? cat.color : 'var(--border-subtle)'}`,
                  boxShadow: isSelected ? `0 2px 8px ${cat.color}40` : 'none'
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

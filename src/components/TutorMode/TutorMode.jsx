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
      {/* Ultra-Compact Category Pills Strip (Responsive Wrap) */}
      <div className="tutor-category-strip" style={{ marginBottom: '0.65rem', background: 'var(--bg-card)', padding: '0.45rem 0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--primary)', fontWeight: 700, fontSize: '0.78rem', whiteSpace: 'nowrap', paddingRight: '0.3rem' }}>
          <BookOpen size={15} />
          <span>Tutor:</span>
        </div>

        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {Object.values(CATEGORIES).map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                id={`cat-pill-${cat.id}`}
                onClick={() => handleCategoryChange(cat.id)}
                style={{
                  padding: '0.25rem 0.55rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.74rem',
                  fontWeight: isSelected ? 700 : 500,
                  background: isSelected ? 'var(--primary-gradient)' : 'var(--bg-surface)',
                  color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                  border: isSelected ? '1px solid transparent' : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'var(--transition)'
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

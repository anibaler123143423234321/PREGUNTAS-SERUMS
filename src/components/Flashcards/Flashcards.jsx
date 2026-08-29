import React, { useState, useEffect, useMemo } from 'react';
import { Layers, RotateCcw, Shuffle, Sparkles, CheckCircle2, AlertCircle, HelpCircle, ChevronLeft, ChevronRight, BookOpen, Trophy } from 'lucide-react';
import { CATEGORIES } from '../../data/categories';

export function Flashcards({ questions }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [shuffledSeed, setShuffledSeed] = useState(0);
  const [masteryStats, setMasteryStats] = useState({
    easy: 0,
    medium: 0,
    hard: 0
  });

  // Filter & shuffle deck
  const deck = useMemo(() => {
    let list = selectedCategory === 'all'
      ? [...questions]
      : questions.filter((q) => q.category === selectedCategory);
    
    if (shuffledSeed > 0) {
      list = [...list].sort(() => Math.random() - 0.5);
    }
    return list;
  }, [questions, selectedCategory, shuffledSeed]);

  // Reset index when category or shuffle changes
  const handleCategoryChange = (catId) => {
    setSelectedCategory(catId);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleShuffle = () => {
    setShuffledSeed((prev) => prev + 1);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleResetProgress = () => {
    setMasteryStats({ easy: 0, medium: 0, hard: 0 });
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleRate = (level) => {
    setMasteryStats((prev) => ({
      ...prev,
      [level]: prev[level] + 1
    }));
    setIsFlipped(false);
    if (currentIndex < deck.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex < deck.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (isFlipped) {
        if (e.key === '1') handleRate('hard');
        if (e.key === '2') handleRate('medium');
        if (e.key === '3') handleRate('easy');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, currentIndex, deck.length]);

  const currentQ = deck[currentIndex];
  if (!currentQ) return null;

  const category = CATEGORIES[currentQ.category] || CATEGORIES.all;
  const correctOptionText = currentQ.options[currentQ.correctAnswer] || '';
  const totalRated = masteryStats.easy + masteryStats.medium + masteryStats.hard;
  const progressPct = deck.length > 0 ? Math.round(((currentIndex + 1) / deck.length) * 100) : 0;

  return (
    <div className="flashcards-view" id="flashcards-view" style={{ maxWidth: '780px', margin: '0 auto' }}>
      
      {/* Category Horizontal Filter Bar (Responsive Wrap) */}
      <div className="tutor-category-strip" style={{ marginBottom: '0.65rem', background: 'var(--bg-card)', padding: '0.4rem 0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--primary)', fontWeight: 700, fontSize: '0.76rem', whiteSpace: 'nowrap', paddingRight: '0.3rem' }}>
          <Layers size={14} />
          <span>Mazo:</span>
        </div>

        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {Object.values(CATEGORIES).map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                id={`flashcard-cat-${cat.id}`}
                onClick={() => handleCategoryChange(cat.id)}
                style={{
                  padding: '0.22rem 0.55rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.73rem',
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

      {/* Compact Top Bar: Stats & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem', flexWrap: 'wrap', gap: '0.5rem', background: 'var(--bg-card)', padding: '0.5rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)' }}>
            Tarjeta {currentIndex + 1} / {deck.length}
          </span>
          <div style={{ width: '90px', height: '6px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
            <div style={{ width: `${progressPct}%`, height: '100%', background: 'var(--primary-gradient)', transition: 'width 0.3s ease' }} />
          </div>
        </div>

        {/* Live Mastery Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', fontWeight: 700 }}>
          <span style={{ padding: '0.15rem 0.45rem', borderRadius: 'var(--radius-full)', background: 'var(--success-bg)', color: 'var(--success)' }}>
            ✓ {masteryStats.easy}
          </span>
          <span style={{ padding: '0.15rem 0.45rem', borderRadius: 'var(--radius-full)', background: 'var(--warning-bg)', color: 'var(--warning)' }}>
            ? {masteryStats.medium}
          </span>
          <span style={{ padding: '0.15rem 0.45rem', borderRadius: 'var(--radius-full)', background: 'var(--danger-bg)', color: 'var(--danger)' }}>
            ✗ {masteryStats.hard}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.35rem' }}>
          <button
            id="btn-shuffle-flashcards"
            className="action-btn-sm"
            onClick={handleShuffle}
            title="Mezclar tarjetas aleatoriamente"
            style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem' }}
          >
            <Shuffle size={13} />
            <span>Mezclar</span>
          </button>

          <button
            className="action-btn-sm"
            onClick={handleResetProgress}
            title="Reiniciar progreso de estudio"
            style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem' }}
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      {/* 3D Glassmorphic Flip Card Container */}
      <div 
        className="flashcard-3d-scene" 
        onClick={() => setIsFlipped(!isFlipped)}
        role="button"
        tabIndex={0}
        aria-label="Voltear tarjeta de estudio"
      >
        <div className={`flashcard-3d-card ${isFlipped ? 'is-flipped' : ''}`}>
          
          {/* Front Face: Case / Question */}
          <div className="flashcard-face flashcard-front">
            <div className="flashcard-top-row">
              <span
                className="category-tag"
                style={{
                  backgroundColor: category.bgColor,
                  color: category.color,
                  border: `1px solid ${category.borderColor}`,
                  fontSize: '0.72rem',
                  padding: '0.2rem 0.55rem'
                }}
              >
                {category.name}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {currentQ.year} • Pág. {currentQ.page}
              </span>
            </div>

            <div className="flashcard-question-text">
              {currentQ.question}
            </div>

            <div className="flashcard-hint-pill">
              <Sparkles size={14} color="var(--primary)" />
              <span>Toca la tarjeta o presiona <kbd>ESPACIO</kbd> para voltear</span>
            </div>
          </div>

          {/* Back Face: Answer & Clinical Pearl */}
          <div className="flashcard-face flashcard-back">
            <div className="flashcard-top-row">
              <span className="flashcard-correct-badge">
                <CheckCircle2 size={15} />
                <span>CLAVE CORRECTA: [{currentQ.correctAnswer}]</span>
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {category.shortName}
              </span>
            </div>

            <div className="flashcard-answer-box">
              <strong>{currentQ.correctAnswer})</strong> {correctOptionText}
            </div>

            <div className="flashcard-pearl-box">
              <div className="pearl-header" style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                <Sparkles size={14} />
                <span>Perla Médica SERUMS:</span>
              </div>
              <p className="pearl-body" style={{ fontSize: '0.82rem', lineHeight: 1.45 }}>
                {currentQ.pearl || currentQ.explanation}
              </p>
            </div>

            <div className="flashcard-hint-pill back-hint">
              <span>Califica tu retención: <kbd>1</kbd> Difícil • <kbd>2</kbd> Dudoso • <kbd>3</kbd> Dominado</span>
            </div>
          </div>

        </div>
      </div>

      {/* Compact Action / Rating Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button
          className="btn-secondary"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          style={{ opacity: currentIndex === 0 ? 0.4 : 1, padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}
        >
          <ChevronLeft size={16} />
          <span>Anterior</span>
        </button>

        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button
            id="btn-rate-hard"
            className="action-btn-sm"
            onClick={() => handleRate('hard')}
            style={{ background: 'var(--danger-bg)', color: 'var(--danger)', borderColor: 'var(--danger-border)', padding: '0.45rem 0.75rem', fontSize: '0.8rem', fontWeight: 700 }}
          >
            <AlertCircle size={14} />
            <span>Difícil (1)</span>
          </button>

          <button
            id="btn-rate-medium"
            className="action-btn-sm"
            onClick={() => handleRate('medium')}
            style={{ background: 'var(--warning-bg)', color: 'var(--warning)', borderColor: 'var(--warning-border)', padding: '0.45rem 0.75rem', fontSize: '0.8rem', fontWeight: 700 }}
          >
            <HelpCircle size={14} />
            <span>Dudoso (2)</span>
          </button>

          <button
            id="btn-rate-easy"
            className="action-btn-sm"
            onClick={() => handleRate('easy')}
            style={{ background: 'var(--success-bg)', color: 'var(--success)', borderColor: 'var(--success-border)', padding: '0.45rem 0.75rem', fontSize: '0.8rem', fontWeight: 700 }}
          >
            <CheckCircle2 size={14} />
            <span>Dominado (3)</span>
          </button>
        </div>

        <button
          className="btn-primary"
          onClick={handleNext}
          disabled={currentIndex === deck.length - 1}
          style={{ opacity: currentIndex === deck.length - 1 ? 0.4 : 1, padding: '0.45rem 0.95rem', fontSize: '0.82rem' }}
        >
          <span>Siguiente</span>
          <ChevronRight size={16} />
        </button>
      </div>

    </div>
  );
}

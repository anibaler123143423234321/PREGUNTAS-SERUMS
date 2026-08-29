import React, { useState } from 'react';
import { Layers, RotateCcw, Shuffle, Sparkles, CheckCircle2, AlertCircle, HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { CATEGORIES } from '../../data/categories';

export function Flashcards({ questions }) {
  const [deck, setDeck] = useState(questions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteryStats, setMasteryStats] = useState({
    easy: 0,
    medium: 0,
    hard: 0
  });

  // Shuffle deck
  const handleShuffle = () => {
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
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

  const currentQ = deck[currentIndex];
  if (!currentQ) return null;

  const category = CATEGORIES[currentQ.category] || CATEGORIES.all;
  const correctOptionText = currentQ.options[currentQ.correctAnswer] || '';

  return (
    <div className="flashcards-view" id="flashcards-view" style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Header & Stats */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={22} color="var(--primary)" />
            Flashcards de Memorización Activa
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Tarjeta {currentIndex + 1} de {deck.length} • Haz clic para voltear
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            id="btn-shuffle-flashcards"
            className="btn-secondary"
            onClick={handleShuffle}
            title="Mezclar tarjetas aleatoriamente"
          >
            <Shuffle size={16} />
            <span>Mezclar</span>
          </button>
        </div>
      </div>

      {/* 3D Flip Card */}
      <div className="flashcard-wrapper" onClick={() => setIsFlipped(!isFlipped)}>
        <div className={`flashcard ${isFlipped ? 'flipped' : ''}`}>
          {/* Front Face */}
          <div className="flashcard-face">
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <span
                  className="category-tag"
                  style={{
                    backgroundColor: category.bgColor,
                    color: category.color,
                    border: `1px solid ${category.borderColor}`
                  }}
                >
                  {category.name}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {currentQ.year} • Pág. {currentQ.page}
                </span>
              </div>

              <div style={{ fontSize: '1.2rem', fontWeight: 600, lineHeight: 1.6, color: 'var(--text-main)' }}>
                {currentQ.question}
              </div>
            </div>

            <div className="card-hint">
              <Sparkles size={16} color="var(--primary)" />
              <span>Haz clic en la tarjeta para ver la clave y perla médica</span>
            </div>
          </div>

          {/* Back Face */}
          <div className="flashcard-face flashcard-back">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', fontWeight: 700, marginBottom: '1rem', fontSize: '1.05rem' }}>
                <CheckCircle2 size={22} />
                <span>Respuesta Correcta: Clave {currentQ.correctAnswer}</span>
              </div>

              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1.5rem', background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                {correctOptionText}
              </div>

              <div className="pearl-card" style={{ margin: 0 }}>
                <div className="pearl-header">
                  <Sparkles size={16} />
                  <span>Perla de Estudio SERUMS:</span>
                </div>
                <p className="pearl-body">{currentQ.pearl || currentQ.explanation}</p>
              </div>
            </div>

            <div className="card-hint">
              <span>Califica tu nivel de retención abajo para continuar</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rating / Navigation Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
        <button
          className="btn-secondary"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          style={{ opacity: currentIndex === 0 ? 0.4 : 1 }}
        >
          <ChevronLeft size={18} />
          <span>Anterior</span>
        </button>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            id="btn-rate-hard"
            className="action-btn-sm"
            onClick={() => handleRate('hard')}
            style={{ background: 'var(--danger-bg)', color: 'var(--danger)', borderColor: 'var(--danger-border)' }}
          >
            <AlertCircle size={16} />
            <span>Difícil</span>
          </button>

          <button
            id="btn-rate-medium"
            className="action-btn-sm"
            onClick={() => handleRate('medium')}
            style={{ background: 'var(--warning-bg)', color: 'var(--warning)', borderColor: 'var(--warning-border)' }}
          >
            <HelpCircle size={16} />
            <span>Dudoso</span>
          </button>

          <button
            id="btn-rate-easy"
            className="action-btn-sm"
            onClick={() => handleRate('easy')}
            style={{ background: 'var(--success-bg)', color: 'var(--success)', borderColor: 'var(--success-border)' }}
          >
            <CheckCircle2 size={16} />
            <span>Dominado</span>
          </button>
        </div>

        <button
          className="btn-secondary"
          onClick={handleNext}
          disabled={currentIndex === deck.length - 1}
          style={{ opacity: currentIndex === deck.length - 1 ? 0.4 : 1 }}
        >
          <span>Siguiente</span>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

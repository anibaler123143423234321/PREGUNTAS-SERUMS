import React, { useState, useEffect } from 'react';
import { Sparkles, Cpu, RefreshCw, Key, Layers, CheckCircle2, Bookmark, Zap, Lightbulb, Clock, Target, ShieldCheck, Flame, Play } from 'lucide-react';
import { CATEGORIES } from '../../data/categories';
import { generateSingleQuestion, generateExamBatch } from '../../services/aiService';
import { QuestionCard } from '../ExamSimulator/QuestionCard';
import { useLocalStorage } from '../../hooks/useLocalStorage';

const WAITING_TIPS = [
  '💡 NTS Anemia 2024: En niños con diagnóstico de anemia la dosis terapéutica de hierro elemental es 3 mg/kg/día por 6 meses.',
  '💡 Preeclampsia con Criterios de Severidad: El fármaco de elección es Sulfato de Magnesio (Esquema Zuspan). Antídoto: Gluconato de Calcio 10%.',
  '💡 NTS Dengue MINSA: El pilar es la hidratación isotónica precoz (ClNa 0.9%). Están contraindicados los AINEs y la vía intramuscular.',
  '💡 Tuberculosis: Sintomático respiratorio es toda persona con tos y expectoración ≥ 15 días. Esquema sensible: 2HREZ / 4H3R3.',
  '💡 Cadena de Frío MINSA: El rango térmico estricto para conservación de vacunas es de +2°C a +8°C.',
  '💡 Vigilancia Epidemiológica: El canal endémico define Zona de Éxito (<Q1), Seguridad (Q1-Q2), Alerta (Q2-Q3) y Epidemia (>Q3).',
  '💡 Relación Médico-Paciente: El modelo "Interpretativo" sitúa al médico como consejero-consultor para dilucidar los valores del paciente.'
];

const DIFFICULTY_OPTIONS = [
  { id: 'standard', label: 'Estándar MINSA', short: 'Estándar', icon: Target },
  { id: 'high', label: 'Alta Rentabilidad', short: 'Alta Rent.', icon: Flame },
  { id: 'normative', label: 'Normativa NTS', short: 'Normas NTS', icon: ShieldCheck }
];

export function AiExamGenerator({
  onStartCustomExam,
  onSaveQuestionToBank,
  savedQuestions,
  onToggleSave,
  fontSize
}) {
  const [apiKey, setApiKey] = useLocalStorage('nvidia_custom_api_key', import.meta.env.VITE_NVIDIA_API_KEY || '');
  const [showKeyConfig, setShowKeyConfig] = useState(false);

  // Single Question Mode State (with Infinite Continuous Generation & History)
  const [singleCategory, setSingleCategory] = useState('all');
  const [singleDifficulty, setSingleDifficulty] = useState('standard');
  const [customTopic, setCustomTopic] = useState('');
  const [isLoadingSingle, setIsLoadingSingle] = useState(false);
  const [questionsHistory, setQuestionsHistory] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswersMap, setUserAnswersMap] = useState({});
  const [singleError, setSingleError] = useState('');

  // Mini-Exam State (Max 2 questions to strictly protect NVIDIA credits)
  const [isGeneratingMini, setIsGeneratingMini] = useState(false);
  const [miniExamQuestions, setMiniExamQuestions] = useState([]);

  // Timer & Tip Rotation for Waiting Experience
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    let intervalTimer = null;
    let tipTimer = null;

    if (isLoadingSingle || isGeneratingMini) {
      setElapsedSeconds(0);
      intervalTimer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);

      tipTimer = setInterval(() => {
        setTipIndex((prev) => (prev + 1) % WAITING_TIPS.length);
      }, 4000);
    } else {
      setElapsedSeconds(0);
    }

    return () => {
      if (intervalTimer) clearInterval(intervalTimer);
      if (tipTimer) clearInterval(tipTimer);
    };
  }, [isLoadingSingle, isGeneratingMini]);

  // Handle single question generation (generates and appends to session history)
  const handleGenerateNextQuestion = async () => {
    setIsLoadingSingle(true);
    setSingleError('');
    try {
      const q = await generateSingleQuestion({
        category: singleCategory,
        difficulty: singleDifficulty,
        topic: customTopic,
        apiKey
      });
      setQuestionsHistory((prev) => {
        const nextList = [...prev, q];
        setCurrentIndex(nextList.length - 1);
        return nextList;
      });
    } catch (err) {
      setSingleError(err.message || 'Error al generar la pregunta con NVIDIA AI.');
    } finally {
      setIsLoadingSingle(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < questionsHistory.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Generate the next AI question seamlessly
      handleGenerateNextQuestion();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Handle safe Mini Reto generation (Strictly 2 questions to protect free credits)
  const handleGenerateMiniChallenge = async () => {
    setIsGeneratingMini(true);
    setSingleError('');
    try {
      const questions = await generateExamBatch({
        totalQuestions: 2,
        category: singleCategory,
        difficulty: singleDifficulty,
        topic: customTopic,
        apiKey
      });
      if (questions.length > 0) {
        setMiniExamQuestions(questions);
        if (onStartCustomExam) {
          onStartCustomExam(questions);
        }
      }
    } catch (err) {
      setSingleError(err.message || 'Error al generar el mini-reto con IA.');
    } finally {
      setIsGeneratingMini(false);
    }
  };

  return (
    <div className="ai-exam-generator-view" id="ai-exam-generator-view" style={{ maxWidth: '820px', margin: '0 auto' }}>
      
      {/* Banner Header (Ultra-Compact & Credit Protected) */}
      <div style={{ background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)', border: '1px solid rgba(2, 132, 199, 0.35)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', marginBottom: '0.65rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.15rem 0.5rem', background: 'rgba(139, 92, 246, 0.2)', color: '#a78bfa', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', fontWeight: 700, marginBottom: '0.2rem' }}>
            <Cpu size={13} />
            <span>NVIDIA AI • LLaMA 3.2</span>
          </div>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '0.15rem', fontWeight: 800 }}>
            Generador Clínico On-Demand con IA
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', maxWidth: '560px', lineHeight: 1.35 }}>
            Preguntas inéditas generadas en tiempo real y calibradas con el Temario SERUMS 2026-II y Normas MINSA.
          </p>
        </div>

        <button
          className="action-btn-sm"
          onClick={() => setShowKeyConfig(!showKeyConfig)}
          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-medium)', color: 'var(--text-main)', fontSize: '0.76rem', padding: '0.35rem 0.65rem' }}
        >
          <Key size={14} />
          <span>API Key</span>
        </button>
      </div>

      {/* API Key Config Dropdown */}
      {showKeyConfig && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.75rem', marginBottom: '0.65rem' }}>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.3rem' }}>
            NVIDIA API Key:
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="nvapi-..."
              style={{ flex: 1, padding: '0.45rem 0.7rem', background: 'var(--bg-surface)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-xs)', color: 'var(--text-main)', fontSize: '0.82rem' }}
            />
            <button className="btn-primary" onClick={() => setShowKeyConfig(false)} style={{ padding: '0.45rem 0.9rem', fontSize: '0.82rem' }}>
              Guardar
            </button>
          </div>
        </div>
      )}

      {/* Main Form Controls Bar */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem', marginBottom: '0.85rem' }}>
        
        {/* Specialty Pill Selector */}
        <div style={{ marginBottom: '0.75rem' }}>
          <label style={{ display: 'block', fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', fontWeight: 700 }}>
            Área / Bloque Temático (Temario Oficial SERUMS 2026-II):
          </label>
          <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {Object.values(CATEGORIES).map((c) => {
              const isSelected = singleCategory === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setSingleCategory(c.id)}
                  disabled={isLoadingSingle || isGeneratingMini}
                  style={{
                    padding: '0.28rem 0.6rem',
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
                  {c.shortName || c.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Difficulty Segmented Buttons */}
        <div style={{ marginBottom: '0.75rem' }}>
          <label style={{ display: 'block', fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', fontWeight: 700 }}>
            Nivel de Complejidad:
          </label>
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            {DIFFICULTY_OPTIONS.map((d) => {
              const Icon = d.icon;
              const isSelected = singleDifficulty === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => setSingleDifficulty(d.id)}
                  disabled={isLoadingSingle || isGeneratingMini}
                  style={{
                    flex: '1 1 auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem',
                    padding: '0.38rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.78rem',
                    fontWeight: isSelected ? 700 : 500,
                    background: isSelected ? 'var(--primary-light)' : 'var(--bg-surface)',
                    color: isSelected ? 'var(--primary)' : 'var(--text-secondary)',
                    border: isSelected ? '1.5px solid var(--primary)' : '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    transition: 'var(--transition)'
                  }}
                >
                  <Icon size={14} />
                  <span>{d.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Topic Input */}
        <div style={{ marginBottom: '0.85rem' }}>
          <label style={{ display: 'block', fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: '0.3rem', fontWeight: 700 }}>
            Filtro Temático Libre (Opcional):
          </label>
          <input
            type="text"
            placeholder="ej. Dengue signos de alarma, Esquema Zuspan, NTS Anemia 2024, Vacuna VRS..."
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            disabled={isLoadingSingle || isGeneratingMini}
            style={{ width: '100%', padding: '0.45rem 0.75rem', background: 'var(--bg-surface)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', color: 'var(--text-main)', fontSize: '0.82rem', outline: 'none' }}
          />
        </div>

        {/* Action Buttons: Single Question (1 credit) or Mini Reto (2 questions) */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            className="btn-secondary"
            onClick={handleGenerateMiniChallenge}
            disabled={isLoadingSingle || isGeneratingMini}
            style={{ padding: '0.65rem 1.15rem', fontSize: '0.84rem', fontWeight: 600 }}
            title="Genera un reto corto de 2 preguntas de simulación"
          >
            {isGeneratingMini ? (
              <>
                <RefreshCw size={15} className="animate-spin" />
                <span>Generando 2 preguntas...</span>
              </>
            ) : (
              <>
                <Layers size={15} />
                <span>Mini-Reto (2 Preguntas)</span>
              </>
            )}
          </button>

          <button
            id="btn-generate-ai-single"
            className="btn-primary"
            onClick={handleGenerateNextQuestion}
            disabled={isLoadingSingle || isGeneratingMini}
            style={{ padding: '0.65rem 1.4rem', fontSize: '0.88rem', fontWeight: 700 }}
          >
            {isLoadingSingle ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                <span>Redactando caso ({elapsedSeconds}s)...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>{questionsHistory.length > 0 ? 'Generar Otra Pregunta' : 'Generar Pregunta Inédita'}</span>
              </>
            )}
          </button>
        </div>

        {/* Live Waiting Animated Card */}
        {(isLoadingSingle || isGeneratingMini) && (
          <div style={{ marginTop: '0.85rem', padding: '0.85rem 1rem', background: 'rgba(2, 132, 199, 0.08)', border: '1px dashed rgba(2, 132, 199, 0.4)', borderRadius: 'var(--radius-md)', animation: 'fadeIn 0.3s ease-in' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 600, fontSize: '0.84rem' }}>
                <Cpu size={18} className="animate-pulse" />
                <span>NVIDIA AI analizando literatura médica MINSA...</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.78rem', background: 'var(--bg-surface)', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <Clock size={13} color="var(--primary)" />
                <span>Tiempo: <strong>{elapsedSeconds}s</strong></span>
              </div>
            </div>

            {/* Rotating Medical Flash Tip */}
            <div style={{ background: 'var(--bg-card)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <Lightbulb size={16} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                <strong style={{ color: 'var(--text-main)' }}>Repaso Rápido SERUMS: </strong>
                {WAITING_TIPS[tipIndex]}
              </p>
            </div>
          </div>
        )}

        {singleError && (
          <div style={{ marginTop: '0.75rem', padding: '0.65rem 0.85rem', background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-sm)', color: 'var(--danger)', fontSize: '0.82rem' }}>
            {singleError}
          </div>
        )}
      </div>

      {/* Generated Question Display with Continuous Generation */}
      {questionsHistory.length > 0 && questionsHistory[currentIndex] && (
        <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
          <QuestionCard
            question={questionsHistory[currentIndex]}
            currentIndex={currentIndex}
            totalQuestions={questionsHistory.length}
            selectedOption={userAnswersMap[questionsHistory[currentIndex].id]}
            onSelectOption={(letter) => {
              setUserAnswersMap((prev) => ({
                ...prev,
                [questionsHistory[currentIndex].id]: letter
              }));
            }}
            onNext={handleNext}
            onPrev={handlePrev}
            isFlagged={false}
            onToggleFlag={() => {}}
            isSaved={!!savedQuestions[questionsHistory[currentIndex].id]}
            onToggleSave={() => onToggleSave(questionsHistory[currentIndex])}
            fontSize={fontSize}
            showInstantFeedback={true}
            allowInfiniteNext={true}
            nextButtonLabel={currentIndex === questionsHistory.length - 1 ? 'Siguiente Pregunta IA ✨' : 'Siguiente'}
            isLoadingNext={isLoadingSingle}
          />
        </div>
      )}

    </div>
  );
}

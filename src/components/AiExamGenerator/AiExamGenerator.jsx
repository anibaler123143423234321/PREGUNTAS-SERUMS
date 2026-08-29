import React, { useState, useEffect } from 'react';
import { Sparkles, Cpu, Play, BookOpen, RefreshCw, Key, Layers, CheckCircle2, AlertCircle, Bookmark, ArrowRight, Zap, Download, Lightbulb, Clock } from 'lucide-react';
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

export function AiExamGenerator({
  onStartCustomExam,
  onSaveQuestionToBank,
  savedQuestions,
  onToggleSave,
  fontSize
}) {
  const [subMode, setSubMode] = useState('single'); // 'single' | 'batch'
  const [apiKey, setApiKey] = useLocalStorage('nvidia_custom_api_key', import.meta.env.VITE_NVIDIA_API_KEY || '');
  const [showKeyConfig, setShowKeyConfig] = useState(false);

  // Single Question Mode State
  const [singleCategory, setSingleCategory] = useState('all');
  const [singleDifficulty, setSingleDifficulty] = useState('standard');
  const [customTopic, setCustomTopic] = useState('');
  const [isLoadingSingle, setIsLoadingSingle] = useState(false);
  const [currentSingleQ, setCurrentSingleQ] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [singleError, setSingleError] = useState('');

  // Batch Exam Generation State
  const [batchCount, setBatchCount] = useState(25);
  const [batchCategory, setBatchCategory] = useState('all');
  const [batchDifficulty, setBatchDifficulty] = useState('standard');
  const [isGeneratingBatch, setIsGeneratingBatch] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });
  const [generatedExamList, setGeneratedExamList] = useState([]);
  const [batchError, setBatchError] = useState('');

  // Timer & Tip Rotation for Waiting Experience
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    let intervalTimer = null;
    let tipTimer = null;

    if (isLoadingSingle || isGeneratingBatch) {
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
  }, [isLoadingSingle, isGeneratingBatch]);

  // Handle single question generation
  const handleGenerateSingle = async () => {
    setIsLoadingSingle(true);
    setSingleError('');
    setSelectedOption(null);
    try {
      const q = await generateSingleQuestion({
        category: singleCategory,
        difficulty: singleDifficulty,
        topic: customTopic,
        apiKey
      });
      setCurrentSingleQ(q);
    } catch (err) {
      setSingleError(err.message || 'Error al generar la pregunta con NVIDIA AI.');
    } finally {
      setIsLoadingSingle(false);
    }
  };

  // Handle batch exam generation
  const handleGenerateBatch = async () => {
    setIsGeneratingBatch(true);
    setBatchError('');
    setGeneratedExamList([]);
    setBatchProgress({ current: 0, total: batchCount });

    try {
      const questions = await generateExamBatch({
        totalQuestions: batchCount,
        category: batchCategory,
        difficulty: batchDifficulty,
        topic: customTopic,
        apiKey,
        onProgress: (current, total) => {
          setBatchProgress({ current, total });
        }
      });
      setGeneratedExamList(questions);
    } catch (err) {
      setBatchError(err.message || 'Error durante la generación masiva.');
    } finally {
      setIsGeneratingBatch(false);
    }
  };

  return (
    <div className="ai-exam-generator-view" id="ai-exam-generator-view" style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Banner Header */}
      <div style={{ background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)', border: '1px solid rgba(2, 132, 199, 0.35)', borderRadius: 'var(--radius-lg)', padding: '1.75rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.2rem 0.6rem', background: 'rgba(139, 92, 246, 0.2)', color: '#a78bfa', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            <Cpu size={14} />
            <span>NVIDIA NIM AI • LLaMA 3.2 11B/90B</span>
          </div>
          <h2 style={{ fontSize: '1.6rem', marginBottom: '0.35rem' }}>
            Generador de Preguntas y Exámenes con IA
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '620px' }}>
            Genera preguntas inéditas en tiempo real calibradas con las Normas Técnicas del MINSA, o crea un simulacro completo de hasta 100 preguntas asistido por IA.
          </p>
        </div>

        <button
          className="action-btn-sm"
          onClick={() => setShowKeyConfig(!showKeyConfig)}
          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-medium)', color: 'var(--text-main)' }}
        >
          <Key size={16} />
          <span>Configurar API Key</span>
        </button>
      </div>

      {/* API Key Config Dropdown */}
      {showKeyConfig && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.25rem', marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
            NVIDIA API Key (Portal build.nvidia.com):
          </label>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="nvapi-..."
              style={{ flex: 1, padding: '0.6rem 0.8rem', background: 'var(--bg-surface)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', fontSize: '0.85rem' }}
            />
            <button className="btn-primary" onClick={() => setShowKeyConfig(false)}>
              Guardar
            </button>
          </div>
        </div>
      )}

      {/* Submode Switcher */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.75rem' }}>
        <button
          className={`btn-secondary ${subMode === 'single' ? 'active' : ''}`}
          onClick={() => setSubMode('single')}
          style={{
            flex: 1,
            justifyContent: 'center',
            backgroundColor: subMode === 'single' ? 'var(--primary)' : 'var(--bg-card)',
            color: subMode === 'single' ? '#ffffff' : 'var(--text-secondary)'
          }}
        >
          <Zap size={18} />
          <span>Modo Uno a Uno (On-Demand)</span>
        </button>

        <button
          className={`btn-secondary ${subMode === 'batch' ? 'active' : ''}`}
          onClick={() => setSubMode('batch')}
          style={{
            flex: 1,
            justifyContent: 'center',
            backgroundColor: subMode === 'batch' ? 'var(--primary)' : 'var(--bg-card)',
            color: subMode === 'batch' ? '#ffffff' : 'var(--text-secondary)'
          }}
        >
          <Layers size={18} />
          <span>Generar Simulacro Completo (10 a 100 preguntas)</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: SINGLE QUESTION (ON-DEMAND)                                       */}
      {/* ========================================================================= */}
      {subMode === 'single' && (
        <div>
          {/* Controls Bar */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', fontWeight: 600 }}>
                  Especialidad:
                </label>
                <select
                  className="exam-selector-select"
                  value={singleCategory}
                  onChange={(e) => setSingleCategory(e.target.value)}
                  style={{ width: '100%', background: 'var(--bg-surface)' }}
                  disabled={isLoadingSingle}
                >
                  {Object.values(CATEGORIES).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', fontWeight: 600 }}>
                  Nivel de Dificultad:
                </label>
                <select
                  className="exam-selector-select"
                  value={singleDifficulty}
                  onChange={(e) => setSingleDifficulty(e.target.value)}
                  style={{ width: '100%', background: 'var(--bg-surface)' }}
                  disabled={isLoadingSingle}
                >
                  <option value="standard">Estándar SERUMS (MINSA)</option>
                  <option value="high">Alta Complejidad / Casos Retadores</option>
                  <option value="normative">Normativa Técnica Pura (NTS)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', fontWeight: 600 }}>
                  Tema Libre (Opcional):
                </label>
                <input
                  type="text"
                  placeholder="ej. Dengue con signos de alarma, CRED..."
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  disabled={isLoadingSingle}
                  style={{ width: '100%', padding: '0.5rem 0.8rem', background: 'var(--bg-surface)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', color: 'var(--text-main)', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                id="btn-generate-ai-single"
                className="btn-primary"
                onClick={handleGenerateSingle}
                disabled={isLoadingSingle}
                style={{ padding: '0.75rem 1.75rem' }}
              >
                {isLoadingSingle ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    <span>Redactando caso clínico ({elapsedSeconds}s)...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    <span>{currentSingleQ ? 'Generar Otra Pregunta con IA' : 'Generar Pregunta con IA'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Live Waiting Animated Card */}
            {isLoadingSingle && (
              <div style={{ marginTop: '1.5rem', padding: '1.25rem 1.5rem', background: 'rgba(2, 132, 199, 0.08)', border: '1px dashed rgba(2, 132, 199, 0.4)', borderRadius: 'var(--radius-md)', animation: 'fadeIn 0.3s ease-in' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--primary)', fontWeight: 600, fontSize: '0.92rem' }}>
                    <Cpu size={20} className="animate-pulse" />
                    <span>NVIDIA AI está analizando la literatura médica del MINSA...</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem', background: 'var(--bg-surface)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <Clock size={14} color="var(--primary)" />
                    <span>Tiempo transcurrido: <strong>{elapsedSeconds}s</strong></span>
                  </div>
                </div>

                {/* Rotating Medical Flash Tip */}
                <div style={{ background: 'var(--bg-card)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                  <Lightbulb size={18} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4, transition: 'all 0.3s ease' }}>
                    <strong style={{ color: 'var(--text-main)' }}>Repaso Rápido SERUMS: </strong>
                    {WAITING_TIPS[tipIndex]}
                  </p>
                </div>
              </div>
            )}

            {singleError && (
              <div style={{ marginTop: '1rem', padding: '0.85rem', background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-sm)', color: 'var(--danger)', fontSize: '0.85rem' }}>
                {singleError}
              </div>
            )}
          </div>

          {/* Generated Question Display */}
          {currentSingleQ && !isLoadingSingle && (
            <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
              <QuestionCard
                question={currentSingleQ}
                currentIndex={0}
                totalQuestions={1}
                selectedOption={selectedOption}
                onSelectOption={(letter) => setSelectedOption(letter)}
                onNext={handleGenerateSingle}
                onPrev={() => {}}
                isFlagged={false}
                onToggleFlag={() => {}}
                isSaved={!!savedQuestions[currentSingleQ.id]}
                onToggleSave={() => onToggleSave(currentSingleQ)}
                fontSize={fontSize}
                showInstantFeedback={true}
              />
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: BATCH SIMULATION GENERATION (10 TO 100 QUESTIONS)                 */}
      {/* ========================================================================= */}
      {subMode === 'batch' && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={22} color="var(--primary)" />
            Configuración del Simulacro Inédito con IA
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
            NVIDIA NIM generará un conjunto completo de preguntas calibradas con las ponderaciones oficiales del MINSA.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Cantidad de Preguntas:
              </label>
              <select
                className="exam-selector-select"
                value={batchCount}
                onChange={(e) => setBatchCount(Number(e.target.value))}
                style={{ width: '100%', background: 'var(--bg-surface)' }}
                disabled={isGeneratingBatch}
              >
                <option value={10}>10 Preguntas (Simulacro Rápido - ~15 min)</option>
                <option value={25}>25 Preguntas (Simulacro Medio - ~35 min)</option>
                <option value={50}>50 Preguntas (Medio Examen - ~1 hora)</option>
                <option value={100}>100 Preguntas (Examen Completo Oficial - 2 horas)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Distribución Temática:
              </label>
              <select
                className="exam-selector-select"
                value={batchCategory}
                onChange={(e) => setBatchCategory(e.target.value)}
                style={{ width: '100%', background: 'var(--bg-surface)' }}
                disabled={isGeneratingBatch}
              >
                <option value="all">Matriz Equilibrada MINSA (Todas las áreas)</option>
                {Object.values(CATEGORIES).filter(c => c.id !== 'all').map((c) => (
                  <option key={c.id} value={c.id}>
                    Solo {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Complejidad del Examen:
              </label>
              <select
                className="exam-selector-select"
                value={batchDifficulty}
                onChange={(e) => setBatchDifficulty(e.target.value)}
                style={{ width: '100%', background: 'var(--bg-surface)' }}
                disabled={isGeneratingBatch}
              >
                <option value="standard">Oficial MINSA (Nivel Real)</option>
                <option value="high">Avanzado (Para asegurar Top 5% de plazas)</option>
              </select>
            </div>
          </div>

          {/* Progress Bar while generating */}
          {isGeneratingBatch && (
            <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', animation: 'fadeIn 0.3s ease-in' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600, flexWrap: 'wrap', gap: '0.5rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                  <Cpu size={18} className="animate-spin" />
                  Redactando preguntas con NVIDIA NIM AI ({elapsedSeconds}s transcurridos)...
                </span>
                <span>{batchProgress.current} / {batchProgress.total} generadas</span>
              </div>
              <div className="progress-bar-bg" style={{ height: '10px', marginBottom: '1rem' }}>
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${batchProgress.total > 0 ? (batchProgress.current / batchProgress.total) * 100 : 0}%`,
                    backgroundColor: 'var(--primary)'
                  }}
                />
              </div>

              {/* Rotating tip during batch generation */}
              <div style={{ background: 'var(--bg-card)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                <Lightbulb size={18} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                  <strong style={{ color: 'var(--text-main)' }}>Tip SERUMS mientras esperas: </strong>
                  {WAITING_TIPS[tipIndex]}
                </p>
              </div>
            </div>
          )}

          {batchError && (
            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-md)', color: 'var(--danger)', fontSize: '0.9rem' }}>
              {batchError}
            </div>
          )}

          {/* Start Generation Button */}
          {!isGeneratingBatch && generatedExamList.length === 0 && (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                id="btn-start-batch-ai"
                className="btn-primary"
                onClick={handleGenerateBatch}
                style={{ padding: '0.85rem 2.5rem', fontSize: '1rem' }}
              >
                <Sparkles size={20} />
                <span>Generar {batchCount} Preguntas Inéditas con IA</span>
              </button>
            </div>
          )}

          {/* Generated Exam Ready Card */}
          {generatedExamList.length > 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--success-border)', animation: 'fadeIn 0.3s ease-out' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                <CheckCircle2 size={32} color="var(--success)" />
              </div>
              <h3 style={{ fontSize: '1.35rem', marginBottom: '0.4rem', color: 'var(--text-main)' }}>
                ¡Simulacro de {generatedExamList.length} Preguntas Listo!
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', maxWidth: '540px', margin: '0 auto 1.5rem auto' }}>
                El examen inédito ha sido redactado con éxito. Puedes iniciarlo ahora mismo en la modalidad oficial o guardarlo en tu banco.
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <button
                  className="btn-primary"
                  onClick={() => onStartCustomExam(generatedExamList)}
                  style={{ padding: '0.85rem 2rem' }}
                >
                  <Play size={18} />
                  <span>Rendir Simulacro Oficial con este Examen</span>
                </button>

                <button
                  className="btn-secondary"
                  onClick={() => {
                    if (onSaveQuestionToBank) {
                      generatedExamList.forEach((q) => onSaveQuestionToBank(q));
                    }
                    alert(`¡${generatedExamList.length} preguntas guardadas en tus Favoritas!`);
                  }}
                >
                  <Bookmark size={18} />
                  <span>Guardar todas en Mis Favoritas</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

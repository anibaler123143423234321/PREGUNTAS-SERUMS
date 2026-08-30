import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Sparkles, Cpu, RefreshCw, Key, Layers, CheckCircle2, Bookmark, Zap, Lightbulb, Clock, Target, ShieldCheck, Flame, Play, Tag, Database, Cloud, Check, AlertCircle, FileText, Image, Trash2, X, Download } from 'lucide-react';
import { toPng } from 'html-to-image';
import { CATEGORIES } from '../../data/categories';
import { generateSingleQuestion, generateExamBatch } from '../../services/aiService';
import { SERUMS_PEARLS_BY_CATEGORY, HIGH_YIELD_TOPIC_PILLS } from '../../data/serumsPearls';
import {
  saveAiQuestionToCloud,
  getActiveSupabaseCredentials,
  saveSupabaseCredentials,
  testSupabaseConnection,
  isSupabaseConfigured
} from '../../services/supabaseClient';
import { QuestionCard } from '../ExamSimulator/QuestionCard';
import { DocsModal } from '../DocsModal/DocsModal';
import { useLocalStorage } from '../../hooks/useLocalStorage';

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
  const defaultAiKey = import.meta.env.VITE_GROQ_API_KEY || import.meta.env.VITE_NVIDIA_API_KEY || '';
  const [apiKey, setApiKey] = useLocalStorage('serums_ai_active_api_key', defaultAiKey);
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [showDocs, setShowDocs] = useState(false);
  const [isExportingPng, setIsExportingPng] = useState(false);
  const questionCardRef = useRef(null);

  // Supabase Cloud Configuration State
  const initialCreds = getActiveSupabaseCredentials();
  const [supabaseUrl, setSupabaseUrl] = useState(initialCreds.url);
  const [supabaseKey, setSupabaseKey] = useState(initialCreds.anonKey);
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [supabaseTestResult, setSupabaseTestResult] = useState(null);
  const [isCloudEnabled, setIsCloudEnabled] = useState(isSupabaseConfigured());
  const [cloudSyncStatus, setCloudSyncStatus] = useState(null); // 'saving' | 'saved' | 'error'

  // Persistent Single Question Mode State (conservado al cambiar de tab o recargar)
  const [singleCategory, setSingleCategory] = useLocalStorage('serums_ai_category', 'all');
  const [singleDifficulty, setSingleDifficulty] = useLocalStorage('serums_ai_difficulty', 'standard');
  const [customTopic, setCustomTopic] = useLocalStorage('serums_ai_topic', '');
  const [isLoadingSingle, setIsLoadingSingle] = useState(false);
  const [questionsHistory, setQuestionsHistory] = useLocalStorage('serums_ai_history', []);
  const [currentIndex, setCurrentIndex] = useLocalStorage('serums_ai_current_idx', 0);
  const [userAnswersMap, setUserAnswersMap] = useLocalStorage('serums_ai_user_answers', {});
  const [singleError, setSingleError] = useState('');

  // Reiniciar historial de preguntas IA
  const handleClearAiSession = () => {
    setQuestionsHistory([]);
    setCurrentIndex(0);
    setUserAnswersMap({});
  };

  // Guardar credenciales de Supabase
  const handleSaveSupabaseConfig = () => {
    saveSupabaseCredentials(supabaseUrl, supabaseKey);
    setIsCloudEnabled(isSupabaseConfigured());
    setShowKeyConfig(false);
  };

  // Probar conexión con Supabase
  const handleTestSupabase = async () => {
    setIsTestingSupabase(true);
    setSupabaseTestResult(null);
    try {
      saveSupabaseCredentials(supabaseUrl, supabaseKey);
      await testSupabaseConnection();
      setSupabaseTestResult({ success: true, message: '¡Conexión exitosa con la tabla "preguntas_ia"!' });
      setIsCloudEnabled(true);
    } catch (err) {
      setSupabaseTestResult({ success: false, message: err.message });
    } finally {
      setIsTestingSupabase(false);
    }
  };

  // Mini-Exam State (Max 2 questions to strictly protect NVIDIA credits)
  const [isGeneratingMini, setIsGeneratingMini] = useState(false);
  const [miniExamQuestions, setMiniExamQuestions] = useState([]);

  // Dynamic Categorized Pearls for Waiting Screen
  const activePearlsList = useMemo(() => {
    return SERUMS_PEARLS_BY_CATEGORY[singleCategory] || SERUMS_PEARLS_BY_CATEGORY.all;
  }, [singleCategory]);

  // Timer & Tip Rotation for Waiting Experience (Randomized start)
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    let intervalTimer = null;
    let tipTimer = null;

    if (isLoadingSingle || isGeneratingMini) {
      setElapsedSeconds(0);
      // Pick a random starting tip so it's always different
      setTipIndex(Math.floor(Math.random() * activePearlsList.length));

      intervalTimer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);

      tipTimer = setInterval(() => {
        setTipIndex((prev) => (prev + 1) % activePearlsList.length);
      }, 3500);
    } else {
      setElapsedSeconds(0);
    }

    return () => {
      if (intervalTimer) clearInterval(intervalTimer);
      if (tipTimer) clearInterval(tipTimer);
    };
  }, [isLoadingSingle, isGeneratingMini, activePearlsList]);

  // Handle single question generation (generates, saves locally and syncs to Supabase Cloud)
  const handleGenerateNextQuestion = async () => {
    setIsLoadingSingle(true);
    setSingleError('');
    setCloudSyncStatus(null);
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

      // Auto-guardado en Supabase Cloud si está configurado
      if (isSupabaseConfigured()) {
        setCloudSyncStatus('saving');
        const res = await saveAiQuestionToCloud(q);
        if (res.success) {
          setCloudSyncStatus('saved');
        } else {
          setCloudSyncStatus('error');
        }
      }
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

  // Descargar la pregunta actual en archivo de texto .txt estructurado
  const handleDownloadTxt = (question) => {
    if (!question) return;
    const opt = question.options || {};
    const txtContent = `================================================================================
CODESOFT SERUMS 2026 — CASO CLÍNICO OFICIAL DE EXAMEN
================================================================================
ÁREA / BLOQUE TEMÁTICO : ${question.category ? question.category.toUpperCase() : 'SALUD PÚBLICA'}
ORIGEN & MOTOR         : ${question.year || 'Generado con IA (Groq LPU)'}
FECHA DE GENERACIÓN    : ${new Date().toLocaleDateString('es-PE')} ${new Date().toLocaleTimeString('es-PE')}

--------------------------------------------------------------------------------
ENUNCIADO / CASO CLÍNICO:
--------------------------------------------------------------------------------
${question.question}

--------------------------------------------------------------------------------
ALTERNATIVAS DE RESPUESTA:
--------------------------------------------------------------------------------
A) ${opt.A || ''}
B) ${opt.B || ''}
C) ${opt.C || ''}
D) ${opt.D || ''}

--------------------------------------------------------------------------------
RESPUESTA CORRECTA:
--------------------------------------------------------------------------------
CLAVE OFICIAL: [ ${question.correctAnswer} ] - ${opt[question.correctAnswer] || ''}

--------------------------------------------------------------------------------
JUSTIFICACIÓN CLÍNICA & NORMATIVA MINSA:
--------------------------------------------------------------------------------
${question.explanation || 'Sin fundamentación clínica.'}

--------------------------------------------------------------------------------
PERLA DE ALTO RENDIMIENTO SERUMS:
--------------------------------------------------------------------------------
${question.pearl || 'Sin perla disponible.'}

REFERENCIAS NORMATIVAS: ${question.references || 'Normas Técnicas de Salud MINSA'}
================================================================================
Plataforma Médica CODESOFT SERUMS 2026 • https://codesoft-serums.pe
================================================================================
`;
    const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `pregunta_serums_${question.category || 'ia'}_${Date.now()}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  // Descargar captura en imagen PNG de alta resolución
  const handleDownloadPng = async () => {
    if (!questionCardRef.current) return;
    try {
      setIsExportingPng(true);
      const dataUrl = await toPng(questionCardRef.current, {
        cacheBust: true,
        backgroundColor: '#0f172a',
        pixelRatio: 2
      });
      const link = document.createElement('a');
      link.download = `pregunta_serums_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error al generar imagen PNG:', err);
      alert('No se pudo generar la imagen PNG. Intenta descargar en .txt o .json.');
    } finally {
      setIsExportingPng(false);
    }
  };

  // Limpiar / Cerrar la pregunta de la pantalla
  const handleClearQuestion = () => {
    if (window.confirm('¿Deseas limpiar y cerrar la pregunta actual de la pantalla?')) {
      setQuestionsHistory([]);
      setCurrentIndex(0);
      setUserAnswersMap({});
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.15rem 0.5rem', background: 'rgba(139, 92, 246, 0.2)', color: '#a78bfa', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', fontWeight: 700 }}>
              <Cpu size={13} />
              <span>
                {apiKey?.startsWith('gsk_')
                  ? '⚡ Groq LPU (Ultra Rápido ~0.8s)'
                  : apiKey?.startsWith('AIzaSy')
                  ? '⚡ Google Gemini Flash (~1.5s)'
                  : 'NVIDIA AI (LLaMA 3.2)'}
              </span>
            </div>

            {isCloudEnabled ? (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.15rem 0.5rem', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', fontWeight: 700, border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                <Cloud size={12} />
                <span>Supabase Cloud Conectado</span>
              </div>
            ) : (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.15rem 0.5rem', background: 'rgba(148, 163, 184, 0.15)', color: 'var(--text-muted)', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', fontWeight: 600 }}>
                <Database size={12} />
                <span>Guardado Local</span>
              </div>
            )}
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
          <Database size={14} />
          <span>Configurar Claves & Cloud</span>
        </button>
      </div>

      {/* Configuration Dropdown (Groq / Gemini / NVIDIA & Supabase Cloud) */}
      {showKeyConfig && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '0.85rem', animation: 'fadeIn 0.2s ease-in' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h4 style={{ fontSize: '0.9rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}>
              <Key size={16} color="var(--primary)" />
              <span>Configuración de Motores de IA y Base de Datos</span>
            </h4>
            <button
              type="button"
              className="action-btn-sm"
              onClick={() => setShowDocs(true)}
              style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem', background: 'rgba(2, 132, 199, 0.1)', borderColor: 'var(--primary)', color: 'var(--primary)' }}
            >
              📚 Ver Cuotas & Documentación
            </button>
          </div>

          {/* AI Engine Key */}
          <div style={{ marginBottom: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
              <label style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                1. Clave de API de IA (Groq [gsk_...], Gemini [AIzaSy...] o NVIDIA [nvapi-...]):
              </label>
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: '0.7rem', color: 'var(--primary)', textDecoration: 'underline' }}
              >
                ⚡ Obtener clave gratis de Groq (Ultra Rápido)
              </a>
            </div>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Pega tu clave de Groq (gsk_...), Gemini (AIzaSy...) o NVIDIA (nvapi-...)"
              style={{ width: '100%', padding: '0.45rem 0.7rem', background: 'var(--bg-surface)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-xs)', color: 'var(--text-main)', fontSize: '0.82rem' }}
            />
          </div>

          {/* Supabase Cloud Configuration */}
          <div style={{ padding: '0.75rem', background: 'rgba(2, 132, 199, 0.04)', border: '1px solid rgba(2, 132, 199, 0.2)', borderRadius: 'var(--radius-sm)', marginBottom: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Cloud size={14} color="var(--primary)" />
                <span>2. Base de Datos Supabase (PostgreSQL Gratuito):</span>
              </label>
              <span style={{ fontSize: '0.7rem', color: 'var(--primary)' }}>Tabla: preguntas_ia</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.15rem' }}>Project URL:</label>
                <input
                  type="text"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  placeholder="https://xyzcompany.supabase.co"
                  style={{ width: '100%', padding: '0.4rem 0.65rem', background: 'var(--bg-surface)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-xs)', color: 'var(--text-main)', fontSize: '0.78rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.15rem' }}>Anon Public API Key (Token):</label>
                <input
                  type="password"
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                  style={{ width: '100%', padding: '0.4rem 0.65rem', background: 'var(--bg-surface)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-xs)', color: 'var(--text-main)', fontSize: '0.78rem' }}
                />
              </div>
            </div>

            {/* Test result feedback */}
            {supabaseTestResult && (
              <div style={{ padding: '0.4rem 0.65rem', borderRadius: 'var(--radius-xs)', fontSize: '0.75rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', background: supabaseTestResult.success ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: supabaseTestResult.success ? '#34d399' : 'var(--danger)', border: supabaseTestResult.success ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)' }}>
                {supabaseTestResult.success ? <Check size={14} /> : <AlertCircle size={14} />}
                <span>{supabaseTestResult.message}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
              <button
                type="button"
                className="action-btn-sm"
                onClick={handleTestSupabase}
                disabled={isTestingSupabase || !supabaseUrl || !supabaseKey}
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
              >
                {isTestingSupabase ? <RefreshCw size={13} className="animate-spin" /> : <Database size={13} />}
                <span>{isTestingSupabase ? 'Verificando...' : 'Probar Conexión'}</span>
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button className="btn-secondary" onClick={() => setShowKeyConfig(false)} style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}>
              Cancelar
            </button>
            <button className="btn-primary" onClick={handleSaveSupabaseConfig} style={{ padding: '0.45rem 1.1rem', fontSize: '0.8rem' }}>
              Guardar Configuración
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

        {/* Custom Topic Input & Quick High-Yield Pills */}
        <div style={{ marginBottom: '0.85rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
            <label style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
              Filtro Temático Libre (Opcional):
            </label>
            {customTopic && (
              <button
                onClick={() => setCustomTopic('')}
                style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontSize: '0.72rem', cursor: 'pointer', padding: 0 }}
              >
                Limpiar filtro
              </button>
            )}
          </div>
          <input
            type="text"
            placeholder="ej. Dengue signos de alarma, Esquema Zuspan, NTS Anemia 2024, Vacuna VRS..."
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            disabled={isLoadingSingle || isGeneratingMini}
            style={{ width: '100%', padding: '0.45rem 0.75rem', background: 'var(--bg-surface)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', color: 'var(--text-main)', fontSize: '0.82rem', outline: 'none', marginBottom: '0.45rem' }}
          />

          {/* Quick Clickable High-Yield Topics */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem', marginRight: '0.15rem' }}>
              <Tag size={11} /> Fijas:
            </span>
            {HIGH_YIELD_TOPIC_PILLS.slice(0, 8).map((p, pIdx) => {
              const isPillActive = customTopic === p.topic;
              return (
                <button
                  key={pIdx}
                  type="button"
                  onClick={() => setCustomTopic(isPillActive ? '' : p.topic)}
                  disabled={isLoadingSingle || isGeneratingMini}
                  style={{
                    padding: '0.18rem 0.5rem',
                    fontSize: '0.7rem',
                    borderRadius: 'var(--radius-full)',
                    background: isPillActive ? 'var(--primary-light)' : 'var(--bg-surface)',
                    color: isPillActive ? 'var(--primary)' : 'var(--text-secondary)',
                    border: isPillActive ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons: Single Question (1 credit) or Mini Reto (2 questions) */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {questionsHistory.length > 0 && (
            <button
              type="button"
              className="action-btn-sm"
              onClick={handleClearAiSession}
              disabled={isLoadingSingle || isGeneratingMini}
              style={{ background: 'transparent', borderColor: 'var(--border-medium)', color: 'var(--text-muted)', fontSize: '0.78rem', padding: '0.45rem 0.8rem' }}
              title="Borra las preguntas de la sesión actual y empieza desde cero"
            >
              <RefreshCw size={13} />
              <span>Nueva Sesión</span>
            </button>
          )}

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

        {/* Live Waiting Animated Card with Dynamic Randomized Pearls */}
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

            {/* Rotating Medical Flash Tip from 60+ categorized pearls */}
            <div style={{ background: 'var(--bg-card)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <Lightbulb size={16} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                <strong style={{ color: '#f59e0b' }}>Repaso Rápido SERUMS: </strong>
                <span>{activePearlsList[tipIndex % activePearlsList.length]}</span>
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
          {/* Action Toolbar: Downloads (.txt, .png, .json), Cloud Sync & Clear Button */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', gap: '0.4rem', flexWrap: 'wrap', background: 'var(--bg-surface)', padding: '0.35rem 0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            {/* Download Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="action-btn-sm"
                onClick={() => handleDownloadTxt(questionsHistory[currentIndex])}
                style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem', background: 'var(--bg-card)', borderColor: 'var(--border-medium)', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                title="Descargar esta pregunta en archivo de texto plano (.txt)"
              >
                <FileText size={12} color="var(--primary)" />
                <span>Descargar .txt</span>
              </button>

              <button
                type="button"
                className="action-btn-sm"
                onClick={handleDownloadPng}
                disabled={isExportingPng}
                style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem', background: 'var(--bg-card)', borderColor: 'var(--border-medium)', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                title="Descargar captura en imagen PNG de alta resolución"
              >
                {isExportingPng ? <RefreshCw size={12} className="animate-spin" /> : <Image size={12} color="#10b981" />}
                <span>{isExportingPng ? 'Generando...' : 'Descargar .png'}</span>
              </button>

              <button
                type="button"
                className="action-btn-sm"
                onClick={() => {
                  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(questionsHistory, null, 2));
                  const downloadAnchor = document.createElement('a');
                  downloadAnchor.setAttribute("href", dataStr);
                  downloadAnchor.setAttribute("download", `preguntas_ia_serums_${Date.now()}.json`);
                  document.body.appendChild(downloadAnchor);
                  downloadAnchor.click();
                  downloadAnchor.remove();
                }}
                style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem', background: 'var(--bg-card)', borderColor: 'var(--border-medium)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                title="Descargar todas las preguntas generadas en formato JSON estructurado"
              >
                <Download size={12} />
                <span>Sesión .json</span>
              </button>
            </div>

            {/* Right Status & Clear Question (X) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {isCloudEnabled && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.74rem' }}>
                  {cloudSyncStatus === 'saving' && (
                    <span style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <RefreshCw size={12} className="animate-spin" /> Guardando...
                    </span>
                  )}
                  {cloudSyncStatus === 'saved' && (
                    <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
                      <Check size={13} /> Cloud OK
                    </span>
                  )}
                  {cloudSyncStatus === 'error' && (
                    <span style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <AlertCircle size={13} /> Error Cloud
                    </span>
                  )}
                </div>
              )}

              {/* Botón X para Limpiar Pregunta */}
              <button
                type="button"
                className="action-btn-sm"
                onClick={handleClearQuestion}
                style={{
                  fontSize: '0.72rem',
                  padding: '0.2rem 0.55rem',
                  background: 'rgba(239, 68, 68, 0.1)',
                  borderColor: 'rgba(239, 68, 68, 0.3)',
                  color: 'var(--danger)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontWeight: 600
                }}
                title="Limpiar y cerrar la pregunta actual de la pantalla"
              >
                <X size={13} />
                <span>Limpiar</span>
              </button>
            </div>
          </div>

          {/* Question Card Container for PNG snapshot */}
          <div ref={questionCardRef} style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)' }}>
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
        </div>
      )}

      {showDocs && (
        <DocsModal
          isOpen={showDocs}
          onClose={() => setShowDocs(false)}
        />
      )}
    </div>
  );
}

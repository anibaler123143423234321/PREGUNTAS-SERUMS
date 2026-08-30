import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { NavigationBar } from './components/NavigationBar';
import { ExamSimulator } from './components/ExamSimulator/ExamSimulator';
import { TutorMode } from './components/TutorMode/TutorMode';
import { Flashcards } from './components/Flashcards/Flashcards';
import { MistakeBank } from './components/MistakeBank/MistakeBank';
import { AnalyticsDashboard } from './components/Analytics/AnalyticsDashboard';
import { QuestionFinder } from './components/QuestionFinder/QuestionFinder';
import { ExportModal } from './components/ExportModal/ExportModal';
import { DocsModal } from './components/DocsModal/DocsModal';
import { AuthModal } from './components/Auth/AuthModal';
import { AuthGate } from './components/Auth/AuthGate';
import { AiExamGenerator } from './components/AiExamGenerator/AiExamGenerator';
import { AcademiesRanking } from './components/AcademiesRanking/AcademiesRanking';
import { QUESTIONS_DATA } from './data/questionsData';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useAuth } from './hooks/useAuth';
import {
  loadUserDataFromCloud,
  syncSavedQuestionToCloud,
  syncMistakeToCloud,
  syncExamHistoryToCloud
} from './services/userSyncService';
import { Stethoscope } from 'lucide-react';
import { EcgHeartbeatLoader, PulseRadarLoader } from './components/Common/AnimatedIcons';

export function App() {
  // Autenticación de Usuario (Supabase Auth / Google OAuth)
  const { user, loading: authLoading, isAuthenticated } = useAuth();

  // Tema y Accesibilidad
  const [theme, setTheme] = useLocalStorage('serums_theme', 'dark');
  const [fontSize, setFontSize] = useLocalStorage('serums_font_size', 1.05);

  // Navegacion y Seleccion de Modulos
  const [activeTab, setActiveTab] = useState('ai');
  const [lastActiveTab, setLastActiveTab] = useState('ai');
  const [selectedYear, setSelectedYear] = useState('2026-II');
  const [showExportModal, setShowExportModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [customAiExam, setCustomAiExam] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Datos Persistentes del Medico
  const [savedQuestions, setSavedQuestions] = useLocalStorage('serums_saved_q', {});
  const [mistakes, setMistakes] = useLocalStorage('serums_mistakes', []);
  const [examHistory, setExamHistory] = useLocalStorage('serums_history', []);

  // Sincronizar atributo data-theme en el elemento raiz HTML
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Cargar y sincronizar datos del médico desde Supabase Cloud al iniciar sesión
  useEffect(() => {
    if (user?.id) {
      loadUserDataFromCloud(user.id).then(({ savedQuestions: cloudSaved, mistakes: cloudMistakes, examHistory: cloudHistory }) => {
        if (cloudSaved && Object.keys(cloudSaved).length > 0) {
          setSavedQuestions((prev) => ({ ...prev, ...cloudSaved }));
        }
        if (cloudMistakes && cloudMistakes.length > 0) {
          setMistakes((prev) => {
            const map = new Map();
            [...cloudMistakes, ...prev].forEach((m) => map.set(m.id, m));
            return Array.from(map.values());
          });
        }
        if (cloudHistory && cloudHistory.length > 0) {
          setExamHistory((prev) => {
            const map = new Map();
            [...cloudHistory, ...prev].forEach((h) => map.set(h.id || h.date, h));
            return Array.from(map.values());
          });
        }
      }).catch((err) => {
        console.warn('Error al cargar datos desde Supabase:', err);
      });
    }
  }, [user?.id]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleIncreaseFontSize = () => {
    setFontSize((prev) => Math.min(prev + 0.08, 1.4));
  };

  const handleDecreaseFontSize = () => {
    setFontSize((prev) => Math.max(prev - 0.08, 0.85));
  };

  // Alternar guardado de pregunta destacada y sincronizar con Supabase Cloud
  const handleToggleSave = (question) => {
    setSavedQuestions((prev) => {
      const next = { ...prev };
      const isSaving = !next[question.id];
      if (!isSaving) {
        delete next[question.id];
      } else {
        next[question.id] = question;
      }
      
      if (user?.id) {
        syncSavedQuestionToCloud(user.id, question, isSaving);
      }
      return next;
    });
  };

  // Record Mistakes from exam completion
  const handleRecordMistakes = (failedQuestions) => {
    setMistakes((prev) => {
      const existingIds = new Set(prev.map((q) => q.id));
      const newItems = failedQuestions.filter((q) => !existingIds.has(q.id));
      
      if (user?.id) {
        newItems.forEach((item) => syncMistakeToCloud(user.id, item, true));
      }
      return [...prev, ...newItems];
    });
  };

  const handleRemoveMistake = (qId) => {
    setMistakes((prev) => {
      const target = prev.find((q) => q.id === qId);
      if (user?.id && target) {
        syncMistakeToCloud(user.id, target, false);
      }
      return prev.filter((q) => q.id !== qId);
    });
  };

  const handleClearMistakes = () => {
    if (user?.id) {
      mistakes.forEach((m) => syncMistakeToCloud(user.id, m, false));
    }
    setMistakes([]);
  };

  const handleSaveExamHistory = (record) => {
    setExamHistory((prev) => [...prev, record]);
    if (user?.id) {
      syncExamHistoryToCloud(user.id, record);
    }
  };

  const handleStartCustomExam = (generatedQuestions) => {
    setCustomAiExam(generatedQuestions);
    setActiveTab('exam');
  };

  // Filter questions for the selected exam process
  const activeQuestions = useMemo(() => {
    if (customAiExam && customAiExam.length > 0) {
      return customAiExam;
    }
    if (selectedYear === 'all') return QUESTIONS_DATA;
    return QUESTIONS_DATA.filter((q) => q.year === selectedYear);
  }, [selectedYear, customAiExam]);

  // Pantalla de carga mientras se verifica la sesión en Supabase
  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', color: 'var(--primary)', padding: '1rem' }}>
        <div style={{ textAlign: 'center', background: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-lg)', padding: '2rem 2.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.25)', maxWidth: '380px', width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <EcgHeartbeatLoader size={46} color="var(--primary)" />
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 800, margin: '0 0 0.4rem 0' }}>CODESOFT SERUMS 2027</p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
            <PulseRadarLoader size={14} color="var(--primary)" />
            <span>Verificando credenciales médicas...</span>
          </div>
        </div>
      </div>
    );
  }

  // Si no está autenticado, exigir inicio de sesión / creación de cuenta
  if (!isAuthenticated) {
    return <AuthGate />;
  }

  const handleToggleDocs = () => {
    if (activeTab === 'docs') {
      setActiveTab(lastActiveTab || 'ai');
    } else {
      setLastActiveTab(activeTab);
      setActiveTab('docs');
    }
  };

  const handleCloseDocs = () => {
    setActiveTab(lastActiveTab || 'ai');
  };

  return (
    <div className="app-container">
      <Header
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenExport={() => setShowExportModal(true)}
        onOpenDocs={handleToggleDocs}
        isDocsActive={activeTab === 'docs'}
        onOpenAuthModal={() => setShowAuthModal(true)}
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
      />

      <NavigationBar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (tab !== 'exam') setCustomAiExam(null);
          setActiveTab(tab);
          setLastActiveTab(tab);
          setIsMobileMenuOpen(false);
        }}
        mistakesCount={mistakes.length}
        savedCount={Object.keys(savedQuestions).length}
        isMobileMenuOpen={isMobileMenuOpen}
        onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />

      <div className="content-wrapper">
        {activeTab === 'docs' && (
          <DocsModal
            isOpen={true}
            onClose={handleCloseDocs}
            previousTabName={lastActiveTab}
          />
        )}

        {activeTab === 'exam' && (
          <ExamSimulator
            key={customAiExam ? 'custom-ai-exam' : selectedYear}
            questions={activeQuestions}
            savedQuestions={savedQuestions}
            onToggleSave={handleToggleSave}
            onRecordMistakes={handleRecordMistakes}
            onSaveExamHistory={handleSaveExamHistory}
            fontSize={fontSize}
            onSwitchToTutor={() => setActiveTab('tutor')}
            selectedYear={selectedYear}
            onSelectYear={(yr) => {
              setCustomAiExam(null);
              setSelectedYear(yr);
            }}
          />
        )}

        {activeTab === 'tutor' && (
          <TutorMode
            allQuestions={activeQuestions}
            savedQuestions={savedQuestions}
            onToggleSave={handleToggleSave}
            onRecordMistakes={handleRecordMistakes}
            fontSize={fontSize}
            selectedYear={selectedYear}
            onSelectYear={(yr) => {
              setCustomAiExam(null);
              setSelectedYear(yr);
            }}
          />
        )}

        {activeTab === 'ai' && (
          <AiExamGenerator
            onStartCustomExam={handleStartCustomExam}
            onSaveQuestionToBank={handleToggleSave}
            savedQuestions={savedQuestions}
            onToggleSave={handleToggleSave}
            fontSize={fontSize}
          />
        )}

        {activeTab === 'flashcards' && (
          <Flashcards questions={activeQuestions} />
        )}

        {activeTab === 'mistakes' && (
          <MistakeBank
            mistakes={mistakes}
            onClearMistakes={handleClearMistakes}
            onRemoveMistake={handleRemoveMistake}
            savedQuestions={savedQuestions}
            onToggleSave={handleToggleSave}
            fontSize={fontSize}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboard
            examHistory={examHistory}
            mistakesCount={mistakes.length}
            savedCount={Object.keys(savedQuestions).length}
          />
        )}

        {activeTab === 'search' && (
          <QuestionFinder
            allQuestions={QUESTIONS_DATA}
            savedQuestions={savedQuestions}
            onToggleSave={handleToggleSave}
            fontSize={fontSize}
          />
        )}

        {activeTab === 'academies' && (
          <AcademiesRanking />
        )}
      </div>

      {showExportModal && (
        <ExportModal
          allQuestions={QUESTIONS_DATA}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </div>
  );
}

export default App;

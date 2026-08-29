import React from 'react';
import { Timer, BookOpen, Layers, AlertTriangle, BarChart3, Search, Sparkles } from 'lucide-react';

export function NavigationBar({
  activeTab,
  onSelectTab,
  mistakesCount = 0,
  savedCount = 0
}) {
  const tabs = [
    { id: 'exam', label: 'Simulacro Oficial', icon: Timer, count: null },
    { id: 'tutor', label: 'Modo Tutor / Estudio', icon: BookOpen, count: null },
    { id: 'ai', label: 'Generador IA (NVIDIA)', icon: Sparkles, count: 'PRO' },
    { id: 'flashcards', label: 'Flashcards 3D', icon: Layers, count: null },
    { id: 'mistakes', label: 'Banco de Errores', icon: AlertTriangle, count: mistakesCount },
    { id: 'analytics', label: 'Analytics & Desempeño', icon: BarChart3, count: null },
    { id: 'search', label: 'Buscador Global', icon: Search, count: null }
  ];

  return (
    <nav className="nav-bar-container" id="serums-nav-bar">
      <div className="nav-bar-inner">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              className={`nav-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => onSelectTab(tab.id)}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
              {tab.count !== null && tab.count > 0 && (
                <span className="nav-counter-badge">{tab.count}</span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

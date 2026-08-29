import React from 'react';
import { Timer, BookOpen, Layers, AlertTriangle, BarChart3, Search, Sparkles, MoreHorizontal, X, ChevronRight, Bookmark } from 'lucide-react';

export function NavigationBar({
  activeTab,
  onSelectTab,
  mistakesCount = 0,
  savedCount = 0,
  isMobileMenuOpen = false,
  onCloseMobileMenu = () => {},
  onOpenMobileMenu = () => {}
}) {
  const mainTabs = [
    { id: 'exam', label: 'Simulacro', fullLabel: 'Simulacro Oficial', icon: Timer, count: null },
    { id: 'tutor', label: 'Tutor', fullLabel: 'Modo Tutor / Estudio', icon: BookOpen, count: null },
    { id: 'ai', label: 'IA NVIDIA', fullLabel: 'Generador IA (NVIDIA)', icon: Sparkles, count: 'PRO', isHighlight: true },
    { id: 'flashcards', label: 'Flashcards', fullLabel: 'Flashcards 3D', icon: Layers, count: null },
    { id: 'mistakes', label: 'Errores', fullLabel: 'Banco de Errores', icon: AlertTriangle, count: mistakesCount, isDanger: mistakesCount > 0 },
    { id: 'analytics', label: 'Desempeño', fullLabel: 'Analytics & Métricas', icon: BarChart3, count: null },
    { id: 'search', label: 'Buscador', fullLabel: 'Buscador Global (500 Preguntas)', icon: Search, count: null }
  ];

  // Primary mobile dock tabs
  const mobileDockTabs = [
    { id: 'exam', label: 'Simulacro', icon: Timer },
    { id: 'tutor', label: 'Tutor', icon: BookOpen },
    { id: 'ai', label: 'IA PRO', icon: Sparkles, isHighlight: true },
    { id: 'more', label: 'Módulos', icon: MoreHorizontal, count: mistakesCount > 0 ? '•' : null }
  ];

  const handleMobileTabClick = (tabId) => {
    if (tabId === 'more') {
      if (isMobileMenuOpen) {
        onCloseMobileMenu();
      } else {
        onOpenMobileMenu();
      }
    } else {
      onSelectTab(tabId);
      onCloseMobileMenu();
    }
  };

  return (
    <>
      {/* Desktop & Tablet Segmented Navigation Bar */}
      <nav className="desktop-nav-bar" id="serums-desktop-nav-bar">
        <div className="desktop-nav-inner">
          {mainTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`desktop-nav-tab-${tab.id}`}
                className={`desktop-nav-pill ${isActive ? 'active' : ''} ${tab.isHighlight ? 'highlight-pill' : ''}`}
                onClick={() => onSelectTab(tab.id)}
              >
                <Icon size={17} className="pill-icon" />
                <span className="pill-label">{tab.fullLabel}</span>
                {tab.count !== null && (
                  <span className={`pill-badge ${tab.isDanger ? 'danger' : ''}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Floating Bottom Navigation Dock */}
      <nav className="mobile-bottom-dock" id="serums-mobile-dock">
        {mobileDockTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === 'more' ? isMobileMenuOpen : activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`mobile-dock-${tab.id}`}
              className={`dock-btn ${isActive ? 'active' : ''} ${tab.isHighlight ? 'highlight-dock' : ''}`}
              onClick={() => handleMobileTabClick(tab.id)}
            >
              <div className="dock-icon-wrapper">
                <Icon size={20} />
                {tab.count && <span className="dock-dot-indicator" />}
              </div>
              <span className="dock-label">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Mobile Fullscreen Drawer / Menu Modal */}
      {isMobileMenuOpen && (
        <div className="mobile-drawer-overlay" onClick={onCloseMobileMenu}>
          <div className="mobile-drawer-content" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div className="drawer-title-group">
                <h3>Módulos de Entrenamiento</h3>
                <p>Examen Nacional SERUMS 2026</p>
              </div>
              <button className="drawer-close-btn" onClick={onCloseMobileMenu} aria-label="Cerrar">
                <X size={20} />
              </button>
            </div>

            <div className="drawer-items-list">
              {mainTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    className={`drawer-menu-item ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      onSelectTab(tab.id);
                      onCloseMobileMenu();
                    }}
                  >
                    <div className="item-icon-box">
                      <Icon size={18} />
                    </div>
                    <div className="item-text-box">
                      <span className="item-title">{tab.fullLabel}</span>
                    </div>
                    {tab.count !== null && (
                      <span className={`drawer-badge ${tab.isDanger ? 'danger' : ''}`}>
                        {tab.count}
                      </span>
                    )}
                    <ChevronRight size={16} className="item-arrow" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

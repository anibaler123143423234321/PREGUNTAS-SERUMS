import React from 'react';
import { Timer, BookOpen, Layers, AlertTriangle, BarChart3, Search, Sparkles, X, ChevronRight } from 'lucide-react';

export function NavigationBar({
  activeTab,
  onSelectTab,
  mistakesCount = 0,
  savedCount = 0,
  isMobileMenuOpen = false,
  onCloseMobileMenu = () => {}
}) {
  const mainTabs = [
    { id: 'exam', label: 'Simulacro', fullLabel: 'Simulacro Oficial', icon: Timer, count: null },
    { id: 'tutor', label: 'Tutor', fullLabel: 'Modo Tutor / Estudio', icon: BookOpen, count: null },
    { id: 'ai', label: 'IA NVIDIA', fullLabel: 'Generador IA (NVIDIA)', icon: Sparkles, count: 'PRO', isHighlight: true },
    { id: 'flashcards', label: 'Flashcards', fullLabel: 'Flashcards 3D', icon: Layers, count: null },
    { id: 'mistakes', label: 'Errores', fullLabel: 'Banco de Errores', icon: AlertTriangle, count: mistakesCount, isDanger: mistakesCount > 0 },
    { id: 'analytics', label: 'Desempeño', fullLabel: 'Analytics & Desempeño', icon: BarChart3, count: null },
    { id: 'search', label: 'Buscador', fullLabel: 'Buscador Global (500)', icon: Search, count: null }
  ];

  return (
    <>
      {/* Top Segmented Navigation Bar (Responsive on all screens) */}
      <nav className="main-nav-bar" id="serums-main-nav-bar">
        <div className="main-nav-inner">
          {mainTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                className={`nav-pill-btn ${isActive ? 'active' : ''} ${tab.isHighlight ? 'highlight-pill' : ''}`}
                onClick={() => {
                  onSelectTab(tab.id);
                  onCloseMobileMenu();
                }}
              >
                <Icon size={16} className="pill-icon" />
                <span className="pill-label-desktop">{tab.fullLabel}</span>
                <span className="pill-label-mobile">{tab.label}</span>
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

      {/* Mobile Drawer / Full Screen Menu Modal */}
      {isMobileMenuOpen && (
        <div className="mobile-drawer-overlay" onClick={onCloseMobileMenu}>
          <div className="mobile-drawer-content" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div className="drawer-title-group">
                <h3>Módulos de Entrenamiento</h3>
                <p>Examen Nacional SERUMS 2026</p>
              </div>
              <button className="drawer-close-btn" onClick={onCloseMobileMenu} aria-label="Cerrar menú">
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

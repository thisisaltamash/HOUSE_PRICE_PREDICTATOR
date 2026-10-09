import React from 'react'
import type { HealthState } from '../types/prediction'
import { HealthIndicator } from './HealthIndicator'
import { Home, Calculator, FileSpreadsheet } from 'lucide-react'

interface HeaderProps {
  activeTab: 'single' | 'batch'
  onSelectTab: (tab: 'single' | 'batch') => void
  health: HealthState
  onRefreshHealth: () => void
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  health,
  onRefreshHealth,
}) => {
  return (
    <header className="app-header">
      <div className="header-container">
        {/* Brand Identity */}
        <div className="header-brand">
          <div className="brand-logo-icon">
            <Home size={20} className="text-emerald" />
          </div>
          <div className="brand-titles">
            <span className="brand-name">California House Price Predictor</span>
            <span className="brand-tag">Census ML Valuation Engine</span>
          </div>
        </div>

        {/* Workflow Navigation Tabs */}
        <nav className="header-nav" aria-label="Main Navigation">
          <div className="tab-pill-group" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'single'}
              aria-controls="single-panel"
              id="tab-single"
              className={`nav-tab-btn ${activeTab === 'single' ? 'active' : ''}`}
              onClick={() => onSelectTab('single')}
            >
              <Calculator size={15} />
              <span>Single Estimate</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'batch'}
              aria-controls="batch-panel"
              id="tab-batch"
              className={`nav-tab-btn ${activeTab === 'batch' ? 'active' : ''}`}
              onClick={() => onSelectTab('batch')}
            >
              <FileSpreadsheet size={15} />
              <span>CSV Batch</span>
            </button>
          </div>
        </nav>

        {/* Right Utility: Service Health Indicator */}
        <div className="header-actions">
          <HealthIndicator health={health} onRefresh={onRefreshHealth} />
        </div>
      </div>
    </header>
  )
}

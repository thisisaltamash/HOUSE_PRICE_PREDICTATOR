import React from 'react'
import { ThreeHouseScene } from './ThreeHouseScene'
import { Sparkles, ArrowRight, FileSpreadsheet, CheckCircle2, ShieldCheck, Cpu } from 'lucide-react'

interface HeroSectionProps {
  onSelectTab: (tab: 'single' | 'batch') => void
  activeTab: 'single' | 'batch'
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onSelectTab, activeTab }) => {
  return (
    <section className="hero-section" aria-label="Hero Section">
      {/* Ambient background glow accents */}
      <div className="hero-glow hero-glow-emerald" aria-hidden="true" />
      <div className="hero-glow hero-glow-sapphire" aria-hidden="true" />

      <div className="hero-container">
        {/* Left Column: Headline, Description & CTAs */}
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-pulse" />
            <Sparkles size={14} className="text-emerald" />
            <span>AI Valuation Engine • Random Forest Model</span>
          </div>

          <h1 className="hero-title">
            California House Price <span className="gradient-text">Predictor</span>
          </h1>

          <p className="hero-subtitle">
            Instant valuation engine trained on 20,640 California census block groups.
            Evaluate block-level demographics, geographic coordinates, and housing metrics with
            high-fidelity machine learning.
          </p>

          {/* Key metrics / trust indicators */}
          <div className="hero-features-list">
            <div className="hero-feature-item">
              <CheckCircle2 size={16} className="text-emerald" />
              <span>8 Geospatial Features</span>
            </div>
            <div className="hero-feature-item">
              <ShieldCheck size={16} className="text-cyan" />
              <span>$39k Model Error Bound</span>
            </div>
            <div className="hero-feature-item">
              <Cpu size={16} className="text-emerald" />
              <span>Real FastAPI Inference</span>
            </div>
          </div>

          {/* Call to action buttons */}
          <div className="hero-cta-group">
            <button
              type="button"
              className={`cta-btn primary-cta ${activeTab === 'single' ? 'active' : ''}`}
              onClick={() => {
                onSelectTab('single')
                const el = document.getElementById('workspace-panel')
                el?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              <span>Single Estimate</span>
              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              className={`cta-btn secondary-cta ${activeTab === 'batch' ? 'active' : ''}`}
              onClick={() => {
                onSelectTab('batch')
                const el = document.getElementById('workspace-panel')
                el?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              <FileSpreadsheet size={16} />
              <span>CSV Batch Upload</span>
            </button>
          </div>
        </div>

        {/* Right Column: 3D Interactive WebGL Villa */}
        <div className="hero-graphics-column">
          <div className="hero-3d-card">
            <div className="hero-3d-header">
              <div className="window-dots">
                <span className="dot red" />
                <span className="dot yellow" />
                <span className="dot green" />
              </div>
              <div className="hero-3d-title">
                <span>California Architectural Mesh • Live 3D</span>
              </div>
            </div>

            <ThreeHouseScene />
          </div>
        </div>
      </div>
    </section>
  )
}

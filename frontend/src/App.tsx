import React, { useEffect, useState, useCallback } from 'react'
import { Header } from './components/Header'
import { HeroSection } from './components/HeroSection'
import { SingleEstimateForm } from './components/SingleEstimateForm'
import { BatchCsvWorkflow } from './components/BatchCsvWorkflow'
import { Footer } from './components/Footer'
import type { HealthState } from './types/prediction'
import { api } from './services/api'
import { Calculator, FileSpreadsheet, AlertCircle } from 'lucide-react'

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'single' | 'batch'>('single')
  const [health, setHealth] = useState<HealthState>({
    status: 'checking',
  })

  const checkHealth = useCallback(async () => {
    setHealth((prev) => ({ ...prev, status: 'checking', error: undefined }))
    try {
      const data = await api.getHealth()
      setHealth({
        status: 'available',
        data,
        lastChecked: new Date(),
      })
    } catch (err) {
      setHealth({
        status: 'unavailable',
        error: err instanceof Error ? err.message : 'Backend unreachable',
        lastChecked: new Date(),
      })
    }
  }, [])

  useEffect(() => {
    checkHealth()
    // Periodic gentle health check every 45s
    const interval = setInterval(checkHealth, 45000)
    return () => clearInterval(interval)
  }, [checkHealth])

  return (
    <div className="app-root">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        health={health}
        onRefreshHealth={checkHealth}
      />

      <main className="main-content">
        {/* Sexy Hero Section with 3D Architectural Villa Canvas */}
        <HeroSection onSelectTab={setActiveTab} activeTab={activeTab} />

        {/* Workspace Section Container */}
        <div className="workspace-wrapper" id="workspace-panel">
          <div className="workspace-container">
            {/* Tab Navigation Pill Bar */}
            <div className="workspace-tabs-bar" role="tablist" aria-label="Prediction Workflows">
              <button
                type="button"
                role="tab"
                id="main-tab-single"
                aria-selected={activeTab === 'single'}
                aria-controls="single-panel"
                className={`workspace-tab ${activeTab === 'single' ? 'active' : ''}`}
                onClick={() => setActiveTab('single')}
              >
                <Calculator size={18} />
                <span>Single Block Estimate</span>
                <span className="tab-badge">Instant</span>
              </button>

              <button
                type="button"
                role="tab"
                id="main-tab-batch"
                aria-selected={activeTab === 'batch'}
                aria-controls="batch-panel"
                className={`workspace-tab ${activeTab === 'batch' ? 'active' : ''}`}
                onClick={() => setActiveTab('batch')}
              >
                <FileSpreadsheet size={18} />
                <span>Batch CSV Valuation</span>
                <span className="tab-badge">Bulk File</span>
              </button>
            </div>

            {/* Offline notification banner if backend is down (non-blocking per PRD) */}
            {health.status === 'unavailable' && (
              <div className="offline-notice-banner" role="status">
                <AlertCircle size={18} className="text-amber flex-shrink-0" />
                <div className="offline-notice-text">
                  <strong>Backend Connection Warning:</strong> Could not connect to FastAPI at{' '}
                  <code>{api.getBaseUrl()}</code>. You can still inspect and prepare values, but
                  predictions will require running the backend (e.g.{' '}
                  <code>uvicorn main:app --reload</code>).
                </div>
              </div>
            )}

            {/* Active Workflow Component */}
            <div className="workspace-content-card">
              {activeTab === 'single' ? <SingleEstimateForm /> : <BatchCsvWorkflow />}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default App

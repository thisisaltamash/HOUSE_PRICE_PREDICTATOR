import React from 'react'
import type { HealthState } from '../types/prediction'
import { CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react'

interface HealthIndicatorProps {
  health: HealthState
  onRefresh: () => void
}

export const HealthIndicator: React.FC<HealthIndicatorProps> = ({ health, onRefresh }) => {
  const { status, data, error } = health

  let badgeClass = 'status-checking'
  let label = 'Checking API...'
  let icon = <RefreshCw size={13} className="spin-icon" />

  if (status === 'available') {
    badgeClass = 'status-available'
    label = 'API Online'
    icon = <CheckCircle2 size={13} />
  } else if (status === 'unavailable') {
    badgeClass = 'status-unavailable'
    label = 'API Offline'
    icon = <AlertTriangle size={13} />
  }

  return (
    <div className="health-indicator-container">
      <div
        className={`health-badge ${badgeClass}`}
        role="status"
        aria-live="polite"
        title={
          status === 'available'
            ? `Backend: ${data?.model || 'RandomForest'} | Avg Error: ${data?.average_error || '39,000 USD'}`
            : error || 'Checking connection to FastAPI backend'
        }
      >
        <span className="status-dot" />
        {icon}
        <span className="status-label">{label}</span>
      </div>

      <button
        type="button"
        className="health-refresh-btn"
        onClick={onRefresh}
        title="Check backend health again"
        aria-label="Refresh API health status"
      >
        <RefreshCw size={12} className={status === 'checking' ? 'spin-icon' : ''} />
      </button>
    </div>
  )
}

import React, { useState } from 'react'
import type { PredictionResponse, HouseFeatures } from '../types/prediction'
import { Check, Copy, Info, Sparkles, TrendingUp, Compass, DollarSign, X } from 'lucide-react'

interface PredictionResultCardProps {
  prediction: PredictionResponse
  submittedValues: HouseFeatures
  onClear: () => void
}

export const PredictionResultCard: React.FC<PredictionResultCardProps> = ({
  prediction,
  submittedValues,
  onClear,
}) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        `Predicted Median House Price: ${prediction.predicted_price}${
          prediction.fidence_range ? ` (Approx Error Range: ${prediction.fidence_range})` : ''
        }`
      )
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  return (
    <div className="result-card-container" role="region" aria-label="Prediction Results">
      <div className="result-card-glow" aria-hidden="true" />

      <div className="result-card-inner">
        {/* Header Bar */}
        <div className="result-card-top">
          <div className="result-badge">
            <Sparkles size={14} className="text-emerald" />
            <span>Valuation Output</span>
          </div>

          <div className="result-actions" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              type="button"
              className="result-copy-btn"
              onClick={handleCopy}
              title="Copy valuation to clipboard"
              aria-label="Copy valuation to clipboard"
            >
              {copied ? (
                <>
                  <Check size={14} className="text-emerald" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copy</span>
                </>
              )}
            </button>

            <button
              type="button"
              className="result-copy-btn"
              onClick={onClear}
              title="Dismiss result card"
              aria-label="Dismiss result card"
            >
              <X size={14} />
              <span>Dismiss</span>
            </button>
          </div>
        </div>

        {/* Primary Valuation Display */}
        <div className="result-main-value">
          <span className="result-label">Estimated Median Block Group Price</span>
          <div className="result-price-row">
            <span className="result-price-highlight">{prediction.predicted_price}</span>
            {prediction.predicted_price_short && (
              <span className="result-price-short">({prediction.predicted_price_short})</span>
            )}
          </div>
        </div>

        {/* Approximate Model Error Range (labeled honestly per PRD F2) */}
        {prediction.fidence_range && (
          <div className="result-error-range-box">
            <div className="range-box-header">
              <TrendingUp size={15} className="text-cyan" />
              <span className="range-box-title">Approximate Model Error Range</span>
            </div>
            <div className="range-box-value">{prediction.fidence_range}</div>
            <p className="range-box-note">
              Based on the Random Forest regressor baseline error (±$39,000 USD). This is an
              approximate model dispersion range and not a guaranteed financial appraisal.
            </p>
          </div>
        )}

        {/* Breakdown of features evaluated */}
        <div className="result-features-summary">
          <h4 className="summary-title">Evaluated Census Features:</h4>
          <div className="summary-grid">
            <div className="summary-pill">
              <DollarSign size={13} className="text-emerald" />
              <span>Income: {submittedValues.MedInc} ($10k)</span>
            </div>
            <div className="summary-pill">
              <Compass size={13} className="text-cyan" />
              <span>Location: {submittedValues.Latitude.toFixed(2)}°N, {submittedValues.Longitude.toFixed(2)}°W</span>
            </div>
            <div className="summary-pill">
              <span>Age: {submittedValues.HouseAge} yrs</span>
            </div>
            <div className="summary-pill">
              <span>Rooms: {submittedValues.AveRooms} avg</span>
            </div>
          </div>
        </div>

        {/* Honest Model Disclaimer */}
        <div className="result-disclaimer">
          <Info size={14} className="disclaimer-icon" />
          <p>
            Notice: This estimate reflects the median value of homes in the specified California
            census block group, not an appraisal of a single specific address. Model predictions are
            subject to an average error of approximately $39,000 USD.
          </p>
        </div>
      </div>
    </div>
  )
}

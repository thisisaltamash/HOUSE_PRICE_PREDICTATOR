import React, { useState } from 'react'
import type {
  HouseFeatures,
  HouseFeatureKey,
  PredictionResponse,
  FormErrors,
  PresetLocation,
} from '../types/prediction'
import {
  FEATURE_METADATA,
  PRESET_LOCATIONS,
  REQUIRED_FEATURE_KEYS,
} from '../constants/presets'
import { validateAllFields, validateField } from '../utils/validation'
import { api, ApiError } from '../services/api'
import { PredictionResultCard } from './PredictionResultCard'
import confetti from 'canvas-confetti'
import {
  Calculator,
  RotateCcw,
  AlertTriangle,
  MapPin,
  Loader2,
  Info,
} from 'lucide-react'

const INITIAL_FORM_STATE: Record<HouseFeatureKey, string> = {
  MedInc: '8.32',
  HouseAge: '41',
  AveRooms: '6.98',
  AveBedrms: '1.02',
  Population: '322',
  AveOccup: '2.55',
  Latitude: '37.88',
  Longitude: '-122.23',
}

export const SingleEstimateForm: React.FC = () => {
  const [formValues, setFormValues] = useState<Record<HouseFeatureKey, string>>(INITIAL_FORM_STATE)
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Partial<Record<HouseFeatureKey, boolean>>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null)
  const [lastSubmittedValues, setLastSubmittedValues] = useState<HouseFeatures | null>(null)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [activePresetId, setActivePresetId] = useState<string>('sf-bay')

  // Check if form has modified values compared to initial state
  const isFormDirty = Object.keys(formValues).some(
    (key) => formValues[key as HouseFeatureKey] !== INITIAL_FORM_STATE[key as HouseFeatureKey]
  )

  const handleInputChange = (field: HouseFeatureKey, rawValue: string) => {
    setFormValues((prev) => ({ ...prev, [field]: rawValue }))
    setActivePresetId('') // Clear preset active indicator when manually modified

    if (touched[field]) {
      const fieldError = validateField(field, rawValue)
      setErrors((prev) => ({
        ...prev,
        [field]: fieldError || undefined,
      }))
    }
  }

  const handleBlur = (field: HouseFeatureKey) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    const fieldError = validateField(field, formValues[field])
    setErrors((prev) => ({
      ...prev,
      [field]: fieldError || undefined,
    }))
  }

  const applyPreset = (preset: PresetLocation) => {
    const updatedValues: Record<HouseFeatureKey, string> = {
      MedInc: String(preset.features.MedInc),
      HouseAge: String(preset.features.HouseAge),
      AveRooms: String(preset.features.AveRooms),
      AveBedrms: String(preset.features.AveBedrms),
      Population: String(preset.features.Population),
      AveOccup: String(preset.features.AveOccup),
      Latitude: String(preset.features.Latitude),
      Longitude: String(preset.features.Longitude),
    }

    setFormValues(updatedValues)
    setActivePresetId(preset.id)
    setErrors({})
    setTouched({})
    setApiError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError(null)

    // Touch all fields for error display
    const allTouched: Partial<Record<HouseFeatureKey, boolean>> = {}
    REQUIRED_FEATURE_KEYS.forEach((key) => {
      allTouched[key] = true
    })
    setTouched(allTouched)

    // Validate all fields
    const validation = validateAllFields(formValues)
    if (!validation.isValid) {
      setErrors(validation.errors)
      // Focus the first invalid field for accessibility
      if (validation.firstErrorKey) {
        const el = document.getElementById(`field-${validation.firstErrorKey}`)
        el?.focus()
      }
      return
    }

    // Prepare payload
    const payload: HouseFeatures = {
      MedInc: Number(formValues.MedInc),
      HouseAge: Number(formValues.HouseAge),
      AveRooms: Number(formValues.AveRooms),
      AveBedrms: Number(formValues.AveBedrms),
      Population: Number(formValues.Population),
      AveOccup: Number(formValues.AveOccup),
      Latitude: Number(formValues.Latitude),
      Longitude: Number(formValues.Longitude),
    }

    setIsLoading(true)

    try {
      const res = await api.predictSingle(payload)
      setPrediction(res)
      setLastSubmittedValues(payload)

      // Micro-animation confetti celebration
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#10b981', '#38bdf8', '#fbbf24'],
        })
      } catch {
        // Confetti fallback
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setApiError(err.message)
      } else {
        setApiError(
          err instanceof Error
            ? err.message
            : 'An unexpected error occurred during prediction.'
        )
      }
      // Note: Form values are preserved on API error per PRD F2!
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetClick = () => {
    if (isFormDirty) {
      setShowResetConfirm(true)
    } else {
      performReset()
    }
  }

  const performReset = () => {
    setFormValues(INITIAL_FORM_STATE)
    setErrors({})
    setTouched({})
    setApiError(null)
    setPrediction(null)
    setLastSubmittedValues(null)
    setShowResetConfirm(false)
    setActivePresetId('sf-bay')
  }

  const errorCount = Object.keys(errors).filter((k) => errors[k as HouseFeatureKey]).length

  return (
    <div className="single-estimate-wrapper" id="single-panel" role="tabpanel" aria-labelledby="tab-single">
      {/* Informative Guidance Banner */}
      <div className="census-helper-banner">
        <Info size={16} className="text-cyan flex-shrink-0" />
        <p>
          <strong>Census Block Group Model:</strong> Inputs represent aggregated statistics for a
          California census block group (~600–3,000 residents), not a specific address or home appraisal.
        </p>
      </div>

      {/* Preset Quick Selectors */}
      <div className="presets-container">
        <div className="presets-header">
          <MapPin size={15} className="text-emerald" />
          <span className="presets-title">Quick Preset Census Locations:</span>
        </div>
        <div className="preset-buttons-grid">
          {PRESET_LOCATIONS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className={`preset-btn ${activePresetId === preset.id ? 'active' : ''}`}
              onClick={() => applyPreset(preset)}
              title={preset.description}
            >
              <span className="preset-name">{preset.name}</span>
              <span className="preset-region">{preset.region}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Accessible Error Summary (if any) */}
      {errorCount > 0 && (
        <div className="error-summary-alert" role="alert">
          <AlertTriangle size={18} className="text-rose flex-shrink-0" />
          <div>
            <h4 className="error-summary-heading">Please correct {errorCount} input error{errorCount > 1 ? 's' : ''}:</h4>
            <ul className="error-summary-list">
              {Object.entries(errors).map(([key, msg]) =>
                msg ? (
                  <li key={key}>
                    <a href={`#field-${key}`} onClick={(e) => {
                      e.preventDefault()
                      document.getElementById(`field-${key}`)?.focus()
                    }}>
                      <strong>{FEATURE_METADATA[key as HouseFeatureKey]?.label}:</strong> {msg}
                    </a>
                  </li>
                ) : null
              )}
            </ul>
          </div>
        </div>
      )}

      {/* API Level Error (Preserving form values) */}
      {apiError && (
        <div className="api-error-alert" role="alert">
          <AlertTriangle size={18} className="text-rose flex-shrink-0" />
          <div className="api-error-content">
            <strong>Prediction Request Failed:</strong>
            <p>{apiError}</p>
          </div>
        </div>
      )}

      {/* Main Single Estimate Form */}
      <form onSubmit={handleSubmit} className="estimate-form" noValidate>
        {/* Geographic Coordinates Section */}
        <fieldset className="form-group-card">
          <legend className="group-legend">
            <span className="group-legend-icon">📍</span>
            <span>Geographic Coordinates (California Boundaries)</span>
          </legend>
          <div className="inputs-grid-2">
            {(['Latitude', 'Longitude'] as HouseFeatureKey[]).map((field) => {
              const meta = FEATURE_METADATA[field]
              const hasError = touched[field] && !!errors[field]
              return (
                <div key={field} className={`form-field ${hasError ? 'has-error' : ''}`}>
                  <label htmlFor={`field-${field}`} className="field-label">
                    <span>{meta.label}</span>
                    <span className="field-unit">({meta.unit})</span>
                  </label>
                  <div className="input-wrapper">
                    <input
                      id={`field-${field}`}
                      name={field}
                      type="number"
                      step={meta.step}
                      min={meta.min}
                      max={meta.max}
                      value={formValues[field]}
                      onChange={(e) => handleInputChange(field, e.target.value)}
                      onBlur={() => handleBlur(field)}
                      placeholder={meta.placeholder}
                      className={`field-input ${hasError ? 'input-error' : ''}`}
                      aria-invalid={hasError}
                      aria-describedby={hasError ? `error-${field}` : `hint-${field}`}
                      required
                    />
                  </div>
                  {hasError ? (
                    <span id={`error-${field}`} className="field-error-msg" role="alert">
                      {errors[field]}
                    </span>
                  ) : (
                    <span id={`hint-${field}`} className="field-hint">
                      {meta.hint}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </fieldset>

        {/* Economic & Housing Attributes Section */}
        <fieldset className="form-group-card">
          <legend className="group-legend">
            <span className="group-legend-icon">📊</span>
            <span>Economic & Household Attributes</span>
          </legend>
          <div className="inputs-grid-3">
            {(['MedInc', 'HouseAge', 'AveRooms', 'AveBedrms', 'Population', 'AveOccup'] as HouseFeatureKey[]).map(
              (field) => {
                const meta = FEATURE_METADATA[field]
                const hasError = touched[field] && !!errors[field]
                return (
                  <div key={field} className={`form-field ${hasError ? 'has-error' : ''}`}>
                    <label htmlFor={`field-${field}`} className="field-label">
                      <span>{meta.label}</span>
                      <span className="field-unit">({meta.unit})</span>
                    </label>
                    <div className="input-wrapper">
                      <input
                        id={`field-${field}`}
                        name={field}
                        type="number"
                        step={meta.step}
                        min={meta.min}
                        max={meta.max}
                        value={formValues[field]}
                        onChange={(e) => handleInputChange(field, e.target.value)}
                        onBlur={() => handleBlur(field)}
                        placeholder={meta.placeholder}
                        className={`field-input ${hasError ? 'input-error' : ''}`}
                        aria-invalid={hasError}
                        aria-describedby={hasError ? `error-${field}` : `hint-${field}`}
                        required
                      />
                    </div>
                    {hasError ? (
                      <span id={`error-${field}`} className="field-error-msg" role="alert">
                        {errors[field]}
                      </span>
                    ) : (
                      <span id={`hint-${field}`} className="field-hint">
                        {meta.hint}
                      </span>
                    )}
                  </div>
                )
              }
            )}
          </div>
        </fieldset>

        {/* Action Buttons Row */}
        <div className="form-actions-bar">
          <button
            type="submit"
            disabled={isLoading}
            className="submit-btn"
            id="btn-submit-prediction"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="spin-icon" />
                <span>Computing Valuation...</span>
              </>
            ) : (
              <>
                <Calculator size={18} />
                <span>Predict Median Price</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleResetClick}
            disabled={isLoading}
            className="reset-btn"
            title="Reset form to default values"
          >
            <RotateCcw size={15} />
            <span>Reset Form</span>
          </button>
        </div>
      </form>

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="reset-dialog-title">
          <div className="modal-box">
            <h3 id="reset-dialog-title" className="modal-title">Discard Custom Values?</h3>
            <p className="modal-text">
              You have modified the form parameters. Resetting will restore default sample parameters.
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="modal-btn-cancel"
                onClick={() => setShowResetConfirm(false)}
              >
                Keep Current Values
              </button>
              <button
                type="button"
                className="modal-btn-confirm"
                onClick={performReset}
              >
                Yes, Reset Form
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prediction Output Display */}
      {prediction && lastSubmittedValues && (
        <div className="result-anchor-wrapper" id="prediction-result-anchor">
          <PredictionResultCard
            prediction={prediction}
            submittedValues={lastSubmittedValues}
            onClear={() => setPrediction(null)}
          />
        </div>
      )}
    </div>
  )
}

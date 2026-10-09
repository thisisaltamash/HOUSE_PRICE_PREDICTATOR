import React, { useRef, useState } from 'react'
import {
  downloadCsvTemplate,
  downloadBlob,
  preflightValidateCsv,
  CSV_HEADERS,
} from '../utils/csv'
import type { CsvValidationResult } from '../utils/csv'
import { api, ApiError } from '../services/api'
import confetti from 'canvas-confetti'
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  X,
  FileCheck,
  Table,
  Loader2,
  Info,
} from 'lucide-react'

export const BatchCsvWorkflow: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [validationResult, setValidationResult] = useState<CsvValidationResult | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState<{
    filename: string
    rowCount?: number
  } | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [previewRows, setPreviewRows] = useState<Record<string, string>[]>([])

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileProcess = async (file: File) => {
    setSelectedFile(file)
    setUploadError(null)
    setUploadSuccess(null)
    setPreviewRows([])
    setIsValidating(true)

    try {
      const res = await preflightValidateCsv(file)
      setValidationResult(res)
      if (res.sampleRows && res.sampleRows.length > 0) {
        setPreviewRows(res.sampleRows)
      }
    } catch (err) {
      setValidationResult({
        valid: false,
        error: `Error checking CSV: ${err instanceof Error ? err.message : 'Unknown'}`,
      })
    } finally {
      setIsValidating(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileProcess(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileProcess(file)
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setValidationResult(null)
    setUploadError(null)
    setUploadSuccess(null)
    setPreviewRows([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleUploadAndPredict = async () => {
    if (!selectedFile || !validationResult?.valid) return

    setIsUploading(true)
    setUploadError(null)
    setUploadSuccess(null)

    try {
      const { blob, filename } = await api.predictFile(selectedFile)

      // Parse the resulting CSV text to show preview of enriched predictions
      const text = await blob.text()
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0)
      if (lines.length > 1) {
        const headers = lines[0].split(',').map((h) => h.trim())
        const parsed: Record<string, string>[] = []
        for (const line of lines.slice(1, 11)) {
          const vals = line.split(',').map((v) => v.trim())
          const rowObj: Record<string, string> = {}
          headers.forEach((h, i) => {
            rowObj[h] = vals[i] || ''
          })
          parsed.push(rowObj)
        }
        setPreviewRows(parsed)
      }

      // Automatically trigger browser download of the enriched CSV
      downloadBlob(blob, filename)

      setUploadSuccess({
        filename,
        rowCount: Math.max(0, lines.length - 1),
      })

      // Celebration
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#06b6d4', '#6366f1'],
        })
      } catch {
        // fallback
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setUploadError(err.message)
      } else {
        setUploadError(
          err instanceof Error
            ? err.message
            : 'An unexpected error occurred during batch prediction.'
        )
      }
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="batch-workflow-wrapper" id="batch-panel" role="tabpanel" aria-labelledby="tab-batch">
      {/* Overview & Template Download Bar */}
      <div className="batch-header-card">
        <div className="batch-header-info">
          <div className="batch-header-badge">
            <FileSpreadsheet size={15} className="text-emerald" />
            <span>High-Throughput Batch Inference</span>
          </div>
          <h2 className="batch-header-title">Batch CSV Prediction Workflow</h2>
          <p className="batch-header-desc">
            Upload a CSV containing California census blocks to generate batch valuations. The
            FastAPI engine evaluates all rows and attaches a <code>predicted_price_USD</code> column.
          </p>
        </div>

        {/* Template Downloads */}
        <div className="template-download-box">
          <span className="template-box-label">CSV Templates:</span>
          <div className="template-btn-group">
            <button
              type="button"
              className="template-btn secondary"
              onClick={() => downloadCsvTemplate(true)}
              title="Download CSV template containing 3 valid California sample rows"
            >
              <Download size={14} />
              <span>Template (With Samples)</span>
            </button>
            <button
              type="button"
              className="template-btn outline"
              onClick={() => downloadCsvTemplate(false)}
              title="Download clean blank CSV template with required 8 headers"
            >
              <Download size={14} />
              <span>Blank Template</span>
            </button>
          </div>
        </div>
      </div>

      {/* Required Columns Reference */}
      <div className="columns-spec-card">
        <div className="spec-card-title">
          <Info size={14} className="text-cyan" />
          <span>Exact Required Headers (Case-Sensitive, 8 Columns):</span>
        </div>
        <div className="spec-headers-chips">
          {CSV_HEADERS.map((col) => (
            <code key={col} className="spec-header-chip">
              {col}
            </code>
          ))}
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        className={`dropzone-card ${isDragOver ? 'drag-over' : ''} ${
          selectedFile ? 'has-file' : ''
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => {
          if (!selectedFile) fileInputRef.current?.click()
        }}
        role="button"
        tabIndex={0}
        aria-label="Upload CSV file by clicking or dragging and dropping"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            fileInputRef.current?.click()
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          className="hidden-file-input"
          onChange={handleFileChange}
          aria-hidden="true"
        />

        {!selectedFile ? (
          <div className="dropzone-idle">
            <div className="dropzone-icon-circle">
              <UploadCloud size={32} className="text-emerald" />
            </div>
            <h3 className="dropzone-prompt">Choose or drag & drop your CSV file here</h3>
            <p className="dropzone-sub">
              Accepts <code>.csv</code> files up to 10 MB with the 8 required census columns.
            </p>
            <button
              type="button"
              className="browse-btn"
              onClick={(e) => {
                e.stopPropagation()
                fileInputRef.current?.click()
              }}
            >
              Browse Files
            </button>
          </div>
        ) : (
          <div className="dropzone-file-selected" onClick={(e) => e.stopPropagation()}>
            <div className="file-info-row">
              <div className="file-icon-badge">
                <FileCheck size={24} className="text-emerald" />
              </div>
              <div className="file-meta">
                <div className="file-name-row">
                  <span className="file-name">{selectedFile.name}</span>
                  <span className="file-size">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </span>
                </div>
                {isValidating ? (
                  <span className="validation-checking">
                    <Loader2 size={12} className="spin-icon" /> Validating CSV structure...
                  </span>
                ) : validationResult?.valid ? (
                  <span className="validation-success">
                    <CheckCircle2 size={14} className="text-emerald" />
                    Header check passed ({validationResult.rowCount ?? 0} estimated rows)
                  </span>
                ) : (
                  <span className="validation-fail">
                    <AlertTriangle size={14} className="text-rose" />
                    Validation issue detected
                  </span>
                )}
              </div>
              <button
                type="button"
                className="remove-file-btn"
                onClick={handleRemoveFile}
                title="Remove selected file"
                aria-label="Remove selected file"
              >
                <X size={16} />
              </button>
            </div>

            {/* Validation Error Banner (if preflight fails) */}
            {validationResult && !validationResult.valid && (
              <div className="preflight-error-banner" role="alert">
                <AlertTriangle size={16} className="text-rose flex-shrink-0" />
                <div>
                  <strong>CSV Preflight Error:</strong>
                  <p>{validationResult.error}</p>
                  {validationResult.missingColumns && validationResult.missingColumns.length > 0 && (
                    <p className="missing-cols-note">
                      Missing columns: {validationResult.missingColumns.join(', ')}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Upload Action Button */}
            <div className="file-upload-actions">
              <button
                type="button"
                disabled={!validationResult?.valid || isUploading || isValidating}
                className="upload-submit-btn"
                onClick={handleUploadAndPredict}
              >
                {isUploading ? (
                  <>
                    <Loader2 size={16} className="spin-icon" />
                    <span>Processing Batch Predictions...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud size={16} />
                    <span>Upload & Predict Batch</span>
                  </>
                )}
              </button>

              <button
                type="button"
                className="reselect-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                Change File
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Backend API Error Banner */}
      {uploadError && (
        <div className="batch-error-alert" role="alert">
          <AlertTriangle size={18} className="text-rose flex-shrink-0" />
          <div className="batch-error-content">
            <strong>Batch Upload Failed:</strong>
            <p>{uploadError}</p>
          </div>
        </div>
      )}

      {/* Success Notification Bar */}
      {uploadSuccess && (
        <div className="batch-success-banner" role="status">
          <CheckCircle2 size={20} className="text-emerald flex-shrink-0" />
          <div className="success-content">
            <h4 className="success-title">Batch Predictions Generated & Downloaded!</h4>
            <p className="success-desc">
              Successfully processed {uploadSuccess.rowCount} rows. Your enriched file{' '}
              <strong>{uploadSuccess.filename}</strong> has been downloaded.
            </p>
          </div>
        </div>
      )}

      {/* Table Preview of CSV / Predictions */}
      {previewRows.length > 0 && (
        <div className="preview-table-card">
          <div className="preview-table-header">
            <Table size={16} className="text-emerald" />
            <span className="preview-title">
              {uploadSuccess ? 'Enriched Predictions Preview (First 10 Rows)' : 'Uploaded CSV Preview (First Rows)'}
            </span>
          </div>
          <div className="table-responsive-container">
            <table className="preview-table">
              <thead>
                <tr>
                  {Object.keys(previewRows[0]).map((h) => (
                    <th key={h} className={h === 'predicted_price_USD' ? 'highlight-header' : ''}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, idx) => (
                  <tr key={idx}>
                    {Object.entries(row).map(([k, val]) => (
                      <td key={k} className={k === 'predicted_price_USD' ? 'highlight-cell' : ''}>
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

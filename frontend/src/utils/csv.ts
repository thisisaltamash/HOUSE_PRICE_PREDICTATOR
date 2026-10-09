import { REQUIRED_FEATURE_KEYS } from '../constants/presets'

export const CSV_HEADERS = [
  'MedInc',
  'HouseAge',
  'AveRooms',
  'AveBedrms',
  'Population',
  'AveOccup',
  'Latitude',
  'Longitude',
] as const

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB

export interface CsvValidationResult {
  valid: boolean
  error?: string
  headers?: string[]
  missingColumns?: string[]
  sampleRows?: Record<string, string>[]
  rowCount?: number
}

/**
 * Generates a clean CSV template string with required headers and optional sample data
 */
export const generateCsvTemplate = (includeSampleRows = true): string => {
  const headerLine = CSV_HEADERS.join(',')
  if (!includeSampleRows) {
    return `${headerLine}\n`
  }

  // Two valid California census block group samples
  const sample1 = '8.32,41,6.98,1.02,322,2.55,37.88,-122.23'
  const sample2 = '5.64,21,5.81,1.06,1551,2.83,34.05,-118.25'
  const sample3 = '3.84,52,6.28,1.08,565,2.18,37.85,-122.25'

  return `${headerLine}\n${sample1}\n${sample2}\n${sample3}\n`
}

/**
 * Triggers a download of a text or blob file in the browser
 */
export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export const downloadCsvTemplate = (withSamples = true): void => {
  const content = generateCsvTemplate(withSamples)
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const filename = withSamples ? 'california_housing_template_with_samples.csv' : 'california_housing_template_blank.csv'
  downloadBlob(blob, filename)
}

/**
 * Inspects a user-selected CSV file before upload
 */
export const preflightValidateCsv = async (file: File): Promise<CsvValidationResult> => {
  // Check extension
  if (!file.name.toLowerCase().endsWith('.csv')) {
    return {
      valid: false,
      error: `Invalid file format: "${file.name}". Please upload a file with a .csv extension.`,
    }
  }

  // Check file size (max 10MB)
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(2)
    return {
      valid: false,
      error: `File size exceeds the 10 MB limit (${sizeMb} MB). Please choose a smaller CSV.`,
    }
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: 'The uploaded CSV file is empty (0 bytes).',
    }
  }

  // Read header and first few lines to validate columns
  try {
    const text = await readFileChunk(file, 64 * 1024) // First 64KB
    const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0)

    if (lines.length === 0) {
      return {
        valid: false,
        error: 'The CSV file does not contain any readable content.',
      }
    }

    const rawHeaders = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''))
    const missingColumns = REQUIRED_FEATURE_KEYS.filter((key) => !rawHeaders.includes(key))

    if (missingColumns.length > 0) {
      return {
        valid: false,
        headers: rawHeaders,
        missingColumns,
        error: `Missing required column(s): ${missingColumns.join(', ')}. All 8 columns are required.`,
      }
    }

    // Parse up to 5 sample preview rows
    const sampleRows: Record<string, string>[] = []
    const dataLines = lines.slice(1, 6)
    for (const dLine of dataLines) {
      const cols = dLine.split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''))
      if (cols.length === rawHeaders.length) {
        const rowObj: Record<string, string> = {}
        rawHeaders.forEach((h, idx) => {
          rowObj[h] = cols[idx]
        })
        sampleRows.push(rowObj)
      }
    }

    return {
      valid: true,
      headers: rawHeaders,
      missingColumns: [],
      sampleRows,
      rowCount: Math.max(0, lines.length - 1),
    }
  } catch (err) {
    return {
      valid: false,
      error: `Failed to inspect CSV: ${err instanceof Error ? err.message : 'Unknown error'}`,
    }
  }
}

const readFileChunk = (file: File, bytes: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    const slice = file.slice(0, bytes)
    reader.onload = (e) => resolve((e.target?.result as string) || '')
    reader.onerror = (e) => reject(e)
    reader.readAsText(slice)
  })
}

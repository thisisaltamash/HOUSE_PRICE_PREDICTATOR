import type { HealthResponse, HouseFeatures, PredictionResponse } from '../types/prediction'

export const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    return envUrl.replace(/\/+$/, '')
  }
  return 'http://localhost:8000'
}

export class ApiError extends Error {
  status?: number
  detail?: string

  constructor(message: string, status?: number, detail?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.detail = detail
  }
}

const parseErrorResponse = async (res: Response): Promise<string> => {
  try {
    const data = await res.json()
    if (data && typeof data === 'object') {
      if (typeof data.detail === 'string') return data.detail
      if (Array.isArray(data.detail)) {
        return data.detail.map((d: { msg?: string }) => d.msg || JSON.stringify(d)).join('; ')
      }
      if (typeof data.message === 'string') return data.message
    }
  } catch {
    // If not json, try plain text
    try {
      const text = await res.text()
      if (text.trim()) return text
    } catch {
      // ignore
    }
  }
  return `Server returned HTTP ${res.status}: ${res.statusText || 'Error'}`
}

export const api = {
  getBaseUrl(): string {
    return getApiBaseUrl()
  },

  async getHealth(): Promise<HealthResponse> {
    const url = `${getApiBaseUrl()}/health`
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      })
      if (!res.ok) {
        const errorDetail = await parseErrorResponse(res)
        throw new ApiError(errorDetail, res.status, errorDetail)
      }
      const data = await res.json()
      return data as HealthResponse
    } catch (err: unknown) {
      if (err instanceof ApiError) throw err
      const msg = err instanceof Error ? err.message : 'Failed to connect to API server'
      throw new ApiError(
        `Unable to reach backend at ${url}. Please ensure the FastAPI server is running. (${msg})`,
        0,
        msg
      )
    }
  },

  async predictSingle(features: HouseFeatures): Promise<PredictionResponse> {
    const url = `${getApiBaseUrl()}/predict`
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(features),
      })

      if (!res.ok) {
        const detail = await parseErrorResponse(res)
        throw new ApiError(detail, res.status, detail)
      }

      const data = await res.json()
      if (!data || typeof data.predicted_price !== 'string') {
        throw new ApiError('Unexpected response format: missing predicted_price field.')
      }

      return data as PredictionResponse
    } catch (err: unknown) {
      if (err instanceof ApiError) throw err
      const msg = err instanceof Error ? err.message : 'Network failure during prediction'
      throw new ApiError(
        `Network error when submitting prediction: ${msg}. Is the backend running?`,
        0,
        msg
      )
    }
  },

  async predictFile(file: File): Promise<{ blob: Blob; filename: string }> {
    const url = `${getApiBaseUrl()}/predict-file`
    const formData = new FormData()
    // Requirement F3: multipart/form-data with field name 'file'
    formData.append('file', file)

    try {
      const res = await fetch(url, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const detail = await parseErrorResponse(res)
        throw new ApiError(detail, res.status, detail)
      }

      // Check content-disposition header for filename
      let filename = 'predictions.csv'
      const disposition = res.headers.get('content-disposition')
      if (disposition && disposition.includes('filename=')) {
        const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
        if (match && match[1]) {
          filename = match[1].replace(/['"]/g, '').trim()
        }
      }

      const blob = await res.blob()
      return { blob, filename }
    } catch (err: unknown) {
      if (err instanceof ApiError) throw err
      const msg = err instanceof Error ? err.message : 'Network error during batch upload'
      throw new ApiError(
        `File upload failed: ${msg}. Check server connection and file format.`,
        0,
        msg
      )
    }
  },
}

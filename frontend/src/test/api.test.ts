import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { api, ApiError } from '../services/api'
import type { HouseFeatures } from '../types/prediction'

describe('API Client', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('provides a default base URL', () => {
    expect(api.getBaseUrl()).toBe('http://localhost:8000')
  })

  it('getHealth fetches and returns backend health response', async () => {
    const mockHealthData = {
      status: 'healthy',
      model: 'RandomForestRegressor',
      features: ['MedInc', 'HouseAge'],
      average_error: '39,000 USD',
    }

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockHealthData,
      })
    )

    const result = await api.getHealth()
    expect(result.status).toBe('healthy')
    expect(result.model).toBe('RandomForestRegressor')
    expect(result.average_error).toBe('39,000 USD')
  })

  it('getHealth throws ApiError when the backend is offline', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('Connection refused'))
    )

    await expect(api.getHealth()).rejects.toThrow(ApiError)
  })

  it('predictSingle sends expected JSON shape and parses response', async () => {
    const payload: HouseFeatures = {
      MedInc: 8.32,
      HouseAge: 41,
      AveRooms: 6.98,
      AveBedrms: 1.02,
      Population: 322,
      AveOccup: 2.55,
      Latitude: 37.88,
      Longitude: -122.23,
    }

    const mockResponse = {
      predicted_price: '$452,600',
      predicted_price_short: '$4.53hundred thousand dollar',
      fidence_range: '$413,600 to $491,600',
    }

    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    })
    vi.stubGlobal('fetch', fetchSpy)

    const result = await api.predictSingle(payload)
    expect(result.predicted_price).toBe('$452,600')
    expect(result.fidence_range).toBe('$413,600 to $491,600')

    expect(fetchSpy).toHaveBeenCalledWith(
      'http://localhost:8000/predict',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      })
    )
  })

  it('predictSingle handles HTTP error details properly', async () => {
    const payload: HouseFeatures = {
      MedInc: 5,
      HouseAge: 20,
      AveRooms: 5,
      AveBedrms: 1,
      Population: 1000,
      AveOccup: 3,
      Latitude: 36,
      Longitude: -120,
    }

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 422,
        json: async () => ({ detail: 'Input validation error on backend' }),
      })
    )

    await expect(api.predictSingle(payload)).rejects.toThrow(
      'Input validation error on backend'
    )
  })

  it('predictFile uploads with multipart form field "file" and receives CSV', async () => {
    const file = new File(['MedInc\n5\n'], 'test.csv', { type: 'text/csv' })

    const mockBlob = new Blob(['MedInc,predicted_price_USD\n5,$250,000\n'], {
      type: 'text/csv',
    })

    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      headers: {
        get: (header: string) =>
          header.toLowerCase() === 'content-disposition'
            ? 'attachment; filename="predictions_result.csv"'
            : null,
      },
      blob: async () => mockBlob,
    })

    vi.stubGlobal('fetch', fetchSpy)

    const { blob, filename } = await api.predictFile(file)
    expect(filename).toBe('predictions_result.csv')
    expect(blob).toBeDefined()

    expect(fetchSpy).toHaveBeenCalledWith(
      'http://localhost:8000/predict-file',
      expect.objectContaining({
        method: 'POST',
      })
    )
  })
})

export interface HouseFeatures {
  MedInc: number
  HouseAge: number
  AveRooms: number
  AveBedrms: number
  Population: number
  AveOccup: number
  Latitude: number
  Longitude: number
}

export type HouseFeatureKey = keyof HouseFeatures

export interface PredictionResponse {
  predicted_price: string
  predicted_price_short?: string
  fidence_range?: string
}

export interface HealthResponse {
  status: string
  model: string
  features: string[]
  average_error: string
}

export type ServiceStatus = 'checking' | 'available' | 'unavailable'

export interface HealthState {
  status: ServiceStatus
  data?: HealthResponse
  error?: string
  lastChecked?: Date
}

export interface PresetLocation {
  id: string
  name: string
  region: string
  description: string
  features: HouseFeatures
}

export type FormErrors = Partial<Record<HouseFeatureKey, string>>

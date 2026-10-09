import type { FormErrors, HouseFeatureKey } from '../types/prediction'

export interface ValidationResult {
  isValid: boolean
  errors: FormErrors
  firstErrorKey?: HouseFeatureKey
}

export const validateField = (
  field: HouseFeatureKey,
  value: number | string | undefined | null
): string | null => {
  if (value === undefined || value === null || value === '' || Number.isNaN(Number(value))) {
    return 'This field is required and must be a valid number.'
  }

  const num = Number(value)

  switch (field) {
    case 'MedInc':
      if (num <= 0) return 'Median income must be greater than 0 (in $10k units).'
      break
    case 'HouseAge':
      if (num <= 0) return 'House age must be greater than 0 years.'
      break
    case 'AveRooms':
      if (num <= 0) return 'Average rooms per household must be greater than 0.'
      break
    case 'AveBedrms':
      if (num <= 0) return 'Average bedrooms must be greater than 0.'
      break
    case 'Population':
      if (num <= 0) return 'Block group population must be greater than 0.'
      break
    case 'AveOccup':
      if (num <= 0) return 'Average household occupancy must be greater than 0.'
      break
    case 'Latitude':
      if (num < 32 || num > 42) {
        return 'Latitude must be between 32.0 and 42.0 (California geographic boundary).'
      }
      break
    case 'Longitude':
      if (num < -125 || num > -114) {
        return 'Longitude must be between -125.0 and -114.0 (California geographic boundary).'
      }
      break
  }

  return null
}

export const validateAllFields = (
  values: Partial<Record<HouseFeatureKey, number | string>>
): ValidationResult => {
  const errors: FormErrors = {}
  const fields: HouseFeatureKey[] = [
    'MedInc',
    'HouseAge',
    'AveRooms',
    'AveBedrms',
    'Population',
    'AveOccup',
    'Latitude',
    'Longitude',
  ]

  let firstErrorKey: HouseFeatureKey | undefined

  for (const field of fields) {
    const error = validateField(field, values[field])
    if (error) {
      errors[field] = error
      if (!firstErrorKey) firstErrorKey = field
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    firstErrorKey,
  }
}

import { describe, it, expect } from 'vitest'
import { validateField, validateAllFields } from '../utils/validation'

describe('Form Validation Rules', () => {
  it('validates MedInc must be greater than 0', () => {
    expect(validateField('MedInc', '')).toContain('required')
    expect(validateField('MedInc', 0)).toContain('greater than 0')
    expect(validateField('MedInc', -1.5)).toContain('greater than 0')
    expect(validateField('MedInc', 5.5)).toBeNull()
  })

  it('validates HouseAge must be greater than 0', () => {
    expect(validateField('HouseAge', '')).toContain('required')
    expect(validateField('HouseAge', 0)).toContain('greater than 0')
    expect(validateField('HouseAge', 25)).toBeNull()
  })

  it('validates AveRooms and AveBedrms must be greater than 0', () => {
    expect(validateField('AveRooms', 0)).toContain('greater than 0')
    expect(validateField('AveRooms', 5.8)).toBeNull()

    expect(validateField('AveBedrms', 0)).toContain('greater than 0')
    expect(validateField('AveBedrms', 1.05)).toBeNull()
  })

  it('validates Population and AveOccup must be greater than 0', () => {
    expect(validateField('Population', 0)).toContain('greater than 0')
    expect(validateField('Population', 1400)).toBeNull()

    expect(validateField('AveOccup', 0)).toContain('greater than 0')
    expect(validateField('AveOccup', 2.8)).toBeNull()
  })

  it('validates Latitude must be strictly within California boundaries [32.0, 42.0]', () => {
    expect(validateField('Latitude', 31.9)).toContain('between 32.0 and 42.0')
    expect(validateField('Latitude', 42.1)).toContain('between 32.0 and 42.0')
    expect(validateField('Latitude', 32.0)).toBeNull()
    expect(validateField('Latitude', 37.88)).toBeNull()
    expect(validateField('Latitude', 42.0)).toBeNull()
  })

  it('validates Longitude must be strictly within California boundaries [-125.0, -114.0]', () => {
    expect(validateField('Longitude', -125.1)).toContain('between -125.0 and -114.0')
    expect(validateField('Longitude', -113.9)).toContain('between -125.0 and -114.0')
    expect(validateField('Longitude', -125.0)).toBeNull()
    expect(validateField('Longitude', -122.23)).toBeNull()
    expect(validateField('Longitude', -114.0)).toBeNull()
  })

  it('returns valid when all eight required fields are within bounds', () => {
    const validValues = {
      MedInc: 8.32,
      HouseAge: 41,
      AveRooms: 6.98,
      AveBedrms: 1.02,
      Population: 322,
      AveOccup: 2.55,
      Latitude: 37.88,
      Longitude: -122.23,
    }

    const result = validateAllFields(validValues)
    expect(result.isValid).toBe(true)
    expect(Object.keys(result.errors).length).toBe(0)
    expect(result.firstErrorKey).toBeUndefined()
  })

  it('identifies missing and invalid fields across the entire form', () => {
    const invalidValues = {
      MedInc: -1,
      HouseAge: '',
      AveRooms: 0,
      AveBedrms: 1.0,
      Population: 500,
      AveOccup: 2.5,
      Latitude: 50.0, // Out of CA range
      Longitude: -120.0,
    }

    const result = validateAllFields(invalidValues)
    expect(result.isValid).toBe(false)
    expect(result.errors.MedInc).toBeDefined()
    expect(result.errors.HouseAge).toBeDefined()
    expect(result.errors.AveRooms).toBeDefined()
    expect(result.errors.Latitude).toBeDefined()
    expect(result.errors.Longitude).toBeUndefined()
    expect(result.firstErrorKey).toBe('MedInc')
  })
})

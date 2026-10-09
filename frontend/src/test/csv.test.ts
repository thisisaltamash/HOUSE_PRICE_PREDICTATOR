import { describe, it, expect } from 'vitest'
import {
  generateCsvTemplate,
  CSV_HEADERS,
  preflightValidateCsv,
  MAX_FILE_SIZE_BYTES,
} from '../utils/csv'

describe('CSV Utilities & Preflight Validation', () => {
  it('generates a blank template with the exact eight required headers', () => {
    const template = generateCsvTemplate(false)
    const expectedHeaderLine = 'MedInc,HouseAge,AveRooms,AveBedrms,Population,AveOccup,Latitude,Longitude\n'
    expect(template).toBe(expectedHeaderLine)
  })

  it('generates a template with sample rows that has all headers', () => {
    const template = generateCsvTemplate(true)
    const lines = template.trim().split('\n')
    expect(lines[0]).toBe('MedInc,HouseAge,AveRooms,AveBedrms,Population,AveOccup,Latitude,Longitude')
    expect(lines.length).toBeGreaterThan(1)
  })

  it('rejects files without a .csv extension', async () => {
    const fakeFile = new File(['hello'], 'data.xlsx', { type: 'application/vnd.ms-excel' })
    const res = await preflightValidateCsv(fakeFile)
    expect(res.valid).toBe(false)
    expect(res.error).toContain('Invalid file format')
  })

  it('rejects files larger than 10MB limit', async () => {
    const largeFile = new File(['a'], 'huge.csv', { type: 'text/csv' })
    // Mock the size property
    Object.defineProperty(largeFile, 'size', { value: MAX_FILE_SIZE_BYTES + 1024 })
    const res = await preflightValidateCsv(largeFile)
    expect(res.valid).toBe(false)
    expect(res.error).toContain('10 MB limit')
  })

  it('detects missing required columns in user CSV', async () => {
    // Missing 'Latitude' and 'Longitude'
    const csvContent = 'MedInc,HouseAge,AveRooms,AveBedrms,Population,AveOccup\n5,20,5,1,1000,3\n'
    const file = new File([csvContent], 'incomplete.csv', { type: 'text/csv' })
    const res = await preflightValidateCsv(file)
    expect(res.valid).toBe(false)
    expect(res.missingColumns).toContain('Latitude')
    expect(res.missingColumns).toContain('Longitude')
  })

  it('accepts a valid CSV with all eight required headers', async () => {
    const csvContent = `${CSV_HEADERS.join(',')}\n8.32,41,6.98,1.02,322,2.55,37.88,-122.23\n`
    const file = new File([csvContent], 'valid_block.csv', { type: 'text/csv' })
    const res = await preflightValidateCsv(file)
    expect(res.valid).toBe(true)
    expect(res.headers).toEqual(expect.arrayContaining([...CSV_HEADERS]))
    expect(res.missingColumns).toHaveLength(0)
    expect(res.rowCount).toBe(1)
  })
})

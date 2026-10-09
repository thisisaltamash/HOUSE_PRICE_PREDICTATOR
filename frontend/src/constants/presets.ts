import type { PresetLocation } from '../types/prediction'

export const REQUIRED_FEATURE_KEYS: (keyof PresetLocation['features'])[] = [
  'MedInc',
  'HouseAge',
  'AveRooms',
  'AveBedrms',
  'Population',
  'AveOccup',
  'Latitude',
  'Longitude',
]

export const FEATURE_METADATA: Record<
  keyof PresetLocation['features'],
  {
    label: string
    unit: string
    hint: string
    placeholder: string
    step: string
    min?: number
    max?: number
    group: 'economic' | 'housing' | 'demographic' | 'geographic'
  }
> = {
  MedInc: {
    label: 'Median Income',
    unit: 'Tens of thousands ($10k)',
    hint: 'Median income in block group (e.g. 8.3 = $83,000/yr)',
    placeholder: 'e.g. 5.5',
    step: '0.01',
    min: 0.01,
    group: 'economic',
  },
  HouseAge: {
    label: 'Median House Age',
    unit: 'Years',
    hint: 'Median age of houses in this census block',
    placeholder: 'e.g. 25',
    step: '1',
    min: 1,
    max: 100,
    group: 'housing',
  },
  AveRooms: {
    label: 'Average Rooms',
    unit: 'Rooms / Household',
    hint: 'Average number of total rooms per household',
    placeholder: 'e.g. 5.8',
    step: '0.01',
    min: 0.1,
    group: 'housing',
  },
  AveBedrms: {
    label: 'Average Bedrooms',
    unit: 'Bedrooms / Household',
    hint: 'Average number of bedrooms per household',
    placeholder: 'e.g. 1.05',
    step: '0.01',
    min: 0.1,
    group: 'housing',
  },
  Population: {
    label: 'Block Population',
    unit: 'Residents',
    hint: 'Total population residing in this census block group',
    placeholder: 'e.g. 1425',
    step: '1',
    min: 1,
    group: 'demographic',
  },
  AveOccup: {
    label: 'Average Occupancy',
    unit: 'Members / Household',
    hint: 'Average number of household members',
    placeholder: 'e.g. 2.8',
    step: '0.01',
    min: 0.1,
    group: 'demographic',
  },
  Latitude: {
    label: 'Latitude',
    unit: '°N (32.0 to 42.0)',
    hint: 'California geographic latitude coordinate',
    placeholder: 'e.g. 37.77',
    step: '0.0001',
    min: 32.0,
    max: 42.0,
    group: 'geographic',
  },
  Longitude: {
    label: 'Longitude',
    unit: '°W (-125.0 to -114.0)',
    hint: 'California geographic longitude coordinate',
    placeholder: 'e.g. -122.41',
    step: '0.0001',
    min: -125.0,
    max: -114.0,
    group: 'geographic',
  },
}

export const PRESET_LOCATIONS: PresetLocation[] = [
  {
    id: 'sf-bay',
    name: 'San Francisco Peninsula',
    region: 'Northern California',
    description: 'High-income coastal block with historic housing stock',
    features: {
      MedInc: 8.32,
      HouseAge: 41,
      AveRooms: 6.98,
      AveBedrms: 1.02,
      Population: 322,
      AveOccup: 2.55,
      Latitude: 37.88,
      Longitude: -122.23,
    },
  },
  {
    id: 'silicon-valley',
    name: 'Silicon Valley / Cupertino',
    region: 'South Bay',
    description: 'Affluent tech corridor with suburban family homes',
    features: {
      MedInc: 9.85,
      HouseAge: 25,
      AveRooms: 7.2,
      AveBedrms: 1.05,
      Population: 1450,
      AveOccup: 2.9,
      Latitude: 37.32,
      Longitude: -122.03,
    },
  },
  {
    id: 'la-metro',
    name: 'Los Angeles Metro / Coastal',
    region: 'Southern California',
    description: 'High-density coastal metropolitan census block',
    features: {
      MedInc: 6.25,
      HouseAge: 32,
      AveRooms: 5.4,
      AveBedrms: 1.01,
      Population: 2100,
      AveOccup: 3.1,
      Latitude: 34.05,
      Longitude: -118.25,
    },
  },
  {
    id: 'central-valley',
    name: 'Central Valley / Fresno',
    region: 'Inland California',
    description: 'Agricultural hub with affordable family occupancy',
    features: {
      MedInc: 3.12,
      HouseAge: 18,
      AveRooms: 5.1,
      AveBedrms: 1.08,
      Population: 1850,
      AveOccup: 3.4,
      Latitude: 36.74,
      Longitude: -119.78,
    },
  },
]

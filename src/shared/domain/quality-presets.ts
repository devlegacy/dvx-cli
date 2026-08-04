export interface QualityPreset {
  jpeg: number
  png: [
    number,
    number,
  ]
  webp: number
  zopfliIterations: number
}

export type Quality = 'high' | 'medium' | 'low'

export const QUALITY_PRESETS: Record<Quality, QualityPreset> = {
  high: {
    jpeg: 90,
    png: [
      0.7,
      0.9,
    ],
    webp: 85,
    zopfliIterations: 15,
  },
  medium: {
    jpeg: 80,
    png: [
      0.65,
      0.85,
    ],
    webp: 80,
    zopfliIterations: 8,
  },
  low: {
    jpeg: 70,
    png: [
      0.5,
      0.7,
    ],
    webp: 75,
    zopfliIterations: 5,
  },
}

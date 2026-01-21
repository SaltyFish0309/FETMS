import { describe, it, expect } from 'vitest'
import {
  CHART_COLORS,
  GENDER_COLORS,
  getChartColor,
  getGenderColor
} from '../chartColors'

describe('chartColors', () => {
  describe('CHART_COLORS', () => {
    it('should have exactly 6 colors', () => {
      expect(CHART_COLORS).toHaveLength(6)
    })

    it('should contain valid hex colors', () => {
      const hexRegex = /^#[0-9A-Fa-f]{6}$/
      CHART_COLORS.forEach(color => {
        expect(color).toMatch(hexRegex)
      })
    })

    it('should start with primary blue', () => {
      expect(CHART_COLORS[0]).toBe('#2563EB')
    })
  })

  describe('getChartColor', () => {
    it('should return color at index', () => {
      expect(getChartColor(0)).toBe('#2563EB')
      expect(getChartColor(2)).toBe('#10B981')
    })

    it('should wrap around when index exceeds length', () => {
      expect(getChartColor(6)).toBe('#2563EB')
      expect(getChartColor(7)).toBe('#3B82F6')
    })
  })

  describe('getGenderColor', () => {
    it('should return blue for male', () => {
      expect(getGenderColor('Male')).toBe('#3B82F6')
      expect(getGenderColor('male')).toBe('#3B82F6')
    })

    it('should return pink for female', () => {
      expect(getGenderColor('Female')).toBe('#EC4899')
      expect(getGenderColor('female')).toBe('#EC4899')
    })

    it('should return slate for unknown', () => {
      expect(getGenderColor('Other')).toBe('#64748B')
      expect(getGenderColor('')).toBe('#64748B')
    })
  })
})

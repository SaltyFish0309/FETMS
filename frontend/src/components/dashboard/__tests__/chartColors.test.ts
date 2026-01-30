import { describe, it, expect } from 'vitest'
import {
  getChartColor,
  getGenderColor,
  getAxisColor,
  getBorderColor
} from '../chartColors'

describe('chartColors', () => {
  describe('getChartColor', () => {
    it('should return CSS variable reference at index', () => {
      expect(getChartColor(0)).toBe('var(--color-chart-1)')
      expect(getChartColor(2)).toBe('var(--color-chart-3)')
    })

    it('should wrap around when index exceeds length', () => {
      expect(getChartColor(6)).toBe('var(--color-chart-1)')
      expect(getChartColor(7)).toBe('var(--color-chart-2)')
    })

    it('should return valid CSS variable format', () => {
      const cssVarRegex = /^var\(--color-chart-[1-6]\)$/
      for (let i = 0; i < 6; i++) {
        expect(getChartColor(i)).toMatch(cssVarRegex)
      }
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

  describe('getAxisColor', () => {
    it('should return CSS variable for muted foreground', () => {
      expect(getAxisColor()).toBe('var(--color-muted-foreground)')
    })
  })

  describe('getBorderColor', () => {
    it('should return CSS variable for border', () => {
      expect(getBorderColor()).toBe('var(--color-border)')
    })
  })
})

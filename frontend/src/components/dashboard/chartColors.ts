/**
 * FETMS Dashboard Chart Colors
 * Cohesive color palette for all dashboard visualizations
 */

export const CHART_COLORS = [
  '#2563EB', // Primary Blue
  '#3B82F6', // Light Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#8B5CF6', // Violet
  '#EC4899', // Pink
] as const

export const GENDER_COLORS = {
  male: '#3B82F6',
  female: '#EC4899',
  other: '#64748B',
} as const

export function getChartColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length]
}

export function getGenderColor(gender: string): string {
  const g = gender.toLowerCase()
  if (g === 'male') return GENDER_COLORS.male
  if (g === 'female') return GENDER_COLORS.female
  return GENDER_COLORS.other
}

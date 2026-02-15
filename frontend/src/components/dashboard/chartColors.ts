/**
 * FETMS Dashboard Chart Colors
 * Theme-aware color palette using CSS variables for all dashboard visualizations
 */

// Use CSS variable references that adapt to theme
export function getChartColor(index: number): string {
  const colors = [
    'var(--color-chart-1)',
    'var(--color-chart-2)',
    'var(--color-chart-3)',
    'var(--color-chart-4)',
    'var(--color-chart-5)',
    'var(--color-chart-6)',
  ]
  return colors[index % colors.length]
}

// Gender colors remain as hex values - they provide sufficient contrast in both modes
export const GENDER_COLORS = {
  male: '#3B82F6',
  female: '#EC4899',
  other: '#64748B',
} as const

export function getGenderColor(gender: string): string {
  const g = gender.toLowerCase()
  if (g === 'male') return GENDER_COLORS.male
  if (g === 'female') return GENDER_COLORS.female
  return GENDER_COLORS.other
}

// Helper functions for chart theming
export function getAxisColor(): string {
  return 'var(--color-muted-foreground)'
}

export function getBorderColor(): string {
  return 'var(--color-border)'
}

/**
 * Tokens de marca DragonflAI para ¿CómoMeVoy?
 * Paleta oscura tipo "ciruela" con acentos lavanda/menta.
 */

export const colors = {
  // Fondo
  background: '#241629',
  backgroundElevated: '#31203A',
  backgroundElevatedAlt: '#3D2848',
  surface: '#2C1A33',

  // Marca
  primary: '#B9A6EC', // lavanda
  primaryMuted: '#8C76C4',
  primaryContrastText: '#1A1020',

  secondary: '#7FE8C9', // menta
  secondaryMuted: '#54B79B',
  secondaryContrastText: '#0F2620',

  // Texto
  textPrimary: '#F5F1FA',
  textSecondary: '#C9BBD6',
  textMuted: '#8E7C9C',

  // UI
  border: '#4A3455',
  borderSubtle: '#3A2843',
  overlay: 'rgba(20, 10, 24, 0.6)',

  // Estado
  success: '#7FE8C9',
  warning: '#F4C463',
  error: '#F17E86',
  info: '#8FC9EF',

  transparent: 'transparent',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 20,
  xl: 28,
  full: 999,
} as const;

export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
    display: 40,
  },
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
    xxl: 40,
    display: 48,
  },
} as const;

export const shadows = {
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
} as const;

export const theme = {
  colors,
  spacing,
  radii,
  typography,
  shadows,
} as const;

export type Theme = typeof theme;

export default theme;

import { DarkTheme, type Theme } from '@react-navigation/native';
import { colors } from '../constants/theme';

export const navigationTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.backgroundElevated,
    text: colors.textPrimary,
    border: colors.border,
    notification: colors.secondary,
  },
};

export default navigationTheme;

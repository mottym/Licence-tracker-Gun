import { MD3LightTheme, type MD3Theme } from "react-native-paper";

export const theme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#0f172a",
    onPrimary: "#ffffff",
    primaryContainer: "#e2e8f0",
    onPrimaryContainer: "#0f172a",
    secondary: "#475569",
    onSecondary: "#ffffff",
    secondaryContainer: "#f1f5f9",
    onSecondaryContainer: "#0f172a",
    background: "#f8fafc",
    surface: "#ffffff",
    surfaceVariant: "#f1f5f9",
    onSurface: "#0f172a",
    onSurfaceVariant: "#475569",
    outline: "#cbd5e1",
  },
};

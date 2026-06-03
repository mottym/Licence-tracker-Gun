# App icons & splash screen

Drop the following PNGs into this folder before building production binaries:

| File | Size | Purpose |
| --- | --- | --- |
| `icon.png` | 1024×1024 | App launcher icon (square) |
| `adaptive-icon.png` | 1024×1024 | Android adaptive-icon foreground layer (with transparent margin) |
| `splash.png` | 1242×2436 | Splash screen image |
| `notification-icon.png` | 96×96, white silhouette on transparent | Status-bar notification icon |

While developing in Expo Go these defaults are not required — Expo Go uses its own
icon. For the first internal build, you can generate placeholders with any image
tool or use `npx expo install expo-asset` + your own designs.

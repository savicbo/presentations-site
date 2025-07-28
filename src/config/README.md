# Font Configuration

This directory contains centralized configuration for the presentation app.

## Changing Fonts

To change the font used throughout the application, edit `/src/config/fonts.ts`:

1. **Quick Switch**: Uncomment one of the alternative font configurations and comment out the current `primary` configuration.

2. **Add New Font**: Import a new Google Font and add it as a new option:
   ```typescript
   import { Your_Font } from "next/font/google";
   
   // Add to FONT_CONFIG alternatives:
   // primary: {
   //   name: "Your Font",
   //   font: Your_Font({
   //     variable: "--font-primary",
   //     subsets: ["latin"],
   //     weight: ["400", "500", "600", "700"],
   //   }),
   //   fallback: "sans-serif", // or "monospace" for monospace fonts
   // },
   ```

3. **Custom Fonts**: For local fonts, modify the font configuration to use CSS font-face declarations instead.

## Available Fonts

The configuration includes these ready-to-use fonts:
- **Pixelify Sans** (current) - Retro pixel font
- **Inter** - Modern sans-serif
- **JetBrains Mono** - Developer-focused monospace
- **Fira Code** - Monospace with ligatures

## How It Works

- All fonts use the CSS variable `--font-primary`
- Tailwind classes use `font-primary` 
- The font is applied globally through the layout component
- Fallback fonts are automatically applied for better loading experience

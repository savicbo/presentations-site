import { Pixelify_Sans, Inter, JetBrains_Mono, Fira_Code, Doto } from "next/font/google";

// Font loaders - must be called at module scope
const pixelifySans = Pixelify_Sans({
  variable: "--font-primary",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-primary",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-primary",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const firaCode = Fira_Code({
  variable: "--font-primary",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const doto = Doto({
  variable: "--font-primary",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
});

// Bitcount Single - using Google Fonts via external CSS
const bitcountSingle = {
  variable: "--font-primary",
  className: "font-primary"
};

// Export all font instances for potential use
export { pixelifySans, inter, jetbrainsMono, firaCode, doto };

// Font configuration - Change this to switch fonts easily
export const FONT_CONFIG = {
  // Primary font for presentations - CHANGE THIS LINE TO SWITCH FONTS
  primary: {
    name: "Bitcount Single",
    font: bitcountSingle,
    fallback: "monospace",
  },
  
  // Alternative configurations - uncomment one and comment out primary above:
  
  // primary: {
  //   name: "Pixelify Sans",
  //   font: pixelifySans,
  //   fallback: "monospace",
  // },
  
  // primary: {
  //   name: "Inter",
  //   font: inter,
  //   fallback: "sans-serif",
  // },
  
  // primary: {
  //   name: "JetBrains Mono",
  //   font: jetbrainsMono,
  //   fallback: "monospace",
  // },
  
  // primary: {
  //   name: "Fira Code",
  //   font: firaCode,
  //   fallback: "monospace",
  // },
};

// Export the current font configuration
export const primaryFont = FONT_CONFIG.primary.font;
export const primaryFontName = FONT_CONFIG.primary.name;
export const primaryFontFallback = FONT_CONFIG.primary.fallback;

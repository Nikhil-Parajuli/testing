import { extractColors } from './utils/colorUtils';
import { extractFonts } from './utils/fontUtils';

// Make functions available in the global scope
(window as any).extractColors = extractColors;
(window as any).extractFonts = extractFonts;

console.log('Color and Fonts Palette Extractor initialized');
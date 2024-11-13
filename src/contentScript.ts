import { extractColors } from './utils/colorUtils';
import { extractFonts } from './utils/fontUtils';

// Make the extraction functions available to the extension
(window as any).extractColors = extractColors;
(window as any).extractFonts = extractFonts;

console.log('Color and Fonts Palette Extractor initialized');
export interface ColorInfo {
  hex: string;
  rgb: string;
  element: string;
}

export interface FontInfo {
  name: string;
  usage: string[];
  isWebFont: boolean;
}

export interface SavedPalette {
  id: number;
  colors: string[];
  complementary: string[];
  fonts: string[];
  timestamp: string;
}
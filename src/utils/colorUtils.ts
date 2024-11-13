// Content script function to be injected into the webpage
export function extractColors() {
  const colors = new Map();

  function processColor(color, element, type) {
    if (color && color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent') {
      const hex = rgbToHex(color);
      if (!colors.has(hex)) {
        colors.set(hex, {
          hex,
          rgb: color,
          element: `${getElementDescription(element)} (${type})`,
          count: 1
        });
      } else {
        colors.get(hex).count++;
      }
    }
  }

  function getElementDescription(el) {
    let desc = el.tagName.toLowerCase();
    if (el.id) desc += `#${el.id}`;
    if (el.className && typeof el.className === 'string') {
      desc += `.${el.className.split(' ').join('.')}`;
    }
    return desc;
  }

  // Process all elements
  document.querySelectorAll('*').forEach((el) => {
    const styles = getComputedStyle(el);
    
    // Check common color properties
    [
      ['backgroundColor', 'background'],
      ['color', 'text'],
      ['borderColor', 'border'],
      ['boxShadow', 'shadow']
    ].forEach(([prop, label]) => {
      const value = styles[prop];
      if (value && !value.includes('none')) {
        processColor(value, el, label);
      }
    });

    // Extract gradient colors
    const backgroundImage = styles.backgroundImage;
    if (backgroundImage && backgroundImage.includes('gradient')) {
      const gradientColors = backgroundImage.match(/rgba?\([^)]+\)|#[a-f\d]{3,6}/gi);
      gradientColors?.forEach(color => processColor(color, el, 'gradient'));
    }
  });

  // Return sorted results
  return Array.from(colors.values())
    .sort((a, b) => b.count - a.count)
    .map(({ hex, rgb, element }) => ({ hex, rgb, element }));
}

export function generateComplementaryPalette(baseColor: string): string[] {
  const rgb = hexToRgb(baseColor);
  if (!rgb) return [];

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  
  // Generate a harmonious color palette
  return [
    baseColor, // Original color
    hslToHex((hsl[0] + 180) % 360, hsl[1], hsl[2]), // Complementary
    hslToHex((hsl[0] + 120) % 360, hsl[1], hsl[2]), // Triadic 1
    hslToHex((hsl[0] + 240) % 360, hsl[1], hsl[2]), // Triadic 2
    hslToHex(hsl[0], Math.max(0, hsl[1] - 30), Math.min(100, hsl[2] + 20)), // Light variant
    hslToHex(hsl[0], Math.min(100, hsl[1] + 20), Math.max(0, hsl[2] - 20)), // Dark variant
  ];
}

// Color conversion utilities
function rgbToHex(color: string): string {
  if (color.startsWith('#')) return color;
  const match = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return '#000000';
  const [_, r, g, b] = match.map(Number);
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s;
  const l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }

    h /= 6;
  }

  return [h * 360, s * 100, l * 100];
}

function hslToHex(h: number, s: number, l: number): string {
  h /= 360;
  s /= 100;
  l /= 100;
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
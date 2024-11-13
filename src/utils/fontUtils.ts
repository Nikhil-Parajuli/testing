// Content script function to be injected into the webpage
export function extractFonts() {
  const fonts = new Map();
  const webFonts = new Set();

  // Collect web fonts
  if (document.fonts) {
    document.fonts.forEach(font => {
      webFonts.add(font.family.replace(/['"]/g, ''));
    });
  }

  // Helper function to get computed styles safely
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
    const fontFamily = styles.fontFamily
      .split(',')
      .map(font => font.trim().replace(/['"]/g, ''))
      .filter(font => font !== '')[0];

    if (fontFamily) {
      if (!fonts.has(fontFamily)) {
        fonts.set(fontFamily, {
          name: fontFamily,
          usage: new Set(),
          isWebFont: webFonts.has(fontFamily),
          samples: {
            sizes: new Set(),
            weights: new Set()
          }
        });
      }

      const font = fonts.get(fontFamily);
      const elementDesc = `${getElementDescription(el)} (${styles.fontSize}, ${styles.fontWeight})`;
      font.usage.add(elementDesc);
      font.samples.sizes.add(styles.fontSize);
      font.samples.weights.add(styles.fontWeight);
    }
  });

  // Convert to array and sort by usage
  return Array.from(fonts.values())
    .map(font => ({
      name: font.name,
      usage: Array.from(font.usage),
      isWebFont: font.isWebFont,
      samples: {
        sizes: Array.from(font.samples.sizes),
        weights: Array.from(font.samples.weights)
      }
    }))
    .sort((a, b) => b.usage.length - a.usage.length);
}
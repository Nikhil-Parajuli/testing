import React from 'react';
import type { ColorInfo } from '../types';

interface ColorPaletteProps {
  colors: ColorInfo[];
  complementaryColors: string[];
}

const ColorPalette: React.FC<ColorPaletteProps> = ({ colors, complementaryColors }) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      {colors.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Extracted Colors</h2>
          <div className="grid grid-cols-2 gap-3">
            {colors.map((color, index) => (
              <div
                key={index}
                className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div
                  className="w-full h-20 rounded-md mb-2 cursor-pointer"
                  style={{ backgroundColor: color.hex }}
                  onClick={() => copyToClipboard(color.hex)}
                  title="Click to copy color code"
                />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-800 cursor-pointer hover:text-blue-600"
                     onClick={() => copyToClipboard(color.hex)}>
                    {color.hex}
                  </p>
                  <p className="text-xs text-gray-500 cursor-pointer hover:text-blue-600"
                     onClick={() => copyToClipboard(color.rgb)}>
                    {color.rgb}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{color.element}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {complementaryColors.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Color Palette
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {complementaryColors.map((color, index) => (
              <div
                key={index}
                className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div
                  className="w-full h-20 rounded-md mb-2 cursor-pointer"
                  style={{ backgroundColor: color }}
                  onClick={() => copyToClipboard(color)}
                  title="Click to copy color code"
                />
                <p className="text-sm font-medium text-gray-800 cursor-pointer hover:text-blue-600"
                   onClick={() => copyToClipboard(color)}>
                  {color}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPalette;
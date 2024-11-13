import React from 'react';
import type { FontInfo } from '../types';

interface FontListProps {
  fonts: FontInfo[];
}

const FontList: React.FC<FontListProps> = ({ fonts }) => {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-3">Extracted Fonts</h2>
      <div className="space-y-3">
        {fonts.map((font, index) => (
          <div
            key={index}
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-lg font-medium" style={{ fontFamily: font.name }}>
                {font.name}
              </p>
              {font.isWebFont && (
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                  Web Font
                </span>
              )}
            </div>
            <div className="space-y-1">
              <p style={{ fontFamily: font.name }} className="text-2xl mb-2">
                The quick brown fox jumps over the lazy dog
              </p>
              <div className="text-sm text-gray-500">
                <p className="font-medium mb-1">Used in:</p>
                <ul className="list-disc list-inside space-y-1">
                  {font.usage.slice(0, 5).map((use, i) => (
                    <li key={i} className="truncate">{use}</li>
                  ))}
                  {font.usage.length > 5 && (
                    <li>And {font.usage.length - 5} more...</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FontList;
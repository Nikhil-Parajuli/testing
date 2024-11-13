import React, { useState, useEffect } from 'react';
import { Palette, Pipette, Download, Save, RefreshCw, Type, Trash2 } from 'lucide-react';
import ColorPalette from './components/ColorPalette';
import FontList from './components/FontList';
import { extractColors, generateComplementaryPalette } from './utils/colorUtils';
import { extractFonts } from './utils/fontUtils';
import { saveToStorage, loadFromStorage, deletePalette } from './utils/storageUtils';
import type { ColorInfo, FontInfo, SavedPalette } from './types';

const isExtensionEnvironment = typeof chrome !== 'undefined' && chrome.tabs && chrome.scripting;

function App() {
  const [colors, setColors] = useState<ColorInfo[]>([]);
  const [fonts, setFonts] = useState<FontInfo[]>([]);
  const [complementaryColors, setComplementaryColors] = useState<string[]>([]);
  const [savedPalettes, setSavedPalettes] = useState<SavedPalette[]>([]);
  const [activeTab, setActiveTab] = useState<'colors' | 'fonts'>('colors');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFromStorage().then((data) => setSavedPalettes(data));
  }, []);

  const handleExtractColors = async () => {
    setLoading(true);
    setError(null);
    try {
      if (isExtensionEnvironment) {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab?.id) throw new Error('No active tab found');

        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: extractColors,
        });

        if (results?.[0]?.result) {
          setColors(results[0].result);
        }
      } else {
        // Development mode: Use sample data
        const sampleColors = [
          { hex: '#1a73e8', rgb: 'rgb(26, 115, 232)', element: 'button.primary' },
          { hex: '#202124', rgb: 'rgb(32, 33, 36)', element: 'body' },
          { hex: '#ffffff', rgb: 'rgb(255, 255, 255)', element: 'div.background' },
        ];
        setColors(sampleColors);
      }
    } catch (err) {
      setError('Failed to extract colors. Make sure you\'re on a webpage.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExtractFonts = async () => {
    setLoading(true);
    setError(null);
    try {
      if (isExtensionEnvironment) {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab?.id) throw new Error('No active tab found');

        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: extractFonts,
        });

        if (results?.[0]?.result) {
          setFonts(results[0].result);
        }
      } else {
        // Development mode: Use sample data
        const sampleFonts = [
          { name: 'Roboto', usage: ['h1.title', 'p.body'], isWebFont: true },
          { name: 'Arial', usage: ['div.content'], isWebFont: false },
        ];
        setFonts(sampleFonts);
      }
    } catch (err) {
      setError('Failed to extract fonts. Make sure you\'re on a webpage.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateComplementary = () => {
    if (colors.length) {
      const complementary = generateComplementaryPalette(colors[0].hex);
      setComplementaryColors(complementary);
    }
  };

  const handleSavePalette = () => {
    const newPalette: SavedPalette = {
      id: Date.now(),
      colors: colors.map(c => c.hex),
      complementary: complementaryColors,
      fonts: fonts.map(f => f.name),
      timestamp: new Date().toISOString()
    };
    
    const updatedPalettes = [...savedPalettes, newPalette];
    setSavedPalettes(updatedPalettes);
    saveToStorage(updatedPalettes);
  };

  const handleDeletePalette = async (id: number) => {
    const updatedPalettes = savedPalettes.filter(p => p.id !== id);
    setSavedPalettes(updatedPalettes);
    await deletePalette(id);
  };

  const handleExport = () => {
    const data = {
      colors: colors.map(c => ({
        hex: c.hex,
        rgb: c.rgb,
        element: c.element
      })),
      complementaryColors,
      fonts: fonts.map(f => ({
        name: f.name,
        usage: f.usage,
        isWebFont: f.isWebFont
      }))
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'palette-export.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-[400px] min-h-[500px] bg-gray-50">
      <header className="bg-white shadow-sm px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Palette className="w-6 h-6 text-indigo-600" />
            Palette Extractor
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('colors')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                activeTab === 'colors'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Colors
            </button>
            <button
              onClick={() => setActiveTab('fonts')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                activeTab === 'fonts'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Fonts
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExtractColors}
            disabled={loading}
            className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            <Pipette className="w-4 h-4" />
            {loading ? 'Extracting...' : 'Extract Colors'}
          </button>
          <button
            onClick={handleExtractFonts}
            disabled={loading}
            className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            <Type className="w-4 h-4" />
            {loading ? 'Extracting...' : 'Extract Fonts'}
          </button>
        </div>
        {error && (
          <div className="mt-2 text-sm text-red-600">
            {error}
          </div>
        )}
      </header>

      <main className="p-4">
        {activeTab === 'colors' ? (
          <>
            <ColorPalette
              colors={colors}
              complementaryColors={complementaryColors}
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleGenerateComplementary}
                disabled={!colors.length}
                className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw className="w-4 h-4" />
                Generate Palette
              </button>
              <button
                onClick={handleSavePalette}
                disabled={!colors.length}
                className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                Save Palette
              </button>
              <button
                onClick={handleExport}
                disabled={!colors.length && !fonts.length}
                className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </>
        ) : (
          <FontList fonts={fonts} />
        )}

        {savedPalettes.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Saved Palettes</h2>
            <div className="space-y-3">
              {savedPalettes.map((palette) => (
                <div
                  key={palette.id}
                  className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex gap-1">
                      {palette.colors.map((color) => (
                        <div
                          key={color}
                          className="w-8 h-8 rounded-md"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <button
                      onClick={() => handleDeletePalette(palette.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100"
                      title="Delete palette"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(palette.timestamp).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
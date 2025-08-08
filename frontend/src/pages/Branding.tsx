import Card from '../components/Card';
import { Upload, Palette } from 'lucide-react';
import { useState } from 'react';

const Branding = () => {
  const [primaryColor, setPrimaryColor] = useState('#10B981');
  const [secondaryColor, setSecondaryColor] = useState('#6B7280');
  const [accentColor, setAccentColor] = useState('#F59E0B');

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Brand Customization</h2>
      <p className="text-gray-600 mb-8">Upload your logo and set your brand colors</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Company Logo">
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-600 mb-2">
                Drag and drop your logo here, or click to browse
              </p>
              <p className="text-xs text-gray-500 mb-4">
                PNG, JPG or SVG (max. 2MB)
              </p>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                Choose File
              </button>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Current Logo</h4>
              <div className="bg-white p-4 rounded border border-gray-200 flex items-center justify-center h-32">
                <span className="text-gray-400">No logo uploaded</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Your Company Name"
              />
            </div>
          </div>
        </Card>

        <Card title="Brand Colors">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Color
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <div 
                  className="w-10 h-10 rounded-lg border border-gray-300"
                  style={{ backgroundColor: primaryColor }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Used for headers and CTAs</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secondary Color
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <div 
                  className="w-10 h-10 rounded-lg border border-gray-300"
                  style={{ backgroundColor: secondaryColor }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Used for body text and secondary elements</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Accent Color
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <div 
                  className="w-10 h-10 rounded-lg border border-gray-300"
                  style={{ backgroundColor: accentColor }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Used for highlights and notifications</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Color Preview</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-full h-8 rounded flex items-center px-3 text-white text-sm font-medium" style={{ backgroundColor: primaryColor }}>
                    Primary Button
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-full h-8 rounded flex items-center px-3 text-white text-sm" style={{ backgroundColor: secondaryColor }}>
                    Secondary Text
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-full h-8 rounded flex items-center px-3 text-white text-sm" style={{ backgroundColor: accentColor }}>
                    Accent Badge
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Reset to Defaults
              </button>
              <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
                Save Branding
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Branding;
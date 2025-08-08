import { useState, useEffect, useRef } from 'react';
import Card from '../components/Card';
import { Upload, Palette, Save, RotateCcw } from 'lucide-react';
import { brandingAPI, BrandingData } from '../services/api';

const Branding = () => {
  const [branding, setBranding] = useState<BrandingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#22c55e');
  const [secondaryColor, setSecondaryColor] = useState('#16a34a');
  const [accentColor, setAccentColor] = useState('#15803d');
  const [fontFamily, setFontFamily] = useState('Inter');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchBranding();
  }, []);

  const fetchBranding = async () => {
    try {
      const data = await brandingAPI.get();
      setBranding(data);
      setPrimaryColor(data.primary_color);
      setSecondaryColor(data.secondary_color);
      setAccentColor(data.accent_color);
      setFontFamily(data.font_family);
      setLogoUrl(data.logo_url);
    } catch (error) {
      console.error('Failed to fetch branding:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedBranding = await brandingAPI.update({
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        accent_color: accentColor,
        font_family: fontFamily,
      });
      setBranding(updatedBranding);
      alert('Branding saved successfully!');
    } catch (error) {
      console.error('Failed to save branding:', error);
      alert('Failed to save branding');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setPrimaryColor('#22c55e');
    setSecondaryColor('#16a34a');
    setAccentColor('#15803d');
    setFontFamily('Inter');
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setUploadingLogo(true);
    try {
      const response = await brandingAPI.uploadLogo(file);
      setLogoUrl(response.logo_url);
      alert('Logo uploaded successfully!');
    } catch (error) {
      console.error('Failed to upload logo:', error);
      alert('Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && fileInputRef.current) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInputRef.current.files = dataTransfer.files;
      handleFileSelect({ target: { files: dataTransfer.files } } as any);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  if (loading) {
    return <div className="text-center py-8">Loading branding data...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Brand Customization</h2>
      <p className="text-gray-600 mb-8">Upload your logo and set your brand colors</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Company Logo">
          <div className="space-y-4">
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-600 mb-2">
                Drag and drop your logo here, or click to browse
              </p>
              <p className="text-xs text-gray-500 mb-4">
                PNG, JPG or SVG (max. 2MB)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="logo-upload"
              />
              <label
                htmlFor="logo-upload"
                className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
              >
                {uploadingLogo ? 'Uploading...' : 'Choose File'}
              </label>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Current Logo</h4>
              <div className="bg-white p-4 rounded border border-gray-200 flex items-center justify-center h-32">
                {logoUrl ? (
                  <img 
                    src={`http://localhost:8000${logoUrl}`} 
                    alt="Company Logo" 
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <span className="text-gray-400">No logo uploaded</span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Font Family
              </label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="Inter">Inter</option>
                <option value="Roboto">Roboto</option>
                <option value="Open Sans">Open Sans</option>
                <option value="Lato">Lato</option>
                <option value="Montserrat">Montserrat</option>
                <option value="Poppins">Poppins</option>
                <option value="Arial">Arial</option>
                <option value="Georgia">Georgia</option>
              </select>
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
              <div className="space-y-2" style={{ fontFamily }}>
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
              <button 
                onClick={handleReset}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset to Defaults
              </button>
              <button 
                onClick={handleSave}
                disabled={saving}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Branding'}
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Branding;
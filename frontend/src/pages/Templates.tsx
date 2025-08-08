import { useState, useEffect } from 'react';
import Card from '../components/Card';
import { FileText, Download, Eye, Settings, Save } from 'lucide-react';
import { templateAPI, TemplateData } from '../services/api';

const Templates = () => {
  const [template, setTemplate] = useState<TemplateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  
  const [headerText, setHeaderText] = useState('Professional Roof Quote');
  const [footerText, setFooterText] = useState('Thank you for choosing us!');
  const [showWarranty, setShowWarranty] = useState(true);
  const [showFinancing, setShowFinancing] = useState(true);
  const [showTestimonials, setShowTestimonials] = useState(true);
  const [customMessage, setCustomMessage] = useState('');
  const [termsConditions, setTermsConditions] = useState('');

  useEffect(() => {
    fetchTemplate();
  }, []);

  useEffect(() => {
    fetchPreview();
  }, [headerText, footerText, showWarranty, showFinancing, showTestimonials, customMessage, termsConditions]);

  const fetchTemplate = async () => {
    try {
      const data = await templateAPI.get();
      setTemplate(data);
      setHeaderText(data.header_text);
      setFooterText(data.footer_text);
      setShowWarranty(data.show_warranty);
      setShowFinancing(data.show_financing);
      setShowTestimonials(data.show_testimonials);
      setCustomMessage(data.custom_message || '');
      setTermsConditions(data.terms_conditions || '');
    } catch (error) {
      console.error('Failed to fetch template:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPreview = async () => {
    try {
      const response = await templateAPI.preview();
      setPreviewHtml(response.preview_html);
    } catch (error) {
      console.error('Failed to fetch preview:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedTemplate = await templateAPI.update({
        header_text: headerText,
        footer_text: footerText,
        show_warranty: showWarranty,
        show_financing: showFinancing,
        show_testimonials: showTestimonials,
        custom_message: customMessage || undefined,
        terms_conditions: termsConditions || undefined,
      });
      setTemplate(updatedTemplate);
      alert('Template saved successfully!');
    } catch (error) {
      console.error('Failed to save template:', error);
      alert('Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading template data...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">PDF Template Configuration</h2>
      <p className="text-gray-600 mb-8">Customize your proposal template with live preview</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Template Settings">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Header Content
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                rows={3}
                placeholder="Enter header text for your proposals..."
                value={headerText}
                onChange={(e) => setHeaderText(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Footer Content
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                rows={3}
                placeholder="Enter footer text (e.g., terms, contact info)..."
                value={footerText}
                onChange={(e) => setFooterText(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Include Sections
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="mr-2 text-green-600" 
                    checked={showWarranty}
                    onChange={(e) => setShowWarranty(e.target.checked)}
                  />
                  <span className="text-sm">Warranty Information</span>
                </label>
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="mr-2 text-green-600" 
                    checked={showFinancing}
                    onChange={(e) => setShowFinancing(e.target.checked)}
                  />
                  <span className="text-sm">Financing Options</span>
                </label>
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="mr-2 text-green-600"
                    checked={showTestimonials}
                    onChange={(e) => setShowTestimonials(e.target.checked)}
                  />
                  <span className="text-sm">Customer Testimonials</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Message (Optional)
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                rows={3}
                placeholder="Add a custom message to your proposals..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Terms & Conditions
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                rows={4}
                placeholder="Enter your terms and conditions..."
                value={termsConditions}
                onChange={(e) => setTermsConditions(e.target.value)}
              />
            </div>

            <div className="flex space-x-3">
              <button 
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Template'}
              </button>
              <button className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center">
                <Download className="w-4 h-4 mr-2" />
                Export Template
              </button>
            </div>
          </div>
        </Card>

        <Card title="Live Preview">
          <div className="bg-gray-50 rounded-lg p-4 h-[600px] overflow-y-auto">
            <div className="bg-white shadow-sm rounded-lg p-6">
              <div className="border-b pb-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{headerText}</h3>
                    <p className="text-sm text-gray-600">Professional Roofing Services</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Quote #2024-001</p>
                    <p className="text-sm text-gray-600">Date: {new Date().toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">Property Information</h4>
                <p className="text-sm text-gray-600">123 Sample Street</p>
                <p className="text-sm text-gray-600">City, State 12345</p>
                <p className="text-sm text-gray-600 mt-2">Roof Size: 2,500 sq ft</p>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Pricing Options</h4>
                <div className="space-y-3">
                  <div className="border rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Good - 3-Tab Shingles</p>
                        <p className="text-sm text-gray-600">25-year warranty</p>
                      </div>
                      <p className="font-bold text-lg">$16,250</p>
                    </div>
                  </div>
                  <div className="border-2 border-green-500 rounded-lg p-3 bg-green-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Better - Architectural Shingles</p>
                        <p className="text-sm text-gray-600">30-year warranty</p>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Recommended</span>
                      </div>
                      <p className="font-bold text-lg">$21,875</p>
                    </div>
                  </div>
                  <div className="border rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Best - Designer Shingles</p>
                        <p className="text-sm text-gray-600">Lifetime warranty</p>
                      </div>
                      <p className="font-bold text-lg">$30,000</p>
                    </div>
                  </div>
                </div>
              </div>

              {showWarranty && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Warranty Information</h4>
                  <p className="text-sm text-gray-600">
                    Our comprehensive warranty covers materials and workmanship, giving you peace of mind for years to come.
                  </p>
                </div>
              )}

              {showFinancing && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Financing Options</h4>
                  <p className="text-sm text-gray-600">
                    Flexible payment plans available with competitive rates. Ask about our 0% interest options.
                  </p>
                </div>
              )}

              {showTestimonials && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Customer Testimonials</h4>
                  <p className="text-sm text-gray-600 italic">
                    "Excellent work and professional service. Highly recommended!" - Recent Customer
                  </p>
                </div>
              )}

              {customMessage && (
                <div className="mb-6 p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-700">{customMessage}</p>
                </div>
              )}

              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">Included Services</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Complete tear-off of existing roofing</li>
                  <li>• Installation of new underlayment</li>
                  <li>• New drip edge and flashing</li>
                  <li>• Ridge vent installation</li>
                  <li>• Full cleanup and debris removal</li>
                </ul>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-gray-700 mb-2">{footerText}</p>
                {termsConditions && (
                  <p className="text-xs text-gray-500">
                    {termsConditions}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  This quote is valid for 30 days.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-center">
            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center">
              <Eye className="w-4 h-4 mr-2" />
              Full Screen Preview
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Templates;
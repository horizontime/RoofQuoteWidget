import Card from '../components/Card';
import { FileText, Download, Eye, Settings } from 'lucide-react';

const Templates = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">PDF Template Configuration</h2>
      <p className="text-gray-600 mb-8">Customize your proposal template with live preview</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Template Settings">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template Style
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                <option>Professional</option>
                <option>Modern</option>
                <option>Classic</option>
                <option>Minimal</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Header Content
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                rows={3}
                placeholder="Enter header text for your proposals..."
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
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Include Sections
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2 text-green-600" defaultChecked />
                  <span className="text-sm">Company Information</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2 text-green-600" defaultChecked />
                  <span className="text-sm">Pricing Breakdown</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2 text-green-600" defaultChecked />
                  <span className="text-sm">Material Specifications</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2 text-green-600" defaultChecked />
                  <span className="text-sm">Warranty Information</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2 text-green-600" />
                  <span className="text-sm">Payment Terms</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2 text-green-600" />
                  <span className="text-sm">Before/After Photos</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Terms & Conditions
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                rows={4}
                placeholder="Enter your terms and conditions..."
              />
            </div>

            <div className="flex space-x-3">
              <button className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center">
                <Settings className="w-4 h-4 mr-2" />
                Save Template
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
                    <h3 className="text-xl font-bold text-gray-900">Your Company Name</h3>
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
                <p className="text-xs text-gray-500">
                  This quote is valid for 30 days. Terms and conditions apply.
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
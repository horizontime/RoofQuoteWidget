import Card from '../components/Card';
import { Code, Copy, ExternalLink, Settings } from 'lucide-react';
import { useState } from 'react';

const Widget = () => {
  const [copied, setCopied] = useState(false);
  
  const embedCode = `<!-- Roof Quote Pro Widget -->
<div id="roof-quote-widget"></div>
<script src="https://widget.roofquotepro.com/v1/widget.js"></script>
<script>
  RoofQuoteWidget.init({
    apiKey: 'your-api-key-here',
    primaryColor: '#10B981',
    position: 'bottom-right'
  });
</script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Widget Deployment</h2>
      <p className="text-gray-600 mb-8">Generate embed code for your website</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Embed Code">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Widget Position
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                <option>Bottom Right</option>
                <option>Bottom Left</option>
                <option>Top Right</option>
                <option>Top Left</option>
                <option>Inline</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Widget Style
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input type="radio" name="style" className="mr-2" defaultChecked />
                  <span className="text-sm">Floating Button</span>
                </label>
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input type="radio" name="style" className="mr-2" />
                  <span className="text-sm">Inline Form</span>
                </label>
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input type="radio" name="style" className="mr-2" />
                  <span className="text-sm">Modal Popup</span>
                </label>
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input type="radio" name="style" className="mr-2" />
                  <span className="text-sm">Side Panel</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 font-mono text-sm"
                  value="rqp_live_1234567890abcdef"
                  readOnly
                />
                <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Generated Embed Code
              </label>
              <div className="relative">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
                  <code>{embedCode}</code>
                </pre>
                <button
                  onClick={handleCopy}
                  className="absolute top-2 right-2 bg-gray-700 text-white px-3 py-1 rounded text-xs hover:bg-gray-600 transition-colors flex items-center"
                >
                  {copied ? (
                    <>Copied!</>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Installation Instructions</h4>
              <ol className="text-sm text-blue-800 space-y-1">
                <li>1. Copy the embed code above</li>
                <li>2. Paste it into your website's HTML, just before the closing &lt;/body&gt; tag</li>
                <li>3. Replace 'your-api-key-here' with your actual API key</li>
                <li>4. Save and publish your changes</li>
              </ol>
            </div>

            <div className="flex space-x-3">
              <button className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors">
                Generate New API Key
              </button>
              <button className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center">
                <Settings className="w-4 h-4 mr-2" />
                Advanced Settings
              </button>
            </div>
          </div>
        </Card>

        <Card title="Live Preview">
          <div className="bg-gray-50 rounded-lg p-4 h-[500px] relative">
            <div className="bg-white rounded-lg shadow-sm h-full flex items-center justify-center">
              <div className="text-center">
                <div className="mb-4">
                  <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
                    <Code className="w-8 h-8 text-white" />
                  </div>
                </div>
                <p className="text-gray-600 mb-2">Widget Preview</p>
                <p className="text-sm text-gray-500">Your widget will appear here</p>
              </div>
            </div>
            
            <div className="absolute bottom-8 right-8">
              <button className="bg-green-600 text-white px-4 py-3 rounded-full shadow-lg hover:bg-green-700 transition-colors flex items-center">
                <ExternalLink className="w-5 h-5 mr-2" />
                Get Instant Quote
              </button>
            </div>
          </div>

          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Widget Analytics</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600">Total Impressions</p>
                <p className="text-xl font-bold text-gray-900">2,847</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600">Interactions</p>
                <p className="text-xl font-bold text-gray-900">342</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600">Conversion Rate</p>
                <p className="text-xl font-bold text-gray-900">12%</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600">Avg. Load Time</p>
                <p className="text-xl font-bold text-gray-900">0.3s</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Widget;
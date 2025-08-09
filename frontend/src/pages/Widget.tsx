import Card from '../components/Card';
import { Code, Copy, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import WidgetFlow from './WidgetFlow';

const Widget = () => {
  const [copied, setCopied] = useState(false);
  
  const embedCode = `<!-- Roof Quote Pro Widget -->
<div id="roof-quote-widget"></div>
<script src="https://widget.roofquotepro.com/v1/widget.js"></script>
<script>
  RoofQuoteWidget.init({
    contractorId: 'your-contractor-id'
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
      <p className="text-gray-600 mb-8">Embed the instant quote widget on your website</p>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(400px,_1fr)_2fr] gap-6">
        <Card title="Embed Code">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                iFrame Embed Code
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
                <li>2. Paste it into your website's HTML where you want the widget to appear</li>
                <li>3. The widget will automatically load with your configured branding and pricing</li>
                <li>4. Save and publish your changes</li>
              </ol>
            </div>
            
            <div>
              <Link
                to="/widget-preview"
                target="_blank"
                className="w-full bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-5 h-5" />
                Open Widget in new tab
              </Link>
            </div>
          </div>
        </Card>

        <Card title="Live Preview">
          <div className="h-[600px] relative overflow-auto">
            <WidgetFlow embedded={true} />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Widget;
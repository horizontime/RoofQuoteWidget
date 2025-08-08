import Card from '../components/Card';
import { Check } from 'lucide-react';

const PricingSetup = () => {
  const pricingTiers = [
    {
      name: 'Good',
      description: '3-Tab Shingles',
      price: '$6.50',
      features: [
        '25-year warranty',
        'Basic color options',
        'Standard installation',
        'Basic underlayment'
      ],
      color: 'bg-gray-100'
    },
    {
      name: 'Better',
      description: 'Architectural Shingles',
      price: '$8.75',
      features: [
        '30-year warranty',
        'Premium color options',
        'Enhanced installation',
        'Synthetic underlayment',
        'Ridge venting included'
      ],
      color: 'bg-green-100',
      recommended: true
    },
    {
      name: 'Best',
      description: 'Designer Shingles',
      price: '$12.00',
      features: [
        'Lifetime warranty',
        'Designer color options',
        'Premium installation',
        'Ice & water shield',
        'Ridge venting included',
        'Starter strip included'
      ],
      color: 'bg-green-200'
    }
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Shingle Pricing Setup</h2>
      <p className="text-gray-600 mb-8">Configure your three-tier pricing structure</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {pricingTiers.map((tier, index) => (
          <Card key={index} className={`relative ${tier.recommended ? 'ring-2 ring-green-500' : ''}`}>
            {tier.recommended && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full">
                  Most Popular
                </span>
              </div>
            )}
            <div className={`-mx-6 -mt-6 px-6 py-4 mb-6 rounded-t-lg ${tier.color}`}>
              <h3 className="text-xl font-bold text-gray-900">{tier.name}</h3>
              <p className="text-sm text-gray-700">{tier.description}</p>
            </div>
            
            <div className="mb-6">
              <span className="text-3xl font-bold text-gray-900">{tier.price}</span>
              <span className="text-gray-600">/sq ft</span>
            </div>

            <div className="space-y-3 mb-6">
              {tier.features.map((feature, idx) => (
                <div key={idx} className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            <button className={`w-full py-2 rounded-lg transition-colors ${
              tier.recommended 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}>
              Edit Pricing
            </button>
          </Card>
        ))}
      </div>

      <Card>
        <h3 className="text-lg font-semibold mb-4">Additional Pricing Options</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tear-off Cost (per sq ft)
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="$1.50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Steep Slope Charge (%)
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="15%"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Job Size (sq ft)
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="1000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Waste Factor (%)
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="10%"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
            Save Pricing Configuration
          </button>
        </div>
      </Card>
    </div>
  );
};

export default PricingSetup;
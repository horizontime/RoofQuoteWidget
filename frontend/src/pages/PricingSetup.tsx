import { useState, useEffect } from 'react';
import Card from '../components/Card';
import { Check, Edit2, Save, X } from 'lucide-react';
import { pricingAPI, PricingData } from '../services/api';

const PricingSetup = () => {
  const [pricing, setPricing] = useState<PricingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingTier, setEditingTier] = useState<string | null>(null);
  const [editingAdditional, setEditingAdditional] = useState(false);
  const [tempValues, setTempValues] = useState<Partial<PricingData>>({});

  useEffect(() => {
    fetchPricing();
  }, []);

  const fetchPricing = async () => {
    try {
      const data = await pricingAPI.get();
      setPricing(data);
    } catch (error) {
      console.error('Failed to fetch pricing:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (tier: string) => {
    setEditingTier(tier);
    if (pricing) {
      if (tier === 'good') {
        setTempValues({
          good_tier_price: pricing.good_tier_price,
          good_tier_name: pricing.good_tier_name,
          good_tier_warranty: pricing.good_tier_warranty,
        });
      } else if (tier === 'better') {
        setTempValues({
          better_tier_price: pricing.better_tier_price,
          better_tier_name: pricing.better_tier_name,
          better_tier_warranty: pricing.better_tier_warranty,
        });
      } else if (tier === 'best') {
        setTempValues({
          best_tier_price: pricing.best_tier_price,
          best_tier_name: pricing.best_tier_name,
          best_tier_warranty: pricing.best_tier_warranty,
        });
      }
    }
  };

  const handleSave = async (tier: string) => {
    try {
      const updatedPricing = await pricingAPI.update(tempValues);
      setPricing(updatedPricing);
      setEditingTier(null);
      setTempValues({});
    } catch (error) {
      console.error('Failed to save pricing:', error);
    }
  };

  const handleCancel = () => {
    setEditingTier(null);
    setTempValues({});
  };

  const handleAdditionalEdit = () => {
    setEditingAdditional(true);
    if (pricing) {
      setTempValues({
        removal_price: pricing.removal_price,
        permit_price: pricing.permit_price,
      });
    }
  };

  const handleAdditionalSave = async () => {
    try {
      const updatedPricing = await pricingAPI.update(tempValues);
      setPricing(updatedPricing);
      setEditingAdditional(false);
      setTempValues({});
    } catch (error) {
      console.error('Failed to save additional pricing:', error);
    }
  };

  const handleAdditionalCancel = () => {
    setEditingAdditional(false);
    setTempValues({});
  };

  if (loading) {
    return <div className="text-center py-8">Loading pricing data...</div>;
  }

  if (!pricing) {
    return <div className="text-center py-8">Failed to load pricing data</div>;
  }

  const pricingTiers = [
    {
      key: 'good',
      name: 'Good',
      description: pricing.good_tier_name,
      price: pricing.good_tier_price,
      warranty: pricing.good_tier_warranty,
      features: [
        `${pricing.good_tier_warranty} warranty`,
        'Basic color options',
        'Standard installation',
        'Basic underlayment'
      ],
      color: 'bg-gray-100'
    },
    {
      key: 'better',
      name: 'Better',
      description: pricing.better_tier_name,
      price: pricing.better_tier_price,
      warranty: pricing.better_tier_warranty,
      features: [
        `${pricing.better_tier_warranty} warranty`,
        'Premium color options',
        'Enhanced installation',
        'Synthetic underlayment',
        'Ridge venting included'
      ],
      color: 'bg-green-100',
      recommended: true
    },
    {
      key: 'best',
      name: 'Best',
      description: pricing.best_tier_name,
      price: pricing.best_tier_price,
      warranty: pricing.best_tier_warranty,
      features: [
        `${pricing.best_tier_warranty} warranty`,
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
        {pricingTiers.map((tier) => (
          <Card key={tier.key} className={`relative ${tier.recommended ? 'ring-2 ring-green-500' : ''}`}>
            {tier.recommended && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full">
                  Most Popular
                </span>
              </div>
            )}
            
            {editingTier === tier.key ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Shingle Type</label>
                  <input
                    type="text"
                    value={tempValues[`${tier.key}_tier_name` as keyof PricingData] || ''}
                    onChange={(e) => setTempValues({...tempValues, [`${tier.key}_tier_name`]: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price per sq ft</label>
                  <input
                    type="number"
                    step="0.01"
                    value={tempValues[`${tier.key}_tier_price` as keyof PricingData] || ''}
                    onChange={(e) => setTempValues({...tempValues, [`${tier.key}_tier_price`]: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Warranty</label>
                  <input
                    type="text"
                    value={tempValues[`${tier.key}_tier_warranty` as keyof PricingData] || ''}
                    onChange={(e) => setTempValues({...tempValues, [`${tier.key}_tier_warranty`]: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSave(tier.key)}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className={`-mx-6 -mt-6 px-6 py-4 mb-6 rounded-t-lg ${tier.color}`}>
                  <h3 className="text-xl font-bold text-gray-900">{tier.name}</h3>
                  <p className="text-sm text-gray-700">{tier.description}</p>
                </div>
                
                <div className="mb-6">
                  <span className="text-3xl font-bold text-gray-900">${tier.price.toFixed(2)}</span>
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

                <button 
                  onClick={() => handleEdit(tier.key)}
                  className={`w-full py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                    tier.recommended 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Pricing
                </button>
              </>
            )}
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Additional Pricing Options</h3>
          {!editingAdditional && (
            <button
              onClick={handleAdditionalEdit}
              className="text-green-600 hover:text-green-700 flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </button>
          )}
        </div>
        
        {editingAdditional ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tear-off Cost (per sq ft)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={tempValues.removal_price || ''}
                  onChange={(e) => setTempValues({...tempValues, removal_price: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permit Cost (flat fee)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={tempValues.permit_price || ''}
                  onChange={(e) => setTempValues({...tempValues, permit_price: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={handleAdditionalSave}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
              <button
                onClick={handleAdditionalCancel}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tear-off Cost (per sq ft)
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                ${pricing.removal_price.toFixed(2)}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Permit Cost (flat fee)
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                ${pricing.permit_price.toFixed(2)}
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default PricingSetup;
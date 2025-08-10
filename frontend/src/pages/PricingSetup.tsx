import { useState, useEffect } from 'react';
import Card from '../components/Card';
import { Check, Edit2, Save, X, Plus, Trash2 } from 'lucide-react';
import { pricingAPI } from '../services/api';
import type { PricingData } from '../services/api';

const PricingSetup = () => {
  const [pricing, setPricing] = useState<PricingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingTier, setEditingTier] = useState<string | null>(null);
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
          good_tier_features: pricing.good_tier_features || [],
        });
      } else if (tier === 'better') {
        setTempValues({
          better_tier_price: pricing.better_tier_price,
          better_tier_name: pricing.better_tier_name,
          better_tier_warranty: pricing.better_tier_warranty,
          better_tier_features: pricing.better_tier_features || [],
        });
      } else if (tier === 'best') {
        setTempValues({
          best_tier_price: pricing.best_tier_price,
          best_tier_name: pricing.best_tier_name,
          best_tier_warranty: pricing.best_tier_warranty,
          best_tier_features: pricing.best_tier_features || [],
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

  const handleFeatureAdd = (tier: string) => {
    const featuresKey = `${tier}_tier_features` as keyof PricingData;
    const currentFeatures = (tempValues[featuresKey] as string[]) || [];
    setTempValues({
      ...tempValues,
      [featuresKey]: [...currentFeatures, '']
    });
  };

  const handleFeatureChange = (tier: string, index: number, value: string) => {
    const featuresKey = `${tier}_tier_features` as keyof PricingData;
    const currentFeatures = [...((tempValues[featuresKey] as string[]) || [])];
    currentFeatures[index] = value;
    setTempValues({
      ...tempValues,
      [featuresKey]: currentFeatures
    });
  };

  const handleFeatureRemove = (tier: string, index: number) => {
    const featuresKey = `${tier}_tier_features` as keyof PricingData;
    const currentFeatures = [...((tempValues[featuresKey] as string[]) || [])];
    currentFeatures.splice(index, 1);
    setTempValues({
      ...tempValues,
      [featuresKey]: currentFeatures
    });
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
      features: pricing.good_tier_features || [
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
      features: pricing.better_tier_features || [
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
      features: pricing.best_tier_features || [
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
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">Features</label>
                    <button
                      type="button"
                      onClick={() => handleFeatureAdd(tier.key)}
                      className="text-green-600 hover:text-green-700 flex items-center gap-1 text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add Feature
                    </button>
                  </div>
                  <div className="space-y-2">
                    {((tempValues[`${tier.key}_tier_features` as keyof PricingData] as string[]) || []).map((feature, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) => handleFeatureChange(tier.key, idx, e.target.value)}
                          placeholder="Enter feature description"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleFeatureRemove(tier.key, idx)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
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
                
                <div className="mb-4">
                  <span className="text-3xl font-bold text-gray-900">${tier.price.toFixed(2)}</span>
                  <span className="text-gray-600">/sq ft</span>
                  <p className="text-sm text-gray-600 mt-2">{tier.warranty} warranty</p>
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
    </div>
  );
};

export default PricingSetup;
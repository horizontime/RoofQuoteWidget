import { useState, useEffect } from 'react';
import { 
  MapPin, 
  ChevronRight, 
  ArrowLeft, 
  Check, 
  Mail, 
  Calendar, 
  ClipboardCheck,
  Phone,
  Building2
} from 'lucide-react';

const WidgetFlow = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [companyName, setCompanyName] = useState('Professional Roofing Services');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState('#22c55e');
  const [secondaryColor, setSecondaryColor] = useState('#16a34a');
  const [accentColor, setAccentColor] = useState('#15803d');
  
  // Form data
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [selectedTier, setSelectedTier] = useState('better');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bestTimeToCall, setBestTimeToCall] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  
  // Mock pricing data
  const pricingTiers = {
    good: {
      name: '3-Tab Shingles',
      price: 6.50,
      warranty: '25-year',
      description: 'GAF Timberline NS'
    },
    better: {
      name: 'Architectural Shingles',
      price: 8.75,
      warranty: '30-year',
      description: 'GAF Timberline HDZ'
    },
    best: {
      name: 'Designer Shingles',
      price: 12.00,
      warranty: 'Lifetime',
      description: 'GAF Timberline UHDZ'
    }
  };
  
  // Mock roof area (in square feet)
  const roofArea = 1800;

  useEffect(() => {
    // Load branding from localStorage
    const savedCompanyName = localStorage.getItem('companyName');
    if (savedCompanyName) {
      setCompanyName(savedCompanyName);
    }
    
    // Load branding colors (mock - in real app would come from API)
    const savedBranding = localStorage.getItem('branding');
    if (savedBranding) {
      try {
        const branding = JSON.parse(savedBranding);
        if (branding.primaryColor) setPrimaryColor(branding.primaryColor);
        if (branding.secondaryColor) setSecondaryColor(branding.secondaryColor);
        if (branding.accentColor) setAccentColor(branding.accentColor);
        if (branding.logoUrl) setLogoUrl(branding.logoUrl);
      } catch (e) {
        console.error('Error loading branding:', e);
      }
    }
  }, []);

  const handleNextPage = () => {
    if (currentPage < 5) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const calculatePrice = (tier: string) => {
    const tierData = pricingTiers[tier as keyof typeof pricingTiers];
    return Math.round(roofArea * tierData.price);
  };

  const renderHeader = () => (
    <>
      <div className="flex items-center justify-center mb-6">
        {logoUrl ? (
          <img src={logoUrl} alt={companyName} className="w-16 h-16 object-contain mr-4" />
        ) : (
          <div 
            className="w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold text-xl mr-4"
            style={{ backgroundColor: primaryColor }}
          >
            <Building2 className="w-8 h-8" />
          </div>
        )}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{companyName}</h2>
          <p className="text-gray-600">Get Your Instant Roof Quote</p>
        </div>
      </div>
      
      <div className="text-center mb-8">
        <p className="text-lg text-gray-800 mb-2">Get an instant estimate in under 60 seconds</p>
        <p className="text-sm text-gray-600">No sales calls • No pressure • 100% Free</p>
      </div>
    </>
  );

  const renderPage1 = () => (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {renderHeader()}
      
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mr-3"
            style={{ backgroundColor: primaryColor }}
          >
            1
          </div>
          <h3 className="text-xl font-semibold">Enter Your Address</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
            <input
              type="text"
              value={streetAddress}
              onChange={(e) => setStreetAddress(e.target.value)}
              placeholder="e.g. 123 Main Street"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Denver"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
              <input
                type="text"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                placeholder="80202"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>
      </div>
      
      <button
        onClick={handleNextPage}
        className="w-full py-3 rounded-lg text-white font-medium flex items-center justify-center gap-2 transition-colors"
        style={{ backgroundColor: primaryColor }}
      >
        Continue to Map Verification
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );

  const renderPage2 = () => (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {renderHeader()}
      
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mr-3"
              style={{ backgroundColor: primaryColor }}
            >
              2
            </div>
            <h3 className="text-xl font-semibold">Confirm Your Property</h3>
          </div>
          <button
            onClick={handlePreviousPage}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
        
        <div className="bg-gray-200 h-64 rounded-lg mb-4 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Satellite view of property</p>
            <p className="text-sm text-gray-400">(Map integration not implemented)</p>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <p className="font-medium text-gray-700">
            {streetAddress || '123 Main Street'}, {city || 'Denver'}, {zipCode || '80202'}
          </p>
        </div>
      </div>
      
      <button
        onClick={handleNextPage}
        className="w-full py-3 rounded-lg text-white font-medium flex items-center justify-center gap-2 mb-3 transition-colors"
        style={{ backgroundColor: primaryColor }}
      >
        <Check className="w-5 h-5" />
        Yes, This Is My Property
      </button>
      
      <button
        className="w-full py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
      >
        Adjust Polygon
      </button>
    </div>
  );

  const renderPage3 = () => (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {renderHeader()}
      
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mr-3"
              style={{ backgroundColor: primaryColor }}
            >
              3
            </div>
            <h3 className="text-xl font-semibold">Your Instant Estimate</h3>
          </div>
          <button
            onClick={handlePreviousPage}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <p className="text-sm text-gray-600">Roof Area:</p>
          <p className="text-2xl font-bold text-gray-900">~{roofArea} sq ft</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {Object.entries(pricingTiers).map(([key, tier]) => (
            <div
              key={key}
              onClick={() => setSelectedTier(key)}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                selectedTier === key
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {key === 'better' && (
                <span 
                  className="inline-block px-2 py-1 text-xs font-semibold text-white rounded-full mb-2"
                  style={{ backgroundColor: primaryColor }}
                >
                  Most Popular
                </span>
              )}
              <h4 className="font-bold text-lg capitalize mb-1">{key}</h4>
              <p className="text-sm text-gray-600 mb-2">{tier.description}</p>
              <p className="text-2xl font-bold text-gray-900">
                ${calculatePrice(key).toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">${tier.price.toFixed(2)}/sq ft</p>
              <p className="text-sm text-gray-600 mt-2">{tier.warranty} warranty</p>
            </div>
          ))}
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-gray-900 mb-2">About Your Estimate</h4>
          <ul className="space-y-1 text-sm text-gray-700">
            <li>• Includes materials, labor, and cleanup</li>
            <li>• Final price may vary after in-person assessment</li>
            <li>• All estimates include manufacturer warranties</li>
          </ul>
        </div>
      </div>
      
      <button
        onClick={handleNextPage}
        className="w-full py-3 rounded-lg text-white font-medium transition-colors"
        style={{ backgroundColor: primaryColor }}
      >
        Get My Detailed Proposal
      </button>
    </div>
  );

  const renderPage4 = () => (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {renderHeader()}
      
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mr-3"
              style={{ backgroundColor: primaryColor }}
            >
              4
            </div>
            <h3 className="text-xl font-semibold">Almost Done!</h3>
          </div>
          <button
            onClick={handlePreviousPage}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
        
        <p className="text-gray-600 mb-4">
          Get your detailed PDF proposal and schedule your free consultation
        </p>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Best Time to Call (Optional)
            </label>
            <select
              value={bestTimeToCall}
              onChange={(e) => setBestTimeToCall(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select preferred time</option>
              <option value="morning">Morning (8am - 12pm)</option>
              <option value="afternoon">Afternoon (12pm - 5pm)</option>
              <option value="evening">Evening (5pm - 8pm)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              rows={3}
              placeholder="Any specific concerns or questions about your roof?"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 my-6">
          <h5 className="font-semibold text-gray-900 mb-2">Your Privacy is Protected</h5>
          <p className="text-sm text-gray-700">
            We never sell your information and only use it to provide your roofing estimate and consultation.
          </p>
        </div>
      </div>
      
      <button
        onClick={handleNextPage}
        className="w-full py-3 rounded-lg text-white font-medium transition-colors"
        style={{ backgroundColor: primaryColor }}
      >
        Get My Free Proposal
      </button>
    </div>
  );

  const renderPage5 = () => (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {renderHeader()}
      
      <div className="text-center mb-8">
        <div 
          className="w-20 h-20 rounded-full flex items-center justify-center text-white mx-auto mb-4"
          style={{ backgroundColor: primaryColor }}
        >
          <Check className="w-10 h-10" />
        </div>
        
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
        <p className="text-lg text-gray-600">Your detailed proposal is on its way.</p>
      </div>
      
      <div className="bg-green-50 rounded-lg p-6 mb-8">
        <div className="space-y-3">
          <div className="flex items-center">
            <Mail className="w-5 h-5 text-green-600 mr-3" />
            <span className="text-gray-700">PDF proposal sent to your email</span>
          </div>
          <div className="flex items-center">
            <Calendar className="w-5 h-5 text-green-600 mr-3" />
            <span className="text-gray-700">We'll call within 1 business day</span>
          </div>
          <div className="flex items-center">
            <ClipboardCheck className="w-5 h-5 text-green-600 mr-3" />
            <span className="text-gray-700">Your information has been saved securely</span>
          </div>
        </div>
      </div>
      
      <div className="text-center">
        <p className="text-gray-700 mb-4">Questions? Call us now:</p>
        <a
          href="tel:2813308004"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium transition-colors"
          style={{ backgroundColor: primaryColor }}
        >
          <Phone className="w-5 h-5" />
          (281) 330-8004
        </a>
      </div>
    </div>
  );

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 1:
        return renderPage1();
      case 2:
        return renderPage2();
      case 3:
        return renderPage3();
      case 4:
        return renderPage4();
      case 5:
        return renderPage5();
      default:
        return renderPage1();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      {renderCurrentPage()}
    </div>
  );
};

export default WidgetFlow;
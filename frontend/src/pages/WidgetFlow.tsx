import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MapPin, 
  ChevronRight, 
  ArrowLeft, 
  Check, 
  Mail, 
  Calendar, 
  ClipboardCheck,
  Phone,
  Building2,
  Download
} from 'lucide-react';
import { pricingAPI } from '../services/api';
import type { PricingData, Lead } from '../services/api';
import { loadGoogleMaps, createMap, createPolygon, calculatePolygonArea, metersToSquareFeet, geocodeAddress, convertPolygonPointsToGoogleMaps } from '../services/mapService';
import { OverpassService } from '../services/overpassService';
import type { BuildingFootprint } from '../services/overpassService';
import { usePolygonEditor } from '../hooks/usePolygonEditor';
import { generateLeadQuotePDF } from '../utils/leadQuotePdf';

interface WidgetFlowProps {
  embedded?: boolean;
}

const WidgetFlow = ({ embedded = false }: WidgetFlowProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [companyName, setCompanyName] = useState('Professional Roofing Services');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState('#22c55e');
  const [secondaryColor, setSecondaryColor] = useState('#16a34a');
  const [accentColor, setAccentColor] = useState('#15803d');
  const [showAdjustButtons, setShowAdjustButtons] = useState(false);
  
  // Map and polygon state
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [building, setBuilding] = useState<BuildingFootprint | null>(null);
  const [polygonPath, setPolygonPath] = useState<google.maps.LatLngLiteral[]>([]);
  const [isLoadingMap, setIsLoadingMap] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [calculatedArea, setCalculatedArea] = useState<number>(1800); // Default area
  
  // Helper function to darken color for hover effect
  const darkenColor = (color: string, amount: number = 20) => {
    const hex = color.replace('#', '');
    const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - amount);
    const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - amount);
    const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - amount);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };
  
  // Helper function to validate email
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  const [pricingData, setPricingData] = useState<PricingData | null>(null);
  const [loadingPricing, setLoadingPricing] = useState(true);
  
  // Form data
  const [streetAddress, setStreetAddress] = useState('');
  const [selectedTier, setSelectedTier] = useState('better');
  const [addressSuggestions, setAddressSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [autocompleteService, setAutocompleteService] = useState<google.maps.places.AutocompleteService | null>(null);
  const [placesService, setPlacesService] = useState<google.maps.places.PlacesService | null>(null);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // Format phone number as (xxx) xxx-xxxx
  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const phoneNumber = value.replace(/\D/g, '');
    
    // Format based on length
    if (phoneNumber.length === 0) {
      return '';
    } else if (phoneNumber.length <= 3) {
      return `(${phoneNumber}`;
    } else if (phoneNumber.length <= 6) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    } else if (phoneNumber.length <= 10) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6)}`;
    } else {
      // Don't allow more than 10 digits
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
    }
  };
  
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };
  const [bestTimeToCall, setBestTimeToCall] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [selectedPitch, setSelectedPitch] = useState<'flat' | 'shallow' | 'medium' | 'steep'>('medium');
  
  // Roof pitch multipliers
  const pitchMultipliers = {
    flat: 1.0,
    shallow: 1.15,
    medium: 1.3,
    steep: 1.5
  };
  
  // Use calculated area from polygon or default
  const roofArea = calculatedArea;

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
    
    // Load pricing from database
    fetchPricing();
    
    // Initialize Google Places Autocomplete Service
    initializeAutocomplete();
  }, []);
  
  const initializeAutocomplete = async () => {
    try {
      await loadGoogleMaps();
      const service = new google.maps.places.AutocompleteService();
      setAutocompleteService(service);
      
      // Create a dummy div for PlacesService (required by the API)
      const dummyDiv = document.createElement('div');
      const placesServiceInstance = new google.maps.places.PlacesService(dummyDiv);
      setPlacesService(placesServiceInstance);
    } catch (error) {
      console.error('Failed to initialize autocomplete:', error);
    }
  };
  
  const fetchPricing = async () => {
    try {
      const data = await pricingAPI.get();
      setPricingData(data);
    } catch (error) {
      console.error('Failed to fetch pricing:', error);
    } finally {
      setLoadingPricing(false);
    }
  };

  const getTierData = () => {
    if (!pricingData) return {};
    
    return {
      good: {
        name: pricingData.good_tier_name,
        price: pricingData.good_tier_price,
        warranty: pricingData.good_tier_warranty,
        features: pricingData.good_tier_features
      },
      better: {
        name: pricingData.better_tier_name,
        price: pricingData.better_tier_price,
        warranty: pricingData.better_tier_warranty,
        features: pricingData.better_tier_features
      },
      best: {
        name: pricingData.best_tier_name,
        price: pricingData.best_tier_price,
        warranty: pricingData.best_tier_warranty,
        features: pricingData.best_tier_features
      }
    };
  };

  const handleNextPage = async () => {
    if (currentPage === 1) {
      // When moving from page 1 to page 2, geocode address and fetch building
      await handleAddressSubmit();
    }
    if (currentPage < 5) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const handleDownloadProposal = () => {
    // Create a lead-like object with the user's information
    const tierData: any = getTierData();
    const selectedTierData = tierData[selectedTier];
    const totalPrice = selectedTierData ? Math.round(roofArea * selectedTierData.price * pitchMultipliers[selectedPitch]) : 0;
    
    const leadData: Lead = {
      id: Date.now(), // Generate a temporary ID
      name: `${firstName} ${lastName}`.trim() || 'Customer',
      email: email || 'customer@email.com',
      phone: phoneNumber || '',
      address: streetAddress || '123 Main Street',
      status: 'new',
      source: 'widget',
      contractor_id: 1,
      created_at: new Date().toISOString(),
      latest_quote: {
        id: Date.now(),
        total_price: totalPrice,
        selected_tier: selectedTier,
        roof_size_sqft: Math.round(roofArea),
        price_per_sqft: selectedTierData?.price || 8.75,
        created_at: new Date().toISOString()
      }
    };
    
    // Generate and download the PDF
    const pdf = generateLeadQuotePDF(leadData);
    const fileName = `roof-quote-${firstName.toLowerCase() || 'customer'}-${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
  };
  
  const handleAddressInput = useCallback(async (value: string) => {
    setStreetAddress(value);
    setHighlightedIndex(-1); // Reset highlighted index when input changes
    
    if (!autocompleteService || value.length < 3) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    
    try {
      const request = {
        input: value,
        componentRestrictions: { country: 'us' },
        types: ['address']
      };
      
      autocompleteService.getPlacePredictions(request, (predictions, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
          setAddressSuggestions(predictions);
          setShowSuggestions(true);
        } else {
          setAddressSuggestions([]);
          setShowSuggestions(false);
        }
      });
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  }, [autocompleteService]);
  
  const handleSelectSuggestion = (placeId: string, description: string) => {
    setStreetAddress(description);
    setShowSuggestions(false);
    setAddressSuggestions([]);
    setHighlightedIndex(-1);
  };
  
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || addressSuggestions.length === 0) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < addressSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < addressSuggestions.length) {
          const suggestion = addressSuggestions[highlightedIndex];
          handleSelectSuggestion(suggestion.place_id, suggestion.description);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setHighlightedIndex(-1);
        break;
    }
  }, [showSuggestions, addressSuggestions, highlightedIndex]);
  
  const handleAddressSubmit = async () => {
    setIsLoadingMap(true);
    setMapError(null);
    
    try {
      // Geocode the address
      const geocodeResult = await geocodeAddress(streetAddress);
      
      if (!geocodeResult || !geocodeResult.geometry) {
        throw new Error('Could not find location for this address');
      }
      
      const lat = geocodeResult.geometry.location.lat();
      const lng = geocodeResult.geometry.location.lng();
      
      // Fetch building polygon from Overpass API
      const buildingData = await OverpassService.getClosestBuilding(lat, lng, 50);
      
      if (buildingData) {
        setBuilding(buildingData);
        const path = convertPolygonPointsToGoogleMaps(buildingData.polygon);
        setPolygonPath(path);
        setCalculatedArea(buildingData.area_sqft);
      } else {
        // If no building found, use a default polygon around the location
        const defaultPolygon = [
          { lat: lat + 0.0001, lng: lng - 0.0001 },
          { lat: lat + 0.0001, lng: lng + 0.0001 },
          { lat: lat - 0.0001, lng: lng + 0.0001 },
          { lat: lat - 0.0001, lng: lng - 0.0001 },
          { lat: lat + 0.0001, lng: lng - 0.0001 }
        ];
        setPolygonPath(defaultPolygon);
        setCalculatedArea(1800); // Default area
      }
    } catch (error) {
      console.error('Error processing address:', error);
      setMapError(error instanceof Error ? error.message : 'Failed to process address');
    } finally {
      setIsLoadingMap(false);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const calculatePrice = (tier: string) => {
    if (!pricingData) return 0;
    
    let pricePerSqFt = 0;
    if (tier === 'good') {
      pricePerSqFt = pricingData.good_tier_price;
    } else if (tier === 'better') {
      pricePerSqFt = pricingData.better_tier_price;
    } else if (tier === 'best') {
      pricePerSqFt = pricingData.best_tier_price;
    }
    
    // Apply pitch multiplier to the price
    const multiplier = pitchMultipliers[selectedPitch];
    return Math.round(roofArea * pricePerSqFt * multiplier);
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
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <input
              ref={addressInputRef}
              type="text"
              value={streetAddress}
              onChange={(e) => handleAddressInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => streetAddress.length >= 3 && addressSuggestions.length > 0 && setShowSuggestions(true)}
              placeholder="Start typing your address..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              autoComplete="off"
            />
            
            {showSuggestions && addressSuggestions.length > 0 && (
              <div className="address-suggestions-dropdown absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                {addressSuggestions.map((suggestion, index) => (
                  <button
                    key={suggestion.place_id}
                    type="button"
                    onClick={() => handleSelectSuggestion(suggestion.place_id, suggestion.description)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`w-full px-4 py-3 text-left border-b border-gray-100 last:border-b-0 transition-colors duration-150 ${
                      index === highlightedIndex ? 'bg-gray-100' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {suggestion.structured_formatting.main_text}
                        </div>
                        <div className="text-xs text-gray-500">
                          {suggestion.structured_formatting.secondary_text}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <button
        onClick={handleNextPage}
        disabled={!streetAddress || streetAddress.length < 10}
        className="w-full py-3 rounded-lg text-white font-medium flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
        style={{ 
          backgroundColor: (!streetAddress || streetAddress.length < 10) ? '#9ca3af' : primaryColor 
        }}
        onMouseEnter={(e) => {
          if (streetAddress && streetAddress.length >= 10) {
            e.currentTarget.style.backgroundColor = darkenColor(primaryColor);
          }
        }}
        onMouseLeave={(e) => {
          if (streetAddress && streetAddress.length >= 10) {
            e.currentTarget.style.backgroundColor = primaryColor;
          }
        }}
      >
        Continue to Map Verification
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );

  // Initialize map when on page 2
  useEffect(() => {
    if (currentPage === 2 && mapRef.current && !map && polygonPath.length > 0) {
      initializeMap();
    }
  }, [currentPage, polygonPath]);
  
  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const suggestionsDropdown = document.querySelector('.address-suggestions-dropdown');
      
      if (addressInputRef.current && 
          !addressInputRef.current.contains(target) &&
          (!suggestionsDropdown || !suggestionsDropdown.contains(target))) {
        setShowSuggestions(false);
        setHighlightedIndex(-1);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0) {
      const dropdown = document.querySelector('.address-suggestions-dropdown');
      const highlightedButton = dropdown?.querySelectorAll('button')[highlightedIndex];
      highlightedButton?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [highlightedIndex]);
  
  const initializeMap = async () => {
    if (!mapRef.current) return;
    
    try {
      await loadGoogleMaps();
      
      // Calculate center from polygon
      const center = polygonPath.reduce(
        (acc, point) => ({
          lat: acc.lat + point.lat / polygonPath.length,
          lng: acc.lng + point.lng / polygonPath.length
        }),
        { lat: 0, lng: 0 }
      );
      
      const mapInstance = await createMap(mapRef.current, {
        center,
        zoom: 20,
        mapTypeId: 'satellite',
        streetViewControl: false,
        mapTypeControl: true,
        mapTypeControlOptions: {
          mapTypeIds: ['satellite', 'hybrid', 'roadmap']
        },
        tilt: 0,
        fullscreenControl: false,
        zoomControl: true
      });
      
      setMap(mapInstance);
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError('Failed to load map');
    }
  };
  
  // Polygon editor hook
  const {
    polygon,
    startEditing,
    saveChanges,
    resetChanges,
    cancelChanges
  } = usePolygonEditor({
    map,
    initialPath: polygonPath,
    onAreaChange: (areaSqFt) => setCalculatedArea(areaSqFt)
  });
  
  const handleAdjustPolygon = () => {
    setShowAdjustButtons(true);
    startEditing();
  };
  
  const handleSaveChanges = () => {
    saveChanges();
    setShowAdjustButtons(false);
  };
  
  const handleReset = () => {
    resetChanges();
  };
  
  const handleCancel = () => {
    cancelChanges();
    setShowAdjustButtons(false);
  };

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
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>
          
          <div className="relative">
            <div 
              ref={mapRef} 
              className="h-64 rounded-lg mb-4 bg-gray-200"
            >
              {isLoadingMap && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200 rounded-lg">
                  <div className="text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p className="text-gray-600">Loading satellite view...</p>
                  </div>
                </div>
              )}
              {mapError && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200 rounded-lg">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-red-500">{mapError}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <p className="font-medium text-gray-700">
              {streetAddress}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Estimated Roof Area: ~{Math.round(calculatedArea).toLocaleString()} sq ft
            </p>
          </div>
          
          {/* Roof Pitch Selection */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">ROOF PITCH</h4>
            <div className="grid grid-cols-4 gap-2">
              {(['flat', 'shallow', 'medium', 'steep'] as const).map((pitch) => (
                <button
                  key={pitch}
                  onClick={() => setSelectedPitch(pitch)}
                  className={`
                    py-2 px-3 rounded-lg border-2 font-medium capitalize transition-all duration-200
                    ${selectedPitch === pitch 
                      ? 'text-white border-transparent' 
                      : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                    }
                  `}
                  style={{
                    backgroundColor: selectedPitch === pitch ? primaryColor : undefined,
                    borderColor: selectedPitch === pitch ? primaryColor : undefined
                  }}
                >
                  {pitch}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <button
          onClick={handleNextPage}
          className="w-full py-3 rounded-lg text-white font-medium flex items-center justify-center gap-2 mb-3 transition-all duration-200 hover:shadow-lg"
          style={{ backgroundColor: primaryColor }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = darkenColor(primaryColor)}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = primaryColor}
        >
          <Check className="w-5 h-5" />
          Yes, This Is My Property
        </button>
        
        {!showAdjustButtons ? (
          <button
            onClick={handleAdjustPolygon}
            className="w-full py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 hover:shadow-md transition-all duration-200"
          >
            Adjust Polygon
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={handleSaveChanges}
              className="flex-1 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 hover:shadow-md transition-all duration-200"
            >
              Save Changes
            </button>
            <button
              onClick={handleReset}
              className="flex-1 py-3 rounded-lg bg-orange-500 text-white font-medium hover:bg-orange-600 hover:shadow-md transition-all duration-200"
            >
              Reset
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 py-3 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 hover:shadow-md transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
  );

  const renderPage3 = () => {
    if (loadingPricing || !pricingData) {
      return (
        <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg">
          {renderHeader()}
          <div className="text-center py-8">
            <p className="text-gray-600">Loading pricing information...</p>
          </div>
        </div>
      );
    }
    
    const tierData = getTierData();
    
    return (
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Roof Area:</p>
                <p className="text-2xl font-bold text-gray-900">~{Math.round(roofArea).toLocaleString()} sq ft</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Roof Pitch:</p>
                <p className="text-2xl font-bold text-gray-900 capitalize">{selectedPitch}</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {Object.entries(tierData).map(([key, tier]) => (
              <div
                key={key}
                onClick={() => setSelectedTier(key)}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  selectedTier === key
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-lg capitalize">{key}</h4>
                  {key === 'better' && (
                    <span 
                      className="px-2 py-1 text-xs font-semibold text-white rounded-full"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Most Popular
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold text-gray-700 mb-1">{tier.name}</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${calculatePrice(key).toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 mb-2">
                  ${(tier.price * pitchMultipliers[selectedPitch]).toFixed(2)}/sq ft
                </p>
                <p className="text-sm text-gray-600 mb-2">{tier.warranty} warranty</p>
                <div className="border-t pt-2 mt-2">
                  <ul className="space-y-1">
                    {(tier.features || []).slice(0, 3).map((feature, idx) => (
                      <li key={idx} className="text-xs text-gray-600 flex items-start">
                        <Check className="w-3 h-3 text-green-500 mr-1 mt-0.5 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
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
          className="w-full py-3 rounded-lg text-white font-medium transition-all duration-200 hover:shadow-lg"
          style={{ backgroundColor: primaryColor }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = darkenColor(primaryColor)}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = primaryColor}
        >
          Get My Detailed Proposal
        </button>
      </div>
    );
  };

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
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={handlePhoneChange}
              placeholder="(555) 123-4567"
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
        disabled={!firstName || !lastName || !email || !isValidEmail(email)}
        className="w-full py-3 rounded-lg text-white font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
        style={{ 
          backgroundColor: (!firstName || !lastName || !email || !isValidEmail(email)) ? '#9ca3af' : primaryColor 
        }}
        onMouseEnter={(e) => {
          if (firstName && lastName && email && isValidEmail(email)) {
            e.currentTarget.style.backgroundColor = darkenColor(primaryColor);
          }
        }}
        onMouseLeave={(e) => {
          if (firstName && lastName && email && isValidEmail(email)) {
            e.currentTarget.style.backgroundColor = primaryColor;
          }
        }}
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
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium transition-all duration-200 mb-4 hover:shadow-lg"
          style={{ backgroundColor: primaryColor }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = darkenColor(primaryColor)}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = primaryColor}
        >
          <Phone className="w-5 h-5" />
          (281) 330-8004
        </a>
        
        <div className="mt-4">
          <button
            onClick={handleDownloadProposal}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:shadow-lg transition-all duration-200 font-medium flex items-center gap-2 mx-auto"
          >
            <Download className="w-5 h-5" />
            Download My Proposal
          </button>
        </div>
        
        <div className="mt-6">
          <button
            onClick={() => setCurrentPage(1)}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:shadow-md transition-all duration-200"
          >
            Start Over
          </button>
        </div>
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

  return embedded ? (
    <div className="bg-gray-100 p-4 h-full overflow-auto">
      {renderCurrentPage()}
    </div>
  ) : (
    <div className="min-h-screen bg-gray-100 py-8">
      {renderCurrentPage()}
    </div>
  );
};

export default WidgetFlow;
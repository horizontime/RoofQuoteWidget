import { useState, useEffect } from 'react';
import Card from '../components/Card';
import Modal from '../components/Modal';
import { FileText, Download, Eye, Settings, Save, Edit2 } from 'lucide-react';
import { templateAPI } from '../services/api';
import type { TemplateData } from '../services/api';
import jsPDF from 'jspdf';

const Templates = () => {
  const [template, setTemplate] = useState<TemplateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [companyName, setCompanyName] = useState('Professional Roofing Services');
  
  const [headerText, setHeaderText] = useState('Professional Roof Quote');
  const [footerText, setFooterText] = useState('Thank you for choosing us!');
  const [showWarranty, setShowWarranty] = useState(true);
  const [showFinancing, setShowFinancing] = useState(true);
  const [showTestimonials, setShowTestimonials] = useState(true);
  const [customMessage, setCustomMessage] = useState('');
  const [termsConditions, setTermsConditions] = useState('');
  
  // Edit states for checkbox content
  const [editingWarranty, setEditingWarranty] = useState(false);
  const [editingFinancing, setEditingFinancing] = useState(false);
  const [editingTestimonials, setEditingTestimonials] = useState(false);
  const [editingServices, setEditingServices] = useState(false);
  
  // Content states
  const [warrantyContent, setWarrantyContent] = useState('Our comprehensive warranty covers materials and workmanship, giving you peace of mind for years to come.');
  const [financingContent, setFinancingContent] = useState('Flexible payment plans available with competitive rates. Ask about our 0% interest options.');
  const [testimonialsContent, setTestimonialsContent] = useState('"Excellent work and professional service. Highly recommended!" - Recent Customer');
  const [includedServices, setIncludedServices] = useState([
    'Complete tear-off of existing roofing',
    'Installation of new underlayment',
    'New drip edge and flashing',
    'Ridge vent installation',
    'Full cleanup and debris removal'
  ]);
  const [servicesText, setServicesText] = useState('');

  useEffect(() => {
    fetchTemplate();
    const savedCompanyName = localStorage.getItem('companyName');
    if (savedCompanyName) {
      setCompanyName(savedCompanyName);
    }
  }, []);

  useEffect(() => {
    fetchPreview();
  }, [headerText, footerText, showWarranty, showFinancing, showTestimonials, customMessage, termsConditions]);

  // Save template settings to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      const templateSettings = {
        headerText,
        footerText,
        showWarranty,
        showFinancing,
        showTestimonials,
        customMessage,
        termsConditions,
        warrantyContent,
        financingContent,
        testimonialsContent,
        includedServices
      };
      localStorage.setItem('templateSettings', JSON.stringify(templateSettings));
    }
  }, [headerText, footerText, showWarranty, showFinancing, showTestimonials, customMessage, 
      termsConditions, warrantyContent, financingContent, testimonialsContent, includedServices, loading]);

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
      
      // Save current template settings to localStorage
      const templateSettings = {
        headerText: data.header_text,
        footerText: data.footer_text,
        showWarranty: data.show_warranty,
        showFinancing: data.show_financing,
        showTestimonials: data.show_testimonials,
        customMessage: data.custom_message || '',
        termsConditions: data.terms_conditions || '',
        warrantyContent,
        financingContent,
        testimonialsContent,
        includedServices
      };
      localStorage.setItem('templateSettings', JSON.stringify(templateSettings));
    } catch (error) {
      console.error('Failed to fetch template:', error);
      // Save default values to localStorage if API fails
      const templateSettings = {
        headerText,
        footerText,
        showWarranty,
        showFinancing,
        showTestimonials,
        customMessage,
        termsConditions,
        warrantyContent,
        financingContent,
        testimonialsContent,
        includedServices
      };
      localStorage.setItem('templateSettings', JSON.stringify(templateSettings));
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

  const generatePDF = () => {
    // Save current settings to localStorage before generating PDF
    const templateSettings = {
      headerText,
      footerText,
      showWarranty,
      showFinancing,
      showTestimonials,
      customMessage,
      termsConditions,
      warrantyContent,
      financingContent,
      testimonialsContent,
      includedServices
    };
    localStorage.setItem('templateSettings', JSON.stringify(templateSettings));
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;
    let yPosition = margin;

    pdf.setFontSize(18);
    pdf.setFont(undefined, 'bold');
    pdf.text(headerText, margin, yPosition);
    yPosition += 8;
    
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'normal');
    pdf.text(companyName, margin, yPosition);
    
    pdf.setFontSize(9);
    pdf.text('Quote #2024-001', pageWidth - margin - 30, margin);
    pdf.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - margin - 30, margin + 5);
    yPosition += 15;

    pdf.setDrawColor(200, 200, 200);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    pdf.setFontSize(12);
    pdf.setFont(undefined, 'bold');
    pdf.text('Property Information', margin, yPosition);
    yPosition += 7;
    
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'normal');
    pdf.text('123 Sample Street', margin, yPosition);
    yPosition += 5;
    pdf.text('City, State 12345', margin, yPosition);
    yPosition += 5;
    pdf.text('Roof Size: 2,500 sq ft', margin, yPosition);
    yPosition += 12;

    pdf.setFontSize(12);
    pdf.setFont(undefined, 'bold');
    pdf.text('Pricing Options', margin, yPosition);
    yPosition += 8;

    const options = [
      { name: 'Good - 3-Tab Shingles', warranty: '25-year warranty', price: '$16,250' },
      { name: 'Better - Architectural Shingles', warranty: '30-year warranty', price: '$21,875', recommended: true },
      { name: 'Best - Designer Shingles', warranty: 'Lifetime warranty', price: '$30,000' }
    ];

    pdf.setFontSize(10);
    options.forEach((option) => {
      if (option.recommended) {
        pdf.setFillColor(220, 252, 231);
        pdf.rect(margin, yPosition - 4, contentWidth, 15, 'F');
        pdf.setDrawColor(34, 197, 94);
        pdf.setLineWidth(0.5);
        pdf.rect(margin, yPosition - 4, contentWidth, 15);
      } else {
        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.3);
        pdf.rect(margin, yPosition - 4, contentWidth, 15);
      }
      
      pdf.setFont(undefined, 'bold');
      pdf.text(option.name, margin + 2, yPosition);
      pdf.text(option.price, pageWidth - margin - 20, yPosition);
      yPosition += 5;
      
      pdf.setFont(undefined, 'normal');
      pdf.text(option.warranty, margin + 2, yPosition);
      if (option.recommended) {
        pdf.setFontSize(8);
        pdf.text('RECOMMENDED', margin + 2, yPosition + 5);
        pdf.setFontSize(10);
      }
      yPosition += 12;
    });

    if (yPosition > pageHeight - 40) {
      pdf.addPage();
      yPosition = margin;
    }

    if (showWarranty) {
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'bold');
      pdf.text('Warranty Information', margin, yPosition);
      yPosition += 7;
      
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');
      const warrantyLines = pdf.splitTextToSize(warrantyContent, contentWidth);
      warrantyLines.forEach((line: string) => {
        if (yPosition > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.text(line, margin, yPosition);
        yPosition += 5;
      });
      yPosition += 5;
    }

    if (showFinancing) {
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = margin;
      }
      
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'bold');
      pdf.text('Financing Options', margin, yPosition);
      yPosition += 7;
      
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');
      const financingLines = pdf.splitTextToSize(financingContent, contentWidth);
      financingLines.forEach((line: string) => {
        if (yPosition > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.text(line, margin, yPosition);
        yPosition += 5;
      });
      yPosition += 5;
    }

    if (showTestimonials) {
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = margin;
      }
      
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'bold');
      pdf.text('Customer Testimonials', margin, yPosition);
      yPosition += 7;
      
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'italic');
      const testimonialLines = pdf.splitTextToSize(testimonialsContent, contentWidth);
      testimonialLines.forEach((line: string) => {
        if (yPosition > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.text(line, margin, yPosition);
        yPosition += 5;
      });
      pdf.setFont(undefined, 'normal');
      yPosition += 5;
    }

    if (customMessage) {
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = margin;
      }
      
      pdf.setFillColor(245, 245, 245);
      const messageLines = pdf.splitTextToSize(customMessage, contentWidth - 4);
      const messageHeight = messageLines.length * 5 + 6;
      pdf.rect(margin, yPosition - 3, contentWidth, messageHeight, 'F');
      
      pdf.setFontSize(10);
      messageLines.forEach((line: string) => {
        pdf.text(line, margin + 2, yPosition);
        yPosition += 5;
      });
      yPosition += 8;
    }

    if (yPosition > pageHeight - 50) {
      pdf.addPage();
      yPosition = margin;
    }

    pdf.setFontSize(12);
    pdf.setFont(undefined, 'bold');
    pdf.text('Included Services', margin, yPosition);
    yPosition += 7;
    
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'normal');
    includedServices.forEach((service) => {
      if (yPosition > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }
      pdf.text(`• ${service}`, margin, yPosition);
      yPosition += 5;
    });
    yPosition += 8;

    if (yPosition > pageHeight - 30) {
      pdf.addPage();
      yPosition = margin;
    }

    pdf.setDrawColor(200, 200, 200);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 7;

    pdf.setFontSize(10);
    const footerLines = pdf.splitTextToSize(footerText, contentWidth);
    footerLines.forEach((line: string) => {
      if (yPosition > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }
      pdf.text(line, margin, yPosition);
      yPosition += 5;
    });

    if (termsConditions) {
      yPosition += 3;
      pdf.setFontSize(8);
      pdf.setTextColor(128, 128, 128);
      const termsLines = pdf.splitTextToSize(termsConditions, contentWidth);
      termsLines.forEach((line: string) => {
        if (yPosition > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.text(line, margin, yPosition);
        yPosition += 4;
      });
      pdf.setTextColor(0, 0, 0);
    }

    return pdf;
  };

  const handleDownloadPDF = () => {
    const pdf = generatePDF();
    pdf.save('roof-quote-template.pdf');
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
      
      // Save all template settings to localStorage for use in lead PDFs
      const templateSettings = {
        headerText,
        footerText,
        showWarranty,
        showFinancing,
        showTestimonials,
        customMessage,
        termsConditions,
        warrantyContent,
        financingContent,
        testimonialsContent,
        includedServices
      };
      localStorage.setItem('templateSettings', JSON.stringify(templateSettings));
      
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
                Include Sections
              </label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      className="mr-2 text-green-600" 
                      checked={showWarranty}
                      onChange={(e) => setShowWarranty(e.target.checked)}
                    />
                    <span className="text-sm">Warranty Information</span>
                  </label>
                  <button
                    onClick={() => setEditingWarranty(!editingWarranty)}
                    className="text-gray-500 hover:text-green-600 transition-colors"
                    title="Edit warranty content"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
                {editingWarranty && (
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    rows={3}
                    placeholder="Enter warranty information..."
                    value={warrantyContent}
                    onChange={(e) => setWarrantyContent(e.target.value)}
                  />
                )}
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      className="mr-2 text-green-600" 
                      checked={showFinancing}
                      onChange={(e) => setShowFinancing(e.target.checked)}
                    />
                    <span className="text-sm">Financing Options</span>
                  </label>
                  <button
                    onClick={() => setEditingFinancing(!editingFinancing)}
                    className="text-gray-500 hover:text-green-600 transition-colors"
                    title="Edit financing content"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
                {editingFinancing && (
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    rows={3}
                    placeholder="Enter financing options..."
                    value={financingContent}
                    onChange={(e) => setFinancingContent(e.target.value)}
                  />
                )}
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      className="mr-2 text-green-600"
                      checked={showTestimonials}
                      onChange={(e) => setShowTestimonials(e.target.checked)}
                    />
                    <span className="text-sm">Customer Testimonials</span>
                  </label>
                  <button
                    onClick={() => setEditingTestimonials(!editingTestimonials)}
                    className="text-gray-500 hover:text-green-600 transition-colors"
                    title="Edit testimonials content"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
                {editingTestimonials && (
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    rows={3}
                    placeholder="Enter customer testimonials..."
                    value={testimonialsContent}
                    onChange={(e) => setTestimonialsContent(e.target.value)}
                  />
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center justify-between">
                <span>Included Services</span>
                <button
                  onClick={() => {
                    setEditingServices(!editingServices);
                    if (!editingServices) {
                      setServicesText(includedServices.join('\n'));
                    }
                  }}
                  className="text-gray-500 hover:text-green-600 transition-colors"
                  title="Edit included services"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </label>
              {editingServices ? (
                <div className="space-y-2">
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    rows={5}
                    placeholder="Enter services (one per line)..."
                    value={servicesText}
                    onChange={(e) => setServicesText(e.target.value)}
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        const services = servicesText.split('\n').filter(s => s.trim());
                        setIncludedServices(services);
                        setEditingServices(false);
                      }}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                    >
                      Save Services
                    </button>
                    <button
                      onClick={() => {
                        setEditingServices(false);
                        setServicesText('');
                      }}
                      className="px-3 py-1 border border-gray-300 text-sm rounded hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-3">
                  <ul className="text-sm text-gray-600 space-y-1">
                    {includedServices.map((service, index) => (
                      <li key={index}>• {service}</li>
                    ))}
                  </ul>
                </div>
              )}
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
              <button 
                onClick={handleDownloadPDF}
                className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </button>
            </div>
          </div>
        </Card>

        <Card title="Live Preview">
          <div className="bg-gray-50 rounded-lg p-4 h-[calc(100vh-400px)] min-h-[950px] overflow-y-auto">
            <div className="bg-white shadow-sm rounded-lg p-6">
              <div className="border-b pb-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{headerText}</h3>
                    <p className="text-sm text-gray-600">{companyName}</p>
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
                    {warrantyContent}
                  </p>
                </div>
              )}

              {showFinancing && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Financing Options</h4>
                  <p className="text-sm text-gray-600">
                    {financingContent}
                  </p>
                </div>
              )}

              {showTestimonials && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Customer Testimonials</h4>
                  <p className="text-sm text-gray-600 italic">
                    {testimonialsContent}
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
                  {includedServices.map((service, index) => (
                    <li key={index}>• {service}</li>
                  ))}
                </ul>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-gray-700 mb-2">{footerText}</p>
                {termsConditions && (
                  <p className="text-xs text-gray-500">
                    {termsConditions}
                  </p>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Template Preview" 
        fullScreen={true}
      >
        <div className="p-8">
          <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8">
            <div className="border-b pb-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{headerText}</h3>
                  <p className="text-base text-gray-600">{companyName}</p>
                </div>
                <div className="text-right">
                  <p className="text-base text-gray-600">Quote #2024-001</p>
                  <p className="text-base text-gray-600">Date: {new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Property Information</h4>
              <p className="text-base text-gray-600">123 Sample Street</p>
              <p className="text-base text-gray-600">City, State 12345</p>
              <p className="text-base text-gray-600 mt-2">Roof Size: 2,500 sq ft</p>
            </div>

            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Pricing Options</h4>
              <div className="space-y-4">
                <div className="border-2 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-lg font-medium">Good - 3-Tab Shingles</p>
                      <p className="text-base text-gray-600">25-year warranty</p>
                    </div>
                    <p className="font-bold text-2xl">$16,250</p>
                  </div>
                </div>
                <div className="border-2 border-green-500 rounded-lg p-4 bg-green-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-lg font-medium">Better - Architectural Shingles</p>
                      <p className="text-base text-gray-600">30-year warranty</p>
                      <span className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded mt-2 inline-block">Recommended</span>
                    </div>
                    <p className="font-bold text-2xl">$21,875</p>
                  </div>
                </div>
                <div className="border-2 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-lg font-medium">Best - Designer Shingles</p>
                      <p className="text-base text-gray-600">Lifetime warranty</p>
                    </div>
                    <p className="font-bold text-2xl">$30,000</p>
                  </div>
                </div>
              </div>
            </div>

            {showWarranty && (
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Warranty Information</h4>
                <p className="text-base text-gray-600">
                  {warrantyContent}
                </p>
              </div>
            )}

            {showFinancing && (
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Financing Options</h4>
                <p className="text-base text-gray-600">
                  {financingContent}
                </p>
              </div>
            )}

            {showTestimonials && (
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Customer Testimonials</h4>
                <p className="text-base text-gray-600 italic">
                  {testimonialsContent}
                </p>
              </div>
            )}

            {customMessage && (
              <div className="mb-8 p-4 bg-gray-50 rounded">
                <p className="text-base text-gray-700">{customMessage}</p>
              </div>
            )}

            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Included Services</h4>
              <ul className="text-base text-gray-600 space-y-2">
                {includedServices.map((service, index) => (
                  <li key={index}>• {service}</li>
                ))}
              </ul>
            </div>

            <div className="border-t pt-6">
              <p className="text-base text-gray-700 mb-3">{footerText}</p>
              {termsConditions && (
                <p className="text-sm text-gray-500">
                  {termsConditions}
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <button 
              onClick={handleDownloadPDF}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <Download className="w-5 h-5 mr-2" />
              Download PDF
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Templates;
import jsPDF from 'jspdf';
import type { Lead } from '../services/api';
import { templateAPI } from '../services/api';

interface PdfTemplateSettings {
  headerText: string;
  footerText: string;
  showWarranty: boolean;
  showFinancing: boolean;
  showTestimonials: boolean;
  customMessage?: string;
  termsConditions?: string;
  warrantyContent: string;
  financingContent: string;
  testimonialsContent: string;
  includedServices: string[];
  companyName: string;
}

const getStoredTemplateSettings = (): PdfTemplateSettings => {
  const companyName = localStorage.getItem('companyName') || 'Professional Roofing Services';
  
  // Try to get saved template settings from localStorage
  const savedTemplate = localStorage.getItem('templateSettings');
  if (savedTemplate) {
    try {
      const parsed = JSON.parse(savedTemplate);
      return {
        ...parsed,
        companyName
      };
    } catch (e) {
      console.error('Failed to parse saved template settings:', e);
    }
  }
  
  // Default settings if nothing saved
  return {
    headerText: 'Professional Roof Quote',
    footerText: 'Thank you for choosing us!',
    showWarranty: true,
    showFinancing: true,
    showTestimonials: true,
    customMessage: '',
    termsConditions: '',
    warrantyContent: 'Our comprehensive warranty covers materials and workmanship, giving you peace of mind for years to come.',
    financingContent: 'Flexible payment plans available with competitive rates. Ask about our 0% interest options.',
    testimonialsContent: '"Excellent work and professional service. Highly recommended!" - Recent Customer',
    includedServices: [
      'Complete tear-off of existing roofing',
      'Installation of new underlayment',
      'New drip edge and flashing',
      'Ridge vent installation',
      'Full cleanup and debris removal'
    ],
    companyName
  };
};

const getTierDetails = (tier: string) => {
  const tierMap: Record<string, { name: string; warranty: string; price?: number }> = {
    'good': { name: 'Good - 3-Tab Shingles', warranty: '25-year warranty' },
    'better': { name: 'Better - Architectural Shingles', warranty: '30-year warranty' },
    'best': { name: 'Best - Designer Shingles', warranty: 'Lifetime warranty' }
  };
  
  return tierMap[tier.toLowerCase()] || tierMap['better'];
};

export const generateLeadQuotePDF = (lead: Lead, templateSettings?: Partial<PdfTemplateSettings>) => {
  const settings = { ...getStoredTemplateSettings(), ...templateSettings };
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  pdf.setFontSize(18);
  pdf.setFont(undefined, 'bold');
  pdf.text(settings.headerText, margin, yPosition);
  yPosition += 8;
  
  pdf.setFontSize(10);
  pdf.setFont(undefined, 'normal');
  pdf.text(settings.companyName, margin, yPosition);
  
  pdf.setFontSize(9);
  const quoteNumber = `Quote #${new Date().getFullYear()}-${String(lead.id).padStart(3, '0')}`;
  pdf.text(quoteNumber, pageWidth - margin - 30, margin);
  pdf.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - margin - 30, margin + 5);
  yPosition += 15;

  pdf.setDrawColor(200, 200, 200);
  pdf.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  pdf.setFontSize(12);
  pdf.setFont(undefined, 'bold');
  pdf.text('Customer Information', margin, yPosition);
  yPosition += 7;
  
  pdf.setFontSize(10);
  pdf.setFont(undefined, 'normal');
  pdf.text(`Name: ${lead.name}`, margin, yPosition);
  yPosition += 5;
  pdf.text(`Email: ${lead.email}`, margin, yPosition);
  yPosition += 5;
  pdf.text(`Phone: ${lead.phone}`, margin, yPosition);
  yPosition += 10;

  pdf.setFontSize(12);
  pdf.setFont(undefined, 'bold');
  pdf.text('Property Information', margin, yPosition);
  yPosition += 7;
  
  pdf.setFontSize(10);
  pdf.setFont(undefined, 'normal');
  const addressParts = lead.address.split(',');
  addressParts.forEach((part, index) => {
    pdf.text(part.trim(), margin, yPosition);
    yPosition += 5;
  });
  
  if (lead.latest_quote && lead.latest_quote.roof_size_sqft) {
    pdf.text(`Roof Size: ${lead.latest_quote.roof_size_sqft.toLocaleString()} sq ft`, margin, yPosition);
    yPosition += 5;
  }
  yPosition += 7;

  pdf.setFontSize(12);
  pdf.setFont(undefined, 'bold');
  pdf.text('Pricing Options', margin, yPosition);
  yPosition += 8;

  const options = [];
  if (lead.latest_quote && lead.latest_quote.roof_size_sqft) {
    const roofSize = lead.latest_quote.roof_size_sqft;
    const goodPrice = roofSize * 6.50;
    const betterPrice = roofSize * 8.75;
    const bestPrice = roofSize * 12.00;
    
    options.push(
      { 
        name: 'Good - 3-Tab Shingles', 
        warranty: '25-year warranty', 
        price: `$${goodPrice.toLocaleString()}`,
        recommended: lead.latest_quote.selected_tier === 'good'
      },
      { 
        name: 'Better - Architectural Shingles', 
        warranty: '30-year warranty', 
        price: `$${betterPrice.toLocaleString()}`,
        recommended: lead.latest_quote.selected_tier === 'better'
      },
      { 
        name: 'Best - Designer Shingles', 
        warranty: 'Lifetime warranty', 
        price: `$${bestPrice.toLocaleString()}`,
        recommended: lead.latest_quote.selected_tier === 'best'
      }
    );
  } else if (lead.latest_quote && lead.latest_quote.total_price) {
    // If we have a quote but no roof size, use the total price from the quote
    const selectedTier = lead.latest_quote.selected_tier || 'better';
    options.push(
      { 
        name: 'Good - 3-Tab Shingles', 
        warranty: '25-year warranty', 
        price: selectedTier === 'good' ? `$${lead.latest_quote.total_price.toLocaleString()}` : '$16,250',
        recommended: selectedTier === 'good'
      },
      { 
        name: 'Better - Architectural Shingles', 
        warranty: '30-year warranty', 
        price: selectedTier === 'better' ? `$${lead.latest_quote.total_price.toLocaleString()}` : '$21,875',
        recommended: selectedTier === 'better'
      },
      { 
        name: 'Best - Designer Shingles', 
        warranty: 'Lifetime warranty', 
        price: selectedTier === 'best' ? `$${lead.latest_quote.total_price.toLocaleString()}` : '$30,000',
        recommended: selectedTier === 'best'
      }
    );
  } else {
    // Default fallback values
    const defaultRoofSize = 2500;
    options.push(
      { name: 'Good - 3-Tab Shingles', warranty: '25-year warranty', price: '$16,250' },
      { name: 'Better - Architectural Shingles', warranty: '30-year warranty', price: '$21,875', recommended: true },
      { name: 'Best - Designer Shingles', warranty: 'Lifetime warranty', price: '$30,000' }
    );
  }

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
      pdf.setTextColor(34, 197, 94);
      pdf.text('YOUR SELECTED OPTION', margin + 2, yPosition + 5);
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(10);
    }
    yPosition += 12;
  });

  if (yPosition > pageHeight - 40) {
    pdf.addPage();
    yPosition = margin;
  }

  if (settings.showWarranty) {
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'bold');
    pdf.text('Warranty Information', margin, yPosition);
    yPosition += 7;
    
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'normal');
    const warrantyLines = pdf.splitTextToSize(settings.warrantyContent, contentWidth);
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

  if (settings.showFinancing) {
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
    const financingLines = pdf.splitTextToSize(settings.financingContent, contentWidth);
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

  if (settings.showTestimonials) {
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
    const testimonialLines = pdf.splitTextToSize(settings.testimonialsContent, contentWidth);
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

  if (settings.customMessage) {
    if (yPosition > pageHeight - 40) {
      pdf.addPage();
      yPosition = margin;
    }
    
    pdf.setFillColor(245, 245, 245);
    const messageLines = pdf.splitTextToSize(settings.customMessage, contentWidth - 4);
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
  settings.includedServices.forEach((service) => {
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
  const footerLines = pdf.splitTextToSize(settings.footerText, contentWidth);
  footerLines.forEach((line: string) => {
    if (yPosition > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
    }
    pdf.text(line, margin, yPosition);
    yPosition += 5;
  });

  if (settings.termsConditions) {
    yPosition += 3;
    pdf.setFontSize(8);
    pdf.setTextColor(128, 128, 128);
    const termsLines = pdf.splitTextToSize(settings.termsConditions, contentWidth);
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
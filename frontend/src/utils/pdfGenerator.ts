import jsPDF from 'jspdf';

export interface QuoteData {
  leadName: string;
  leadEmail: string;
  leadPhone: string;
  address: string;
  roofSize: string;
  selectedTier: string;
  pricePerSqft: number;
  totalPrice: number;
  warranty: string;
  description: string;
  companyName?: string;
  companyLogo?: string;
  date: string;
}

export const generateQuotePDF = (quoteData: QuoteData): Blob => {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text(quoteData.companyName || 'Roofing Company', 20, 20);
  
  doc.setFontSize(16);
  doc.text('Roofing Quote', 20, 35);
  
  doc.setFontSize(12);
  doc.text(`Date: ${quoteData.date}`, 20, 50);
  
  doc.setLineWidth(0.5);
  doc.line(20, 55, 190, 55);
  
  doc.setFontSize(14);
  doc.text('Customer Information', 20, 70);
  
  doc.setFontSize(11);
  doc.text(`Name: ${quoteData.leadName}`, 20, 80);
  doc.text(`Email: ${quoteData.leadEmail}`, 20, 88);
  doc.text(`Phone: ${quoteData.leadPhone}`, 20, 96);
  doc.text(`Address: ${quoteData.address}`, 20, 104);
  
  doc.setLineWidth(0.5);
  doc.line(20, 115, 190, 115);
  
  doc.setFontSize(14);
  doc.text('Quote Details', 20, 130);
  
  doc.setFontSize(11);
  doc.text(`Roof Size: ${quoteData.roofSize}`, 20, 140);
  doc.text(`Selected Package: ${quoteData.selectedTier}`, 20, 148);
  doc.text(`Description: ${quoteData.description}`, 20, 156);
  doc.text(`Warranty: ${quoteData.warranty}`, 20, 164);
  doc.text(`Price per Sq Ft: $${quoteData.pricePerSqft.toFixed(2)}`, 20, 172);
  
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text(`Total Price: $${quoteData.totalPrice.toLocaleString()}`, 20, 185);
  
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  doc.text('This quote is valid for 30 days from the date above.', 20, 200);
  doc.text('Terms and conditions apply.', 20, 208);
  
  doc.setLineWidth(0.5);
  doc.line(20, 220, 190, 220);
  
  doc.setFontSize(9);
  doc.text('Thank you for considering our services!', 105, 240, { align: 'center' });
  doc.text('Please contact us if you have any questions.', 105, 247, { align: 'center' });
  
  return doc.output('blob');
};
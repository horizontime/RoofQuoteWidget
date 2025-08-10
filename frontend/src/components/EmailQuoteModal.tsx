import Modal from './Modal';
import { useState, useEffect } from 'react';
import { Mail, FileText, Send, X } from 'lucide-react';
import { generateLeadQuotePDF } from '../utils/leadQuotePdf';
import type { Lead } from '../services/api';

interface EmailQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  onSend: (emailContent: string, includePdf: boolean) => Promise<void>;
}

const EmailQuoteModal = ({ isOpen, onClose, lead, onSend }: EmailQuoteModalProps) => {
  const [emailContent, setEmailContent] = useState('');
  const [includePdf, setIncludePdf] = useState(true);
  const [sending, setSending] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    // Clean up previous PDF URL when component unmounts or lead changes
    return () => {
      if (pdfPreviewUrl) {
        URL.revokeObjectURL(pdfPreviewUrl);
        setPdfPreviewUrl(null);
      }
    };
  }, [pdfPreviewUrl]);

  useEffect(() => {
    if (lead) {
      // Get company name from localStorage or use default
      const companyName = localStorage.getItem('companyName') || 'Professional Roofing Services';
      
      // Determine the tier details
      const selectedTier = lead.latest_quote?.selected_tier || 'better';
      const tierNames: Record<string, string> = {
        'good': 'Good - 3-Tab Shingles',
        'better': 'Better - Architectural Shingles', 
        'best': 'Best - Designer Shingles'
      };
      const warranty = selectedTier === 'best' ? 'Lifetime warranty' : 
                      selectedTier === 'better' ? '30-year warranty' : '25-year warranty';
      
      const defaultEmail = `Dear ${lead.name},

Thank you for your interest in our roofing services. Please find attached your personalized roofing quote for your property at ${lead.address}.

Quote Summary:
- Selected Package: ${tierNames[selectedTier] || tierNames['better']}
- Roof Size: ${lead.latest_quote?.roof_size_sqft ? `${lead.latest_quote.roof_size_sqft.toLocaleString()} sq ft` : '2,500 sq ft'}
- Total Price: $${lead.latest_quote?.total_price ? lead.latest_quote.total_price.toLocaleString() : '21,875'}
- Warranty: ${warranty}

This quote is valid for 30 days. Please feel free to contact us if you have any questions or would like to schedule a consultation.

Best regards,
${companyName}`;
      
      setEmailContent(defaultEmail);
      
      // Clean up previous URL if exists
      if (pdfPreviewUrl) {
        URL.revokeObjectURL(pdfPreviewUrl);
      }
      
      // Generate PDF using the template-based generator
      const pdf = generateLeadQuotePDF(lead);
      const pdfBlob = pdf.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      setPdfPreviewUrl(url);
    }
  }, [lead]);


  const handleSend = async () => {
    if (!lead) return;
    
    setSending(true);
    try {
      await onSend(emailContent, includePdf);
      onClose();
    } catch (error) {
      console.error('Error sending email:', error);
    } finally {
      setSending(false);
    }
  };

  if (!lead) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Send Quote Email"
      size="xl"
    >
      <div className="grid grid-cols-2 gap-6 h-[600px]">
        <div className="flex flex-col">
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Email Draft</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <span className="font-medium">To:</span> {lead.email}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
              <span className="font-medium">Subject:</span> Your Roofing Quote - {lead.address}
            </div>
            <textarea
              value={emailContent}
              onChange={(e) => setEmailContent(e.target.value)}
              className="w-full h-[400px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              placeholder="Enter email content..."
            />
          </div>
          
          <div className="flex items-center gap-3 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includePdf}
                onChange={(e) => setIncludePdf(e.target.checked)}
                className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">Include PDF Quote as attachment</span>
            </label>
          </div>
        </div>

        <div className="flex flex-col">
          <h3 className="text-sm font-medium text-gray-700 mb-2">PDF Preview</h3>
          <div className="flex-1 border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
            {pdfPreviewUrl && includePdf ? (
              <iframe
                src={pdfPreviewUrl}
                className="w-full h-full"
                title="PDF Preview"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                {!includePdf ? (
                  <div className="text-center">
                    <FileText className="w-12 h-12 mx-auto mb-2" />
                    <p>PDF attachment disabled</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <FileText className="w-12 h-12 mx-auto mb-2" />
                    <p>Loading PDF preview...</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t mt-4">
        <button
          onClick={onClose}
          disabled={sending}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSend}
          disabled={sending}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          {sending ? 'Sending...' : 'Send Email'}
        </button>
      </div>
    </Modal>
  );
};

export default EmailQuoteModal;
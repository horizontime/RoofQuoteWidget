import Card from '../components/Card';
import Modal from '../components/Modal';
import EmailQuoteModal from '../components/EmailQuoteModal';
import { Search, Filter, Calendar, Download, Save, Phone, Mail, MapPin, MoreVertical, Eye, FileText, Edit2, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { leadAPI } from '../services/api';
import type { Lead } from '../services/api';
import { generateLeadQuotePDF } from '../utils/leadQuotePdf';
import { DayPicker, type DateRange } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format, startOfDay, endOfDay } from 'date-fns';

const Leads = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);
  const leadsPerPage = 10;
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Lead | null>(null);
  const dropdownRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [tempDateRange, setTempDateRange] = useState<DateRange | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef<HTMLDivElement | null>(null);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailModalLead, setEmailModalLead] = useState<Lead | null>(null);
  const [sortField, setSortField] = useState<'name' | 'address' | 'total_price' | 'status' | 'created_at' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetchLeads();
  }, [searchTerm, statusFilter, currentPage, dateRange, sortField, sortDirection]);

  const filterLeadsByDateRange = (inputLeads: Lead[], range?: DateRange): Lead[] => {
    if (!range || (!range.from && !range.to)) return inputLeads;
    const fromDate = range.from ? startOfDay(range.from) : undefined;
    const toDate = range.to ? endOfDay(range.to) : undefined;
    return inputLeads.filter((lead) => {
      const created = new Date(lead.created_at);
      if (Number.isNaN(created.getTime())) return false;
      if (fromDate && created < fromDate) return false;
      if (toDate && created > toDate) return false;
      return true;
    });
  };

  const sortLeads = (leadsToSort: Lead[]): Lead[] => {
    if (!sortField) return leadsToSort;

    const sorted = [...leadsToSort].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'address':
          aValue = a.address.toLowerCase();
          bValue = b.address.toLowerCase();
          break;
        case 'total_price':
          aValue = a.latest_quote?.total_price || 0;
          bValue = b.latest_quote?.total_price || 0;
          break;
        case 'status':
          aValue = a.status.toLowerCase();
          bValue = b.status.toLowerCase();
          break;
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  };

  const handleSort = (field: 'name' | 'address' | 'total_price' | 'status' | 'created_at') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const fetchLeads = async () => {
    try {
      setLoading(true);
      // First, fetch ALL leads to get the total count and apply filtering
      const allParams = {
        skip: 0,
        limit: 1000, // Get all leads
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchTerm || undefined,
      };
      const allData = await leadAPI.getContractorLeads(1, allParams);
      
      // Apply client-side filtering and sorting
      const filtered = filterLeadsByDateRange(allData, dateRange);
      const sorted = sortLeads(filtered);
      
      // Set total count
      setTotalLeads(sorted.length);
      
      // Apply pagination on the sorted data
      const startIndex = (currentPage - 1) * leadsPerPage;
      const endIndex = startIndex + leadsPerPage;
      setLeads(sorted.slice(startIndex, endIndex));
    } catch (error) {
      console.error('Error fetching leads:', error);
      // Show error notification
      setNotification({ type: 'error', message: 'Failed to load leads. Please check your connection.' });
      setTimeout(() => setNotification(null), 5000);
      setLeads([]);
      setTotalLeads(0);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const blob = await leadAPI.exportLeads(1, statusFilter !== 'all' ? statusFilter : undefined);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting leads:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.round(price));
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'quoted':
        return 'bg-yellow-100 text-yellow-800';
      case 'contacted':
        return 'bg-purple-100 text-purple-800';
      case 'converted':
        return 'bg-green-100 text-green-800';
      case 'lost':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdownId !== null) {
        const dropdownRef = dropdownRefs.current[openDropdownId];
        if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
          setOpenDropdownId(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdownId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
    };

    if (showDatePicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDatePicker]);

  const handleView = (lead: Lead) => {
    setSelectedLead(lead);
    setViewModalOpen(true);
  };

  const handleEdit = (lead: Lead) => {
    setEditForm(lead);
    setEditModalOpen(true);
    setOpenDropdownId(null);
  };

  const handleDelete = (lead: Lead) => {
    setSelectedLead(lead);
    setDeleteModalOpen(true);
    setOpenDropdownId(null);
  };

  const confirmDelete = async () => {
    if (selectedLead) {
      try {
        // Make API call to delete lead
        await leadAPI.deleteLead(selectedLead.id);
        
        // Update local state
        setLeads(leads.filter(l => l.id !== selectedLead.id));
        setTotalLeads(prev => Math.max(0, prev - 1));
        setDeleteModalOpen(false);
        setSelectedLead(null);
        
        // Show success notification
        setNotification({ type: 'success', message: 'Lead deleted successfully!' });
        setTimeout(() => setNotification(null), 3000);
      } catch (error) {
        console.error('Error deleting lead:', error);
        // In case of API failure, still delete locally for demo purposes
        setLeads(leads.filter(l => l.id !== selectedLead.id));
        setTotalLeads(prev => Math.max(0, prev - 1));
        setDeleteModalOpen(false);
        setSelectedLead(null);
        
        // Show error notification
        setNotification({ type: 'error', message: 'Failed to delete from database. Removed locally.' });
        setTimeout(() => setNotification(null), 3000);
      }
    }
  };

  const handleSaveEdit = async () => {
    if (editForm) {
      try {
        // Make API call to update lead
        const updatedLead = await leadAPI.updateLead(editForm.id, {
          name: editForm.name,
          email: editForm.email,
          phone: editForm.phone,
          address: editForm.address,
          status: editForm.status,
        });
        
        // Update local state with the response from server
        setLeads(leads.map(l => l.id === updatedLead.id ? updatedLead : l));
        setEditModalOpen(false);
        setEditForm(null);
        
        // Show success notification
        setNotification({ type: 'success', message: 'Lead updated successfully!' });
        setTimeout(() => setNotification(null), 3000);
      } catch (error) {
        console.error('Error updating lead:', error);
        // In case of API failure, still update locally for demo purposes
        setLeads(leads.map(l => l.id === editForm.id ? editForm : l));
        setEditModalOpen(false);
        setEditForm(null);
        
        // Show error notification
        setNotification({ type: 'error', message: 'Failed to save to database. Changes saved locally.' });
        setTimeout(() => setNotification(null), 3000);
      }
    }
  };

  const handleQuoteEmail = (lead: Lead) => {
    setEmailModalLead(lead);
    setEmailModalOpen(true);
  };

  const handleQuotePDF = (lead: Lead) => {
    const pdf = generateLeadQuotePDF(lead);
    const fileName = `quote-${lead.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
  };

  const handleSendEmail = async (emailContent: string, includePdf: boolean) => {
    if (!emailModalLead) return;

    try {
      let pdfBase64 = null;
      if (includePdf) {
        // Use the same PDF generation that respects template settings
        const pdf = generateLeadQuotePDF(emailModalLead);
        const pdfBlob = pdf.output('blob');
        const reader = new FileReader();
        pdfBase64 = await new Promise<string>((resolve) => {
          reader.onloadend = () => {
            const base64String = reader.result as string;
            resolve(base64String.split(',')[1]);
          };
          reader.readAsDataURL(pdfBlob);
        });
      }

      const response = await fetch('http://localhost:8000/api/send-quote-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to_email: emailModalLead.email,
          subject: `Your Roofing Quote - ${emailModalLead.address}`,
          email_content: emailContent,
          pdf_base64: pdfBase64,
          lead_name: emailModalLead.name,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      setNotification({ type: 'success', message: 'Quote email sent successfully!' });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error('Error sending email:', error);
      setNotification({ type: 'error', message: 'Failed to send email. Please try again.' });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Lead Management</h2>
      <p className="text-gray-600 mb-8">Track and manage your widget-generated leads</p>

      {notification && (
        <div className={`mb-4 p-4 rounded-lg flex items-center justify-between ${
          notification.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <span className="flex items-center">
            {notification.type === 'success' ? '✓' : '⚠'} {notification.message}
          </span>
          <button 
            onClick={() => setNotification(null)}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>
      )}

      <Card>
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <div className="flex gap-3">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none"
                >
                  <option value="all">All Status</option>
                  <option value="new">New</option>
                  <option value="quoted">Quoted</option>
                  <option value="contacted">Contacted</option>
                  <option value="converted">Converted</option>
                  <option value="lost">Lost</option>
                </select>
              </div>
              
              <div className="relative" ref={datePickerRef}>
                <button 
                  onClick={() => {
                    setTempDateRange(dateRange);
                    setShowDatePicker(!showDatePicker);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  {dateRange?.from || dateRange?.to ? (
                    <span>
                  {dateRange?.from && format(dateRange.from, 'MMM dd')} 
                  {dateRange?.from && dateRange?.to && ' - '}
                  {dateRange?.to && format(dateRange.to, 'MMM dd')}
                    </span>
                  ) : (
                    'Date Range'
                  )}
                </button>
                
                {showDatePicker && (
                  <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50">
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-700">Select Date Range</h3>
                        {(tempDateRange?.from || tempDateRange?.to) && (
                          <button
                            onClick={() => {
                              setTempDateRange(undefined);
                            }}
                            className="text-xs text-gray-500 hover:text-gray-700"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>
                    <DayPicker
                      mode="range"
                      selected={tempDateRange}
                      onSelect={(range) => {
                        setTempDateRange(range);
                      }}
                      className="!text-sm"
                      modifiersStyles={{
                        selected: {
                          backgroundColor: '#16a34a',
                          color: 'white'
                        },
                        range_start: {
                          backgroundColor: '#16a34a',
                          color: 'white',
                          borderTopLeftRadius: '9999px',
                          borderBottomLeftRadius: '9999px'
                        },
                        range_end: {
                          backgroundColor: '#16a34a',
                          color: 'white',
                          borderTopRightRadius: '9999px',
                          borderBottomRightRadius: '9999px'
                        },
                        range_middle: {
                          backgroundColor: '#dcfce7',
                          color: '#166534',
                          borderRadius: '0'
                        }
                      }}
                    />
                    <div className="flex justify-end gap-2 mt-3 pt-3 border-t">
                      <button
                        onClick={() => setShowDatePicker(false)}
                        className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                      >
                        Close
                      </button>
                      <button
                        onClick={() => {
                          setDateRange(tempDateRange);
                          setShowDatePicker(false);
                          setCurrentPage(1);
                        }}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <button 
                onClick={handleExportCSV}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th 
                  className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-50 select-none"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-1">
                    LEAD
                    {sortField === 'name' && (
                      sortDirection === 'asc' ? 
                        <ChevronUp className="w-4 h-4" /> : 
                        <ChevronDown className="w-4 h-4" />
                    )}
                    {sortField !== 'name' && <div className="w-4 h-4" />}
                  </div>
                </th>
                <th 
                  className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-50 select-none"
                  onClick={() => handleSort('address')}
                >
                  <div className="flex items-center gap-1">
                    PROPERTY
                    {sortField === 'address' && (
                      sortDirection === 'asc' ? 
                        <ChevronUp className="w-4 h-4" /> : 
                        <ChevronDown className="w-4 h-4" />
                    )}
                    {sortField !== 'address' && <div className="w-4 h-4" />}
                  </div>
                </th>
                <th 
                  className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-50 select-none"
                  onClick={() => handleSort('total_price')}
                >
                  <div className="flex items-center gap-1">
                    ESTIMATE
                    {sortField === 'total_price' && (
                      sortDirection === 'asc' ? 
                        <ChevronUp className="w-4 h-4" /> : 
                        <ChevronDown className="w-4 h-4" />
                    )}
                    {sortField !== 'total_price' && <div className="w-4 h-4" />}
                  </div>
                </th>
                <th 
                  className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-50 select-none"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-1">
                    STATUS
                    {sortField === 'status' && (
                      sortDirection === 'asc' ? 
                        <ChevronUp className="w-4 h-4" /> : 
                        <ChevronDown className="w-4 h-4" />
                    )}
                    {sortField !== 'status' && <div className="w-4 h-4" />}
                  </div>
                </th>
                <th 
                  className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-50 select-none"
                  onClick={() => handleSort('created_at')}
                >
                  <div className="flex items-center gap-1">
                    DATE
                    {sortField === 'created_at' && (
                      sortDirection === 'asc' ? 
                        <ChevronUp className="w-4 h-4" /> : 
                        <ChevronDown className="w-4 h-4" />
                    )}
                    {sortField !== 'created_at' && <div className="w-4 h-4" />}
                  </div>
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    Loading leads...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    No leads found
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                <tr key={lead.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{lead.name}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <a href={`mailto:${lead.email}`} className="text-xs text-gray-500 hover:text-green-600 flex items-center">
                          <Mail className="w-3 h-3 mr-1" />
                          {lead.email}
                        </a>
                        <a href={`tel:${lead.phone}`} className="text-xs text-gray-500 hover:text-green-600 flex items-center">
                          <Phone className="w-3 h-3 mr-1" />
                          {lead.phone}
                        </a>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="text-sm text-gray-900 flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {lead.address}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    {lead.latest_quote ? (
                      <p className="font-semibold text-gray-900">{formatPrice(lead.latest_quote.total_price)}</p>
                    ) : (
                      <p className="text-sm text-gray-500">No quote</p>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`text-xs px-2 py-1 rounded-full capitalize ${getStatusColor(lead.status)}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-sm text-gray-900">{formatDate(lead.created_at)}</p>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleView(lead)}
                        className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        View
                      </button>
                      <span className="text-gray-300">|</span>
                      <button 
                        onClick={() => handleQuotePDF(lead)}
                        className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        Quote
                      </button>
                      <div className="relative" ref={(el) => { dropdownRefs.current[lead.id] = el; }}>
                        <button 
                          onClick={() => setOpenDropdownId(openDropdownId === lead.id ? null : lead.id)}
                          className="text-gray-400 hover:text-gray-600 ml-2 p-1 rounded hover:bg-gray-100">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {openDropdownId === lead.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                            <button
                              onClick={() => handleEdit(lead)}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                              <Edit2 className="w-4 h-4" />
                              Edit Lead
                            </button>
                            <button
                              onClick={() => handleDelete(lead)}
                              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                              <Trash2 className="w-4 h-4" />
                              Delete Lead
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {leads.length === 0 ? 0 : Math.min(((currentPage - 1) * leadsPerPage) + 1, totalLeads)} to {Math.min(currentPage * leadsPerPage, totalLeads)} of {totalLeads} results
          </p>
          {totalLeads > leadsPerPage && (
            <div className="flex gap-1">
              <button 
                className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </button>
              
              {(() => {
                const totalPages = Math.ceil(totalLeads / leadsPerPage);
                const pageNumbers = [];
                
                if (totalPages <= 7) {
                  // Show all pages if 7 or fewer
                  for (let i = 1; i <= totalPages; i++) {
                    pageNumbers.push(i);
                  }
                } else {
                  // Always show first page
                  pageNumbers.push(1);
                  
                  if (currentPage > 3) {
                    pageNumbers.push('...');
                  }
                  
                  // Show pages around current page
                  const start = Math.max(2, currentPage - 1);
                  const end = Math.min(totalPages - 1, currentPage + 1);
                  
                  for (let i = start; i <= end; i++) {
                    if (!pageNumbers.includes(i)) {
                      pageNumbers.push(i);
                    }
                  }
                  
                  if (currentPage < totalPages - 2) {
                    pageNumbers.push('...');
                  }
                  
                  // Always show last page
                  if (!pageNumbers.includes(totalPages)) {
                    pageNumbers.push(totalPages);
                  }
                }
                
                return pageNumbers.map((page, index) => {
                  if (page === '...') {
                    return (
                      <span key={`ellipsis-${index}`} className="px-3 py-1.5 text-gray-400">
                        ...
                      </span>
                    );
                  }
                  
                  const pageNum = page as number;
                  return (
                    <button 
                      key={pageNum}
                      className={`min-w-[32px] px-3 py-1.5 text-sm border rounded ${
                        currentPage === pageNum 
                          ? 'bg-green-600 text-white border-green-600 font-medium' 
                          : 'text-gray-600 border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                });
              })()}
              
              <button 
                className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={currentPage >= Math.ceil(totalLeads / leadsPerPage)}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </Card>

      <Modal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title="Lead Details"
        size="lg"
      >
        {selectedLead && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Contact Information</h4>
                <p className="text-lg font-semibold text-gray-900">{selectedLead.name}</p>
                <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                  <Mail className="w-3 h-3" />
                  {selectedLead.email}
                </p>
                <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                  <Phone className="w-3 h-3" />
                  {selectedLead.phone}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Property Details</h4>
                <p className="text-sm text-gray-900 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {selectedLead.address}
                </p>
                {selectedLead.latest_quote && selectedLead.latest_quote.roof_size_sqft && (
                  <p className="text-sm text-gray-900 mt-2">
                    <span className="font-medium">Roof Size:</span> {Math.round(selectedLead.latest_quote.roof_size_sqft).toLocaleString()} sq ft
                  </p>
                )}
              </div>
            </div>

            {selectedLead.latest_quote && (
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Quote Information</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Package</p>
                      <p className="text-sm font-semibold capitalize">{selectedLead.latest_quote.selected_tier}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Price per Sq Ft</p>
                      <p className="text-sm font-semibold">${selectedLead.latest_quote.price_per_sqft ? selectedLead.latest_quote.price_per_sqft.toFixed(2) : '0.00'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total Price</p>
                      <p className="text-lg font-bold text-green-600">{formatPrice(selectedLead.latest_quote.total_price)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Lead Status</h4>
              <div className="flex items-center justify-between">
                <span className={`text-sm px-3 py-1 rounded-full capitalize ${getStatusColor(selectedLead.status)}`}>
                  {selectedLead.status}
                </span>
                <p className="text-sm text-gray-500">
                  Created: {formatDate(selectedLead.created_at)}
                </p>
              </div>
            </div>

            {selectedLead.best_time_to_call && (
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Best Time to Call</h4>
                <p className="text-sm text-gray-900 capitalize">{selectedLead.best_time_to_call}</p>
              </div>
            )}

            {selectedLead.additional_notes && (
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Lead Notes</h4>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedLead.additional_notes}</p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                onClick={() => setViewModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleQuotePDF(selectedLead);
                }}
                className="px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
              <button
                onClick={() => {
                  handleQuoteEmail(selectedLead);
                  setViewModalOpen(false);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Email Quote
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditForm(null);
        }}
        title="Edit Lead"
        size="lg"
      >
        {editForm && (
          <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="new">New</option>
                  <option value="quoted">Quoted</option>
                  <option value="contacted">Contacted</option>
                  <option value="converted">Converted</option>
                  <option value="lost">Lost</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                value={editForm.address}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {editForm.latest_quote && (
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Quote Details</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Package Tier</label>
                    <select
                      value={editForm.latest_quote.selected_tier}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        latest_quote: { ...editForm.latest_quote!, selected_tier: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="good">Good</option>
                      <option value="better">Better</option>
                      <option value="best">Best</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Roof Size (sq ft)</label>
                    <input
                      type="number"
                      value={editForm.latest_quote.roof_size_sqft}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        latest_quote: { ...editForm.latest_quote!, roof_size_sqft: parseInt(e.target.value) }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Price</label>
                    <input
                      type="number"
                      value={editForm.latest_quote.total_price}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        latest_quote: { ...editForm.latest_quote!, total_price: parseFloat(e.target.value) }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => {
                  setEditModalOpen(false);
                  setEditForm(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </form>
        )}
      </Modal>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedLead(null);
        }}
        title="Confirm Delete"
        size="sm"
      >
        {selectedLead && (
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to delete the lead for <strong>{selectedLead.name}</strong>? This action cannot be undone.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">
                <strong>Warning:</strong> All data associated with this lead will be permanently deleted.
              </p>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setSelectedLead(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Lead
              </button>
            </div>
          </div>
        )}
      </Modal>

      <EmailQuoteModal
        isOpen={emailModalOpen}
        onClose={() => {
          setEmailModalOpen(false);
          setEmailModalLead(null);
        }}
        lead={emailModalLead}
        onSend={handleSendEmail}
      />
    </div>
  );
};

export default Leads;
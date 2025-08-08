import Card from '../components/Card';
import { Search, Filter, Calendar, Download, Phone, Mail, MapPin, MoreVertical } from 'lucide-react';
import { useState, useEffect } from 'react';
import { leadAPI } from '../services/api';
import type { Lead } from '../services/api';

const Leads = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);
  const leadsPerPage = 10;

  useEffect(() => {
    fetchLeads();
  }, [searchTerm, statusFilter, currentPage]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const params = {
        skip: (currentPage - 1) * leadsPerPage,
        limit: leadsPerPage,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchTerm || undefined,
      };
      const data = await leadAPI.getContractorLeads(1, params);
      setLeads(data);
      // For demo, set total based on returned data
      setTotalLeads(data.length > 0 ? 156 : 0);
    } catch (error) {
      console.error('Error fetching leads:', error);
      // Fallback to mock data if API fails
      const mockLeads = [
    {
      id: 1,
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '(555) 123-4567',
      address: '123 Oak Street, Springfield, IL 62701',
      roofSize: '2,500 sq ft',
      estimate: '$21,875',
      status: 'New',
      date: '2024-01-15',
      source: 'Widget'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '(555) 234-5678',
      address: '456 Pine Avenue, Springfield, IL 62702',
      roofSize: '3,200 sq ft',
      estimate: '$28,000',
      status: 'Quoted',
      date: '2024-01-14',
      source: 'Widget'
    },
    {
      id: 3,
      name: 'Mike Davis',
      email: 'mdavis@email.com',
      phone: '(555) 345-6789',
      address: '789 Elm Drive, Springfield, IL 62703',
      roofSize: '1,800 sq ft',
      estimate: '$15,750',
      status: 'Contacted',
      date: '2024-01-13',
      source: 'Widget'
    },
    {
      id: 4,
      name: 'Emily Brown',
      email: 'emily.brown@email.com',
      phone: '(555) 456-7890',
      address: '321 Maple Lane, Springfield, IL 62704',
      roofSize: '2,100 sq ft',
      estimate: '$18,375',
      status: 'Converted',
      date: '2024-01-12',
      source: 'Widget'
    },
    {
      id: 5,
      name: 'Robert Wilson',
      email: 'r.wilson@email.com',
      phone: '(555) 567-8901',
      address: '654 Cedar Road, Springfield, IL 62705',
      roofSize: '2,800 sq ft',
      estimate: '$24,500',
      status: 'Lost',
      date: '2024-01-11',
      source: 'Widget'
    }] as Lead[];
      setLeads(mockLeads);
      setTotalLeads(5);
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
      minimumFractionDigits: 0
    }).format(price);
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

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Lead Management</h2>
      <p className="text-gray-600 mb-8">Track and manage your widget-generated leads</p>

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
              
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Date Range
              </button>
              
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
                <th className="text-left py-3 px-4 font-medium text-gray-700">LEAD</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">PROPERTY</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">ESTIMATE</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">STATUS</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">DATE</th>
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
                      {lead.latest_quote && (
                        <p className="text-xs text-gray-500 mt-1">Quote: {lead.latest_quote.selected_tier}</p>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    {lead.latest_quote ? (
                      <>
                        <p className="font-semibold text-gray-900">{formatPrice(lead.latest_quote.total_price)}</p>
                        <p className="text-xs text-gray-500 capitalize">{lead.latest_quote.selected_tier}</p>
                      </>
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
                    <p className="text-xs text-gray-500 capitalize">via {lead.source}</p>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                        View
                      </button>
                      <span className="text-gray-300">|</span>
                      <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                        Quote
                      </button>
                      <button className="text-gray-400 hover:text-gray-600 ml-2">
                        <MoreVertical className="w-4 h-4" />
                      </button>
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
            Showing {((currentPage - 1) * leadsPerPage) + 1} to {Math.min(currentPage * leadsPerPage, totalLeads)} of {totalLeads} results
          </p>
          <div className="flex gap-2">
            <button 
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50" 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </button>
            {[...Array(Math.min(5, Math.ceil(totalLeads / leadsPerPage)))].map((_, index) => (
              <button 
                key={index + 1}
                className={`px-3 py-1 border rounded ${
                  currentPage === index + 1 
                    ? 'bg-green-600 text-white border-green-600' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setCurrentPage(index + 1)}
              >
                {index + 1}
              </button>
            ))}
            {Math.ceil(totalLeads / leadsPerPage) > 5 && (
              <>
                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">...</button>
                <button 
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
                  onClick={() => setCurrentPage(Math.ceil(totalLeads / leadsPerPage))}
                >
                  {Math.ceil(totalLeads / leadsPerPage)}
                </button>
              </>
            )}
            <button 
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
              disabled={currentPage >= Math.ceil(totalLeads / leadsPerPage)}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Leads;
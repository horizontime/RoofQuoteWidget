import Card from '../components/Card';
import { TrendingUp, FileText, DollarSign, Users, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyticsAPI } from '../services/api';
import type { Lead } from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState({
    totalLeads: 0,
    quotesGenerated: 0,
    conversionRate: 0,
    avgQuoteValue: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch recent leads
      const leads = await analyticsAPI.getRecentLeads(1, 4);
      // Sort leads by newest first
      const sortedLeads = [...leads].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setRecentLeads(sortedLeads);
      
      // Fetch dashboard stats from the database
      try {
        const stats = await analyticsAPI.getDashboardStats(1, 30);
        
        // Calculate conversion rate based on lead statuses
        const convertedLeads = stats.lead_status.converted || 0;
        const totalLeads = stats.summary.total_leads || 0;
        const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
        
        setStatsData({
          totalLeads: stats.summary.total_leads,
          quotesGenerated: stats.summary.total_quotes,
          conversionRate: Math.round(conversionRate),
          avgQuoteValue: Math.round(stats.summary.average_quote_value)
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        // If stats API fails, calculate from leads if available
        if (leads && leads.length > 0) {
          const totalLeads = leads.length;
          const quotesGenerated = leads.filter((lead: Lead) => lead.latest_quote).length;
          const convertedLeads = leads.filter((lead: Lead) => lead.status === 'converted').length;
          const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
          
          const totalValue = leads.reduce((sum: number, lead: Lead) => {
            return sum + (lead.latest_quote?.total_price || 0);
          }, 0);
          const avgQuoteValue = quotesGenerated > 0 ? totalValue / quotesGenerated : 0;
          
          setStatsData({
            totalLeads,
            quotesGenerated,
            conversionRate: Math.round(conversionRate),
            avgQuoteValue: Math.round(avgQuoteValue)
          });
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set empty data on error
      setRecentLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);

    if (diffSeconds < 60) {
      return 'Just now';
    } else if (diffMinutes < 60) {
      if (diffMinutes === 1) {
        return '1 min ago';
      } else {
        return `${diffMinutes} mins ago`;
      }
    } else if (diffHours < 24) {
      if (diffHours === 1) {
        return '1 hr ago';
      } else {
        return `${diffHours} hrs ago`;
      }
    } else if (diffDays < 7) {
      if (diffDays === 1) {
        return '1 day ago';
      } else {
        return `${diffDays} days ago`;
      }
    } else if (diffWeeks < 4) {
      if (diffWeeks === 1) {
        return '1 week ago';
      } else {
        return `${diffWeeks} weeks ago`;
      }
    } else if (diffMonths < 12) {
      if (diffMonths === 1) {
        return '1 month ago';
      } else {
        return `${diffMonths} months ago`;
      }
    } else {
      return date.toLocaleDateString();
    }
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

  const stats = [
    { label: 'Total Leads', value: statsData.totalLeads.toString(), icon: Users, change: '+12%' },
    { label: 'Quotes Generated', value: statsData.quotesGenerated.toString(), icon: FileText, change: '+8%' },
    { label: 'Conversion Rate', value: `${statsData.conversionRate}%`, icon: TrendingUp, change: '+3%' },
    { label: 'Avg. Quote Value', value: `$${statsData.avgQuoteValue.toLocaleString()}`, icon: DollarSign, change: '+15%' }
  ];

  return (
    <div>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Roof Quote Pro</h2>
          <p className="text-gray-600">Manage your instant roof quote widget and track leads</p>
        </div>
        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-sm text-green-600 mt-2">{stat.change} from last month</p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <Icon className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Quick Setup">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Pricing Configuration</span>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Complete</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Brand Customization</span>
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">In Progress</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Widget Deployment</span>
              <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">Pending</span>
            </div>
            <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors">
              Continue Setup
            </button>
          </div>
        </Card>

        <Card title="Recent Leads">
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-4 text-gray-500">
                Loading leads...
              </div>
            ) : recentLeads.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No leads yet
              </div>
            ) : (
              recentLeads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                     onClick={() => navigate('/leads')}>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{lead.name}</p>
                    <p className="text-xs text-gray-600">{lead.address}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded capitalize ${getStatusColor(lead.status)}`}>
                      {lead.status}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(lead.created_at)}</p>
                  </div>
                </div>
              ))
            )}
            <button 
              onClick={() => navigate('/leads')}
              className="w-full text-green-600 text-sm font-medium py-2 hover:text-green-700 transition-colors">
              View All Leads →
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
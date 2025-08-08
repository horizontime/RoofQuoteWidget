import Card from '../components/Card';
import { TrendingUp, FileText, DollarSign, Users } from 'lucide-react';

const Dashboard = () => {
  const stats = [
    { label: 'Total Leads', value: '156', icon: Users, change: '+12%' },
    { label: 'Quotes Generated', value: '89', icon: FileText, change: '+8%' },
    { label: 'Conversion Rate', value: '57%', icon: TrendingUp, change: '+3%' },
    { label: 'Avg. Quote Value', value: '$8,450', icon: DollarSign, change: '+15%' }
  ];

  const recentLeads = [
    { name: 'John Smith', address: '123 Oak St', date: '2 hours ago', status: 'New' },
    { name: 'Sarah Johnson', address: '456 Pine Ave', date: '5 hours ago', status: 'Quoted' },
    { name: 'Mike Davis', address: '789 Elm Dr', date: '1 day ago', status: 'Contacted' },
    { name: 'Emily Brown', address: '321 Maple Ln', date: '2 days ago', status: 'Converted' }
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Roof Quote Pro</h2>
      <p className="text-gray-600 mb-8">Manage your instant roof quote widget and track leads</p>

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
            {recentLeads.map((lead, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{lead.name}</p>
                  <p className="text-xs text-gray-600">{lead.address}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-1 rounded ${
                    lead.status === 'New' ? 'bg-blue-100 text-blue-800' :
                    lead.status === 'Quoted' ? 'bg-yellow-100 text-yellow-800' :
                    lead.status === 'Contacted' ? 'bg-purple-100 text-purple-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {lead.status}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">{lead.date}</p>
                </div>
              </div>
            ))}
            <button className="w-full text-green-600 text-sm font-medium py-2 hover:text-green-700 transition-colors">
              View All Leads →
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
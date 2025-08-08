import { Outlet, NavLink } from 'react-router-dom';

const Layout = () => {
  const navItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/pricing', label: 'Pricing Setup' },
    { path: '/branding', label: 'Branding' },
    { path: '/templates', label: 'Templates' },
    { path: '/widget', label: 'Widget' },
    { path: '/leads', label: 'Leads' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-green-600">Roof Quote Pro</h1>
            </div>
            <nav className="flex space-x-8">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-green-600 border-b-2 border-green-600'
                        : 'text-gray-700 hover:text-green-600'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
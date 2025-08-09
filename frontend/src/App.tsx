import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import PricingSetup from './pages/PricingSetup';
import Branding from './pages/Branding';
import Templates from './pages/Templates';
import Widget from './pages/Widget';
import Leads from './pages/Leads';
import WidgetFlow from './pages/WidgetFlow';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="pricing" element={<PricingSetup />} />
          <Route path="branding" element={<Branding />} />
          <Route path="templates" element={<Templates />} />
          <Route path="widget" element={<Widget />} />
          <Route path="leads" element={<Leads />} />
        </Route>
        <Route path="/widget-preview" element={<WidgetFlow />} />
      </Routes>
    </Router>
  );
}

export default App

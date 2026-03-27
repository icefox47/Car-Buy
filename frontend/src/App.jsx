import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Car } from 'lucide-react';
import Home from './pages/Home';
import Wizard from './pages/Wizard';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

// Layout wrapper to conditionally show navbar
const Layout = ({ children }) => {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="app-container">
      {!isAdminPage && (
        <nav className="navbar">
          <Link to="/" className="navbar-brand">
            <Car size={32} color="var(--accent-primary)" />
            <span>CarFinder</span>
          </Link>
          <ul className="navbar-nav">
            <li><Link to="/" className="nav-link text-white">Home</Link></li>
            <li><a href="/#features" className="nav-link">Features</a></li>
            <li><a href="/#how-it-works" className="nav-link">How It Works</a></li>
            <li>
              <Link to="/wizard" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
                Find Your Car
              </Link>
            </li>
          </ul>
        </nav>
      )}
      <main>{children}</main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/wizard" element={<Wizard />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LogOut, Users, Car, Filter, Search, 
  ChevronRight, ChevronLeft, Download, RefreshCw,
  ExternalLink, Calendar, Phone, Hash, Fuel, Briefcase
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [inquiries, setInquiries] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    setIsRefreshing(true);
    const token = localStorage.getItem('admin_token');
    
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
      const [statsRes, inquiriesRes] = await Promise.all([
        fetch(`${baseUrl}/api/admin/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${baseUrl}/api/admin/inquiries?page=${page}&search=${searchTerm}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (statsRes.status === 401 || inquiriesRes.status === 401) {
        handleLogout();
        return;
      }

      const statsData = await statsRes.json();
      const inquiriesData = await inquiriesRes.json();

      setStats(statsData);
      setInquiries(inquiriesData.inquiries);
      setTotalPages(inquiriesData.total_pages);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [page, searchTerm]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_username');
    navigate('/admin/login');
  };

  const exportToCSV = () => {
    if (!inquiries.length) return;
    
    const headers = ['ID', 'Name', 'Phone', 'Make', 'Type', 'Condition', 'Year', 'Fuel', 'Price Range', 'Date'];
    const csvRows = [
      headers.join(','),
      ...inquiries.map(i => [
        i.id,
        `"${i.name}"`,
        `"${i.phone}"`,
        i.make,
        i.type,
        i.condition,
        i.year,
        i.fuel,
        `"${i.budget}"`,
        new Date(i.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvRows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `carfinder_leads_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading && !isRefreshing) {
    return (
      <div className="admin-loading">
        <RefreshCw className="spinner" size={48} color="var(--accent-primary)" />
        <p>Initializing Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <Helmet>
        <title>Admin Dashboard | CarFinder</title>
      </Helmet>

      {/* Sidebar */}
      <aside className="admin-sidebar glass-panel">
        <div className="sidebar-header">
          <Car size={32} color="var(--accent-primary)" />
          <h2 className="title-gradient">CarFinder</h2>
        </div>
        
        <nav className="sidebar-nav">
          <div className="nav-item active">
            <Users size={20} />
            <span>Inquiries</span>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <p className="username">{localStorage.getItem('admin_username') || 'Admin'}</p>
            <p className="role">Administrator</p>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="main-header">
          <div>
            <h1>Dashboard Overview</h1>
            <p className="text-secondary">Manage and track user inquiries</p>
          </div>
          <div className="header-actions">
            <button className="btn btn-secondary" onClick={() => fetchDashboardData()}>
              <RefreshCw size={18} className={isRefreshing ? 'spinner' : ''} />
              Refresh
            </button>
            <button className="btn btn-primary" onClick={exportToCSV}>
              <Download size={18} />
              Export CSV
            </button>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="stats-grid">
          <motion.div 
            className="stat-card glass-panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="stat-icon-bg"><Users size={24} /></div>
            <div className="stat-info">
              <h3>{stats?.total_inquiries || 0}</h3>
              <p>Total Leads</p>
            </div>
          </motion.div>

          <motion.div 
            className="stat-card glass-panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="stat-icon-bg"><Calendar size={24} /></div>
            <div className="stat-info">
              <h3>{stats?.today_count || 0}</h3>
              <p>New Today</p>
            </div>
          </motion.div>

          <motion.div 
            className="stat-card glass-panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="stat-icon-bg"><Car size={24} /></div>
            <div className="stat-info">
              <h3>{stats?.top_make.name || 'N/A'}</h3>
              <p>Popular Make ({stats?.top_make.count || 0})</p>
            </div>
          </motion.div>

          <motion.div 
            className="stat-card glass-panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="stat-icon-bg"><Filter size={24} /></div>
            <div className="stat-info">
              <h3>{stats?.top_type.name || 'N/A'}</h3>
              <p>Popular Type ({stats?.top_type.count || 0})</p>
            </div>
          </motion.div>
        </div>

        {/* Filters and Table */}
        <section className="table-section glass-panel">
          <div className="table-header">
            <div className="search-bar">
              <Search size={18} />
              <input 
                type="text" 
                placeholder="Search by name, phone, or make..." 
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>

          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Vehicle Interest</th>
                  <th>Preferred Fuel</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {inquiries.length > 0 ? (
                  inquiries.map((inquiry) => (
                    <tr key={inquiry.id}>
                      <td>#{inquiry.id}</td>
                      <td>
                        <div className="user-cell">
                          <p className="user-name">{inquiry.name}</p>
                          <p className="user-phone">{inquiry.phone}</p>
                        </div>
                      </td>
                      <td>
                        <div className="vehicle-cell">
                          <p>{inquiry.make} {inquiry.type}</p>
                          <p className="text-muted">{inquiry.condition} • {inquiry.year || 'N/A'}</p>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${inquiry.fuel}`}>{inquiry.fuel}</span>
                      </td>
                      <td>{new Date(inquiry.created_at).toLocaleDateString()}</td>
                      <td>
                        <button 
                          className="btn-view" 
                          onClick={() => setSelectedInquiry(inquiry)}
                        >
                          Details <ChevronRight size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      <p className="text-secondary">No inquiries found matching your criteria.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="table-footer">
            <p>Page {page} of {totalPages}</p>
            <div className="pagination">
              <button 
                disabled={page <= 1} 
                onClick={() => setPage(page - 1)}
                className="btn-page"
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                disabled={page >= totalPages} 
                onClick={() => setPage(page + 1)}
                className="btn-page"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Details Side Panel */}
      <AnimatePresence>
        {selectedInquiry && (
          <>
            <motion.div 
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedInquiry(null)}
            />
            <motion.div 
              className="details-panel glass-panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="panel-header">
                <h2>Inquiry Details</h2>
                <button className="btn-close" onClick={() => setSelectedInquiry(null)}>×</button>
              </div>

              <div className="panel-body">
                <div className="detail-section">
                  <h4 className="section-label">Customer Information</h4>
                  <div className="detail-item">
                    <Users size={18} />
                    <div>
                      <p className="label">Full Name</p>
                      <p className="value">{selectedInquiry.name}</p>
                    </div>
                  </div>
                  <div className="detail-item">
                    <Phone size={18} />
                    <div>
                      <p className="label">Phone Number</p>
                      <p className="value">{selectedInquiry.phone}</p>
                    </div>
                  </div>
                </div>

                <div className="detail-separator" />

                <div className="detail-section">
                  <h4 className="section-label">Vehicle Preferences</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <Car size={18} />
                      <div>
                        <p className="label">Make & Type</p>
                        <p className="value">{selectedInquiry.make} {selectedInquiry.type}</p>
                      </div>
                    </div>
                    <div className="detail-item">
                      <Hash size={18} />
                      <div>
                        <p className="label">Year & Condition</p>
                        <p className="value">{selectedInquiry.year} • {selectedInquiry.condition}</p>
                      </div>
                    </div>
                    <div className="detail-item">
                      <Fuel size={18} />
                      <div>
                        <p className="label">Fuel & Transmission</p>
                        <p className="value">{selectedInquiry.fuel} • {selectedInquiry.transmission}</p>
                      </div>
                    </div>
                    <div className="detail-item">
                      <Briefcase size={18} />
                      <div>
                        <p className="label">Budget Range</p>
                        <p className="value" style={{ color: 'var(--accent-primary)' }}>{selectedInquiry.budget}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="detail-separator" />

                <div className="detail-section">
                    <h4 className="section-label">Submission Info</h4>
                    <p className="text-secondary" style={{fontSize: '0.9rem'}}>
                        Submitted on {new Date(selectedInquiry.created_at).toLocaleString()}
                    </p>
                </div>
              </div>

              <div className="panel-footer">
                <button className="btn btn-primary w-100" onClick={() => window.open(`tel:${selectedInquiry.phone}`)}>
                  <Phone size={18} /> Call Customer
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;

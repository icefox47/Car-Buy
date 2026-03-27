import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('admin_token');

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  // Basic JWT expiry check (decode payload without verification)
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp * 1000 < Date.now()) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_username');
      return <Navigate to="/admin/login" replace />;
    }
  } catch {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_username');
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default ProtectedRoute;

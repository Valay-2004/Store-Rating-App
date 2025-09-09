import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import LoginForm from '../components/forms/LoginForm';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated()) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state]);

  const handleLogin = async (formData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authAPI.login(formData);
      const { user, token } = response.data;
      
      login(user, token);
      
      // Redirect to intended page or dashboard
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      setError(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Login failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Sign In</h1>
            <p>Welcome back to Store Rating System</p>
          </div>

          <LoginForm 
            onSubmit={handleLogin}
            loading={loading}
            error={error}
          />

          <div className="auth-footer">
            <p>
              Don't have an account? 
              <Link to="/register" className="auth-link">
                Sign up here
              </Link>
            </p>
          </div>

          <div className="demo-accounts">
            <h3>Demo Accounts</h3>
            <div className="demo-account">
              <strong>Admin:</strong> admin@example.com / Admin@123
            </div>
            <div className="demo-account">
              <strong>User:</strong> john@example.com / Admin@123
            </div>
            <div className="demo-account">
              <strong>Store Owner:</strong> owner@techstore.com / Admin@123
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

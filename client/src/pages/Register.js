import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import RegisterForm from '../components/forms/RegisterForm';

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated()) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleRegister = async (formData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authAPI.register(formData);
      const { user, token } = response.data;
      
      login(user, token);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Registration error:', error);
      setError(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Registration failed. Please try again.'
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
            <h1>Create Account</h1>
            <p>Join Store Rating System</p>
          </div>

          <RegisterForm 
            onSubmit={handleRegister}
            loading={loading}
            error={error}
          />

          <div className="auth-footer">
            <p>
              Already have an account? 
              <Link to="/login" className="auth-link">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

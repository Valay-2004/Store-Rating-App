import React, { useState } from 'react';
import { validateEmail, validatePassword, validateName, validateAddress } from '../../utils/validation';

const RegisterForm = ({ onSubmit, loading = false, error = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    const nameError = validateName(formData.name);
    if (nameError) newErrors.name = nameError;
    
    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;
    
    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    const addressError = validateAddress(formData.address);
    if (addressError) newErrors.address = addressError;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const { confirmPassword, ...submitData } = formData;
      onSubmit(submitData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="register-form">
      <div className="form-group">
        <label htmlFor="name">Full Name *</label>
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          className={errors.name ? 'form-input error' : 'form-input'}
          placeholder="Enter your full name (20-60 characters)"
          disabled={loading}
        />
        {errors.name && <span className="error-text">{errors.name}</span>}
        <small className="form-help">Must be 20-60 characters, letters and spaces only</small>
      </div>

      <div className="form-group">
        <label htmlFor="email">Email Address *</label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          className={errors.email ? 'form-input error' : 'form-input'}
          placeholder="Enter your email address"
          disabled={loading}
        />
        {errors.email && <span className="error-text">{errors.email}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="password">Password *</label>
        <input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          className={errors.password ? 'form-input error' : 'form-input'}
          placeholder="Enter your password"
          disabled={loading}
        />
        {errors.password && <span className="error-text">{errors.password}</span>}
        <small className="form-help">8-16 characters, at least one uppercase letter and one special character</small>
      </div>

      <div className="form-group">
        <label htmlFor="confirmPassword">Confirm Password *</label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          className={errors.confirmPassword ? 'form-input error' : 'form-input'}
          placeholder="Confirm your password"
          disabled={loading}
        />
        {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="address">Address</label>
        <textarea
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          className={errors.address ? 'form-input error' : 'form-input'}
          placeholder="Enter your address (optional)"
          rows="3"
          disabled={loading}
        />
        {errors.address && <span className="error-text">{errors.address}</span>}
        <small className="form-help">Maximum 400 characters (optional)</small>
      </div>

      {error && <div className="form-error">{error}</div>}

      <button 
        type="submit" 
        className="btn btn-primary btn-block"
        disabled={loading}
      >
        {loading ? 'Creating Account...' : 'Create Account'}
      </button>
    </form>
  );
};

export default RegisterForm;

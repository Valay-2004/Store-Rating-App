import React, { useState } from 'react';
import { validatePassword } from '../../utils/validation';

const PasswordUpdateForm = ({ onSubmit, loading = false, error = null, success = null }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
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
    
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    const passwordError = validatePassword(formData.newPassword);
    if (passwordError) newErrors.newPassword = passwordError;
    
    if (!formData.confirmNewPassword) {
      newErrors.confirmNewPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmNewPassword) {
      newErrors.confirmNewPassword = 'New passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const { confirmNewPassword, ...submitData } = formData;
      onSubmit(submitData);
    }
  };

  const resetForm = () => {
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: ''
    });
    setErrors({});
  };

  // Reset form when success
  React.useEffect(() => {
    if (success) {
      resetForm();
    }
  }, [success]);

  return (
    <form onSubmit={handleSubmit} className="password-update-form">
      <div className="form-group">
        <label htmlFor="currentPassword">Current Password *</label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          value={formData.currentPassword}
          onChange={handleChange}
          className={errors.currentPassword ? 'form-input error' : 'form-input'}
          placeholder="Enter your current password"
          disabled={loading}
        />
        {errors.currentPassword && <span className="error-text">{errors.currentPassword}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="newPassword">New Password *</label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          value={formData.newPassword}
          onChange={handleChange}
          className={errors.newPassword ? 'form-input error' : 'form-input'}
          placeholder="Enter your new password"
          disabled={loading}
        />
        {errors.newPassword && <span className="error-text">{errors.newPassword}</span>}
        <small className="form-help">8-16 characters, at least one uppercase letter and one special character</small>
      </div>

      <div className="form-group">
        <label htmlFor="confirmNewPassword">Confirm New Password *</label>
        <input
          id="confirmNewPassword"
          name="confirmNewPassword"
          type="password"
          value={formData.confirmNewPassword}
          onChange={handleChange}
          className={errors.confirmNewPassword ? 'form-input error' : 'form-input'}
          placeholder="Confirm your new password"
          disabled={loading}
        />
        {errors.confirmNewPassword && <span className="error-text">{errors.confirmNewPassword}</span>}
      </div>

      {success && <div className="form-success">{success}</div>}
      {error && <div className="form-error">{error}</div>}

      <div className="form-actions">
        <button 
          type="button"
          onClick={resetForm}
          className="btn btn-secondary"
          disabled={loading}
        >
          Reset
        </button>
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </div>
    </form>
  );
};

export default PasswordUpdateForm;

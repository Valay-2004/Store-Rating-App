// Validation patterns
export const patterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,16}$/,
  name: /^[a-zA-Z\s]+$/
};

// Validation functions
export const validateEmail = (email) => {
  if (!email) return 'Email is required';
  if (!patterns.email.test(email)) return 'Please enter a valid email address';
  return null;
};

export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (password.length > 16) return 'Password must not exceed 16 characters';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return 'Password must contain at least one special character';
  return null;
};

export const validateName = (name) => {
  if (!name) return 'Name is required';
  if (name.length < 20) return 'Name must be at least 20 characters';
  if (name.length > 60) return 'Name must not exceed 60 characters';
  if (!patterns.name.test(name)) return 'Name can only contain letters and spaces';
  return null;
};

export const validateAddress = (address) => {
  if (address && address.length > 400) return 'Address must not exceed 400 characters';
  return null;
};

export const validateRating = (rating) => {
  if (!rating) return 'Rating is required';
  const numRating = Number(rating);
  if (isNaN(numRating) || numRating < 1 || numRating > 5) return 'Rating must be between 1 and 5';
  return null;
};

// Form validation helper
export const validateForm = (values, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const rule = rules[field];
    const value = values[field];
    
    if (rule.required && (!value || value.trim() === '')) {
      errors[field] = `${field} is required`;
      return;
    }
    
    if (value && rule.validate) {
      const error = rule.validate(value);
      if (error) {
        errors[field] = error;
      }
    }
  });
  
  return errors;
};

// Custom hook for form validation
export const useFormValidation = (initialValues, validationRules) => {
  const [values, setValues] = React.useState(initialValues);
  const [errors, setErrors] = React.useState({});
  const [touched, setTouched] = React.useState({});

  const handleChange = (name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate field on blur
    if (validationRules[name]) {
      const rule = validationRules[name];
      const value = values[name];
      
      if (rule.validate) {
        const error = rule.validate(value);
        setErrors(prev => ({ ...prev, [name]: error }));
      }
    }
  };

  const validateAll = () => {
    const formErrors = validateForm(values, validationRules);
    setErrors(formErrors);
    setTouched(Object.keys(validationRules).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {}));
    
    return Object.keys(formErrors).length === 0;
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    reset,
    isValid: Object.keys(errors).length === 0
  };
};

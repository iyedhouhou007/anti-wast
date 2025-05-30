export const validateEmail = (email) => {
  if (!email) return "Email is required";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "Invalid email format";
  return "";
};

export const validatePassword = (password) => {
  if (!password) return "Password is required";
  if (password.length < 6) return "Password must be at least 6 characters";
  return "";
};

export const validateUsername = (username) => {
  if (!username) return "Username is required";
  if (username.length < 3) return "Username must be at least 3 characters";
  return "";
};

export const validatePhone = (phone) => {
  if (!phone) return "";
  const phoneRegex = /^\+?[\d\s-]{8,}$/;
  if (!phoneRegex.test(phone)) return "Invalid phone number format";
  return "";
};

export const validateForm = (values, fields) => {
  const errors = {};

  Object.keys(fields).forEach((field) => {
    const validationRules = fields[field];
    const value = values[field];

    if (validationRules.required && !value) {
      errors[field] = `${
        field.charAt(0).toUpperCase() + field.slice(1)
      } is required`;
      return;
    }

    if (
      validationRules.minLength &&
      value?.length < validationRules.minLength
    ) {
      errors[field] = `${
        field.charAt(0).toUpperCase() + field.slice(1)
      } must be at least ${validationRules.minLength} characters`;
      return;
    }

    if (
      validationRules.maxLength &&
      value?.length > validationRules.maxLength
    ) {
      errors[field] = `${
        field.charAt(0).toUpperCase() + field.slice(1)
      } must be at most ${validationRules.maxLength} characters`;
      return;
    }

    if (validationRules.pattern && !validationRules.pattern.test(value)) {
      errors[field] = validationRules.message || `Invalid ${field} format`;
      return;
    }

    if (validationRules.validate) {
      const error = validationRules.validate(value);
      if (error) {
        errors[field] = error;
      }
    }
  });

  return errors;
};

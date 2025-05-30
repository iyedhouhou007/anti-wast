// Basic string validation
export const validateString = (
  value,
  { required = false, minLength = 0, maxLength = Infinity } = {}
) => {
  if (!value && required) {
    return "Ce champ est obligatoire";
  }
  if (!value) return "";

  if (typeof value !== "string") {
    return "La valeur doit être une chaîne de caractères";
  }

  if (value.length < minLength) {
    return `Minimum ${minLength} caractères requis`;
  }

  if (value.length > maxLength) {
    return `Maximum ${maxLength} caractères autorisés`;
  }

  return "";
};

// Email validation
export const validateEmail = (email, required = false) => {
  if (!email && required) {
    return "L'email est obligatoire";
  }
  if (!email) return "";

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Email invalide";
  }

  return "";
};

// Password validation
export const validatePassword = (password, { required = false } = {}) => {
  if (!password && required) {
    return "Le mot de passe est obligatoire";
  }
  if (!password) return "";

  if (password.length < 8) {
    return "Le mot de passe doit contenir au moins 8 caractères";
  }

  if (!/[A-Z]/.test(password)) {
    return "Le mot de passe doit contenir au moins une majuscule";
  }

  if (!/[a-z]/.test(password)) {
    return "Le mot de passe doit contenir au moins une minuscule";
  }

  if (!/[0-9]/.test(password)) {
    return "Le mot de passe doit contenir au moins un chiffre";
  }

  return "";
};

// Phone number validation (Tunisia)
export const validatePhone = (phone, required = false) => {
  if (!phone && required) {
    return "Le numéro de téléphone est obligatoire";
  }
  if (!phone) return "";

  const phoneRegex = /^(\+216|216)?[2579][0-9]{7}$/;
  if (!phoneRegex.test(phone.replace(/\s/g, ""))) {
    return "Numéro de téléphone invalide";
  }

  return "";
};

// Price validation
export const validatePrice = (
  price,
  { required = false, min = 0, max = Infinity } = {}
) => {
  if (price === null || price === undefined) {
    if (required) return "Le prix est obligatoire";
    return "";
  }

  const numPrice = Number(price);
  if (isNaN(numPrice)) {
    return "Le prix doit être un nombre";
  }

  if (numPrice < min) {
    return `Le prix minimum est ${min}`;
  }

  if (numPrice > max) {
    return `Le prix maximum est ${max}`;
  }

  return "";
};

// Date validation
export const validateDate = (date, { required = false, min, max } = {}) => {
  if (!date && required) {
    return "La date est obligatoire";
  }
  if (!date) return "";

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return "Date invalide";
  }

  if (min && dateObj < new Date(min)) {
    return `La date doit être après ${new Date(min).toLocaleDateString()}`;
  }

  if (max && dateObj > new Date(max)) {
    return `La date doit être avant ${new Date(max).toLocaleDateString()}`;
  }

  return "";
};

// Image validation
export const validateImage = (
  file,
  { required = false, maxSize = 5 * 1024 * 1024 } = {}
) => {
  if (!file && required) {
    return "L'image est obligatoire";
  }
  if (!file) return "";

  const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (!validTypes.includes(file.type)) {
    return "Format d'image non supporté. Utilisez JPG, PNG, GIF ou WebP";
  }

  if (file.size > maxSize) {
    return `L'image doit faire moins de ${Math.round(
      maxSize / (1024 * 1024)
    )}MB`;
  }

  return "";
};

// Location validation
export const validateLocation = (location, required = false) => {
  if (!location && required) {
    return "La localisation est obligatoire";
  }
  if (!location) return "";

  if (!location.coordinates || !Array.isArray(location.coordinates)) {
    return "Format de localisation invalide";
  }

  const [longitude, latitude] = location.coordinates;

  if (typeof longitude !== "number" || longitude < -180 || longitude > 180) {
    return "Longitude invalide";
  }

  if (typeof latitude !== "number" || latitude < -90 || latitude > 90) {
    return "Latitude invalide";
  }

  return "";
};

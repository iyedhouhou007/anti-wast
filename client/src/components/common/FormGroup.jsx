import ValidationError from './ValidationError';
import './FormGroup.css';

export default function FormGroup({
  label,
  id,
  error,
  children,
  required,
  helperText
}) {
  return (
    <div className="form-group">
      {label && (
        <label 
          htmlFor={id}
          className="form-group-label"
        >
          {label}
          {required && <span className="form-group-required">*</span>}
        </label>
      )}
      {children}
      {helperText && (
        <p className="form-group-helper">{helperText}</p>
      )}
      <ValidationError error={error} />
    </div>
  );
}
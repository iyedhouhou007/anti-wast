import './ValidationError.css';

export default function ValidationError({ error }) {
  if (!error) return null;

  return (
    <p className="validation-error" role="alert">
      {error}
    </p>
  );
}
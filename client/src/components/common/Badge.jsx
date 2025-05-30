import './Badge.css';

const variants = {
  fresh: 'badge-fresh',
  day_old: 'badge-day-old',
  stale: 'badge-stale',
  reserved: 'badge-reserved',
  completed: 'badge-completed',
  default: 'badge-default'
};

const sizes = {
  sm: 'badge-sm',
  md: 'badge-md',
  lg: 'badge-lg'
};

export default function Badge({
  variant = 'default',
  size = 'md',
  children,
  className = ''
}) {
  return (
    <span
      className={`badge ${variants[variant] || variants.default} ${sizes[size]} ${className}`}
    >
      {children}
    </span>
  );
}
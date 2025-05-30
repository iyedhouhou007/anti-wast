import './Avatar.css';

export default function Avatar({
  src,
  alt,
  size = 'md',
  className = ''
}) {
  const sizes = {
    xs: 'avatar-xs',
    sm: 'avatar-sm',
    md: 'avatar-md',
    lg: 'avatar-lg',
    xl: 'avatar-xl',
    '2xl': 'avatar-2xl'
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!src) {
    return (
      <div
        className={`${sizes[size]} ${className} avatar-placeholder`}
      >
        <span className={`avatar-placeholder-text ${size === 'xs' ? 'avatar-placeholder-text-xs' : 'avatar-placeholder-text-sm'}`}>
          {getInitials(alt)}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`${sizes[size]} ${className} avatar`}
    />
  );
}
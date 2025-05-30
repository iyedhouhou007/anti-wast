import React from 'react';

const DefaultAvatar = ({ size = 56, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="60" cy="60" r="60" fill="#E5E7EB" />
      <circle cx="60" cy="45" r="20" fill="#9CA3AF" />
      <path
        d="M60 75C43.4315 75 30 88.4315 30 105C30 105 41.6667 115 60 115C78.3333 115 90 105 90 105C90 88.4315 76.5685 75 60 75Z"
        fill="#9CA3AF"
      />
    </svg>
  );
};

export default DefaultAvatar; 
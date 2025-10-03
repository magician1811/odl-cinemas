import React from 'react';

interface Props {
  rating: number; // 0-5 (can be fractional)
  onRate?: (value: number) => void; // if provided, component is interactive
  size?: number;
}

const StarRating: React.FC<Props> = ({ rating, onRate, size = 24 }) => {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;
  const stars = Array.from({ length: 5 }, (_, i) => {
    const filled = i < fullStars || (i === fullStars && hasHalf);
    return (
      <svg
        key={i}
        onClick={onRate ? () => onRate(i + 1) : undefined}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={filled ? '#facc15' : 'none'}
        stroke="#facc15"
        strokeWidth={2}
        className={onRate ? 'cursor-pointer' : ''}
        style={{ width: size, height: size }}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l2.062 6.319a1 1 0 00.95.69h6.634c.969 0 1.371 1.24.588 1.81l-5.368 3.903a1 1 0 00-.364 1.118l2.062 6.318c.3.922-.755 1.688-1.54 1.118l-5.368-3.902a1 1 0 00-1.176 0l-5.368 3.902c-.784.57-1.838-.196-1.54-1.118l2.062-6.318a1 1 0 00-.364-1.118L.817 11.746c-.783-.57-.38-1.81.588-1.81h6.634a1 1 0 00.95-.69l2.06-6.32z"
        />
      </svg>
    );
  });
  return <div className="flex space-x-1">{stars}</div>;
};

export default StarRating;
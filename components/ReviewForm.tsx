import React, { useState } from 'react';
import { addReview } from '../services/reviewService';
import { Review } from '../types';
import StarRating from './StarRating';
import { useAuth } from '../context/AuthContext';
// ... existing code ...

interface Props {
  movieId: string;
  onSubmit?: () => void;
}

const ReviewForm: React.FC<Props> = ({ movieId, onSubmit }) => {
  const { isAuthenticated, user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  if (!isAuthenticated || !user) {
    return <p className="text-gray-400 text-sm">Please log in to leave a review.</p>;
  }

  const handleSubmit = () => {
    if (rating === 0) {
      setError('Please select a star rating');
      return;
    }

    const newReview: Review = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      movieId,
      userId: user.id,
      rating,
      comment,
      createdAt: new Date().toISOString(),
    };
    addReview(newReview);
    setRating(0);
    setComment('');
    setError('');
    onSubmit?.();
  };

  return (
    <div className="mt-4">
      <h3 className="font-semibold mb-2">Leave a Review</h3>
      <StarRating rating={rating} onRate={setRating} size={28} />
      <textarea
        className="w-full mt-2 p-2 rounded bg-gray-800 border border-gray-700"
        rows={3}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Write your thoughts..."
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      <button
        onClick={handleSubmit}
        className="mt-2 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 px-4 rounded"
      >
        Submit Review
      </button>
    </div>
  );
};

export default ReviewForm;
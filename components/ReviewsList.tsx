import React, { useEffect, useState } from 'react';
import { Review } from '../types';
import { getReviewsForMovie } from '../services/reviewService';
import StarRating from './StarRating';
import ReviewForm from './ReviewForm';

interface Props {
  movieId: string;
}

const ReviewsList: React.FC<Props> = ({ movieId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);

  const refresh = () => {
    setReviews(getReviewsForMovie(movieId));
  };

  useEffect(() => {
    refresh();
  }, [movieId]);

  const averageRating =
    reviews.reduce((sum, r) => sum + r.rating, 0) / (reviews.length || 1);

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 mb-2">
        <StarRating rating={averageRating} size={20} />
        <span className="text-sm text-gray-400">{averageRating.toFixed(1)} / 5</span>
        <span className="text-sm text-gray-500">({reviews.length} reviews)</span>
      </div>
      {reviews.length === 0 ? (
        <p className="text-gray-400 text-sm">No reviews yet.</p>
      ) : (
        <ul className="space-y-3 max-h-60 overflow-auto pr-2">
          {reviews.map((r) => (
            <li key={r.id} className="bg-gray-800 p-3 rounded">
              <div className="flex items-center gap-2 mb-1">
                <StarRating rating={r.rating} size={16} />
                <span className="text-xs text-gray-500">
                  {new Date(r.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm">{r.comment}</p>
            </li>
          ))}
        </ul>
      )}
      <ReviewForm movieId={movieId} onSubmit={refresh} />
    </div>
  );
};

export default ReviewsList;
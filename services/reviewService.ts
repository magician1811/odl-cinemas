import { Review } from '../types';
import { getReviews as blobGetReviews, addReview as blobAddReview } from './azureBlobService';

export const getReviewsForMovie = async (movieId: string): Promise<Review[]> => {
  const reviews = await blobGetReviews();
  return reviews.filter(r => r.movieId === movieId);
};

export const submitReview = async (review: Review): Promise<void> => {
  await blobAddReview(review);
};
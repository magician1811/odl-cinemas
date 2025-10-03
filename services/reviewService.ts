import { Review } from '../types';

const STORAGE_KEY = 'reviews';

const getStoredReviews = (): Review[] => {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Review[];
  } catch {
    return [];
  }
};

const saveStoredReviews = (reviews: Review[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
};

export const getAllReviews = (): Review[] => {
  return getStoredReviews();
};

export const getReviewsForMovie = (movieId: string): Review[] => {
  return getStoredReviews().filter((r) => r.movieId === movieId);
};

export const addReview = (review: Review): void => {
  const reviews = getStoredReviews();
  reviews.push(review);
  saveStoredReviews(reviews);
};
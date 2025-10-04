import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Movie, Review } from '../types';
import { getMovies } from '../services/azureBlobService';
import { fetchMovieDetails, OmdbMovie } from '../services/omdbService';
import { getReviewsForMovie, submitReview } from '../services/reviewService';
import { THEATRES } from '../constants';

const StarRating: React.FC<{ 
  rating: number; 
  onChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  readOnly?: boolean;
}> = ({ rating, onChange, size = 'md', readOnly = false }) => {
  const [hover, setHover] = useState(0);
  
  const sizeClass = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl'
  }[size];
  
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map(star => (
        <span 
          key={star}
          className={`${sizeClass} cursor-pointer ${
            star <= (hover || rating) 
              ? 'text-yellow-400' 
              : 'text-gray-400'
          } ${readOnly ? 'cursor-default' : ''}`}
          onClick={() => !readOnly && onChange && onChange(star)}
          onMouseEnter={() => !readOnly && setHover(star)}
          onMouseLeave={() => !readOnly && setHover(0)}
        >
          ★
        </span>
      ))}
    </div>
  );
};

const ReviewItem: React.FC<{ review: Review }> = ({ review }) => {
  return (
    <div className="border-b border-gray-700 py-4">
      <div className="flex justify-between items-center mb-2">
        <div>
          <p className="font-semibold text-white">{review.userName}</p>
          <p className="text-sm text-gray-400">
            {new Date(review.createdAt).toLocaleDateString()}
          </p>
        </div>
        <StarRating rating={review.rating} readOnly size="sm" />
      </div>
      <p className="text-gray-300 mt-2">{review.comment}</p>
    </div>
  );
};

const MovieDetailsPage: React.FC = () => {
  const { movieId } = useParams<{ movieId: string }>();
  const { user, isAuthenticated } = useAuth();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [omdbDetails, setOmdbDetails] = useState<OmdbMovie | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch movie and its details
  useEffect(() => {
    const fetchMovieData = async () => {
      if (!movieId) return;

      setLoading(true);
      try {
        // Try to find in THEATRES first
        let foundMovie: Movie | undefined;
        
        for (const theatre of THEATRES) {
          foundMovie = theatre.movies.find(m => m.id === movieId);
          if (foundMovie) break;
        }

        // If not found, check Azure Blob Storage
        if (!foundMovie) {
          const movies = await getMovies();
          foundMovie = movies.find(m => m.id === movieId);
        }

        if (foundMovie) {
          setMovie(foundMovie);
          
          // Fetch OMDB details for synopsis
          const omdbData = await fetchMovieDetails(foundMovie.title);
          setOmdbDetails(omdbData);

          // Fetch reviews
          const movieReviews = await getReviewsForMovie(movieId);
          setReviews(movieReviews);
        }
      } catch (err) {
        console.error('Error fetching movie details:', err);
        setError('Failed to load movie details');
      } finally {
        setLoading(false);
      }
    };

    fetchMovieData();
  }, [movieId]);

  const handleSubmitReview = async () => {
    if (!movie || !user || !isAuthenticated) return;
    
    if (userRating === 0) {
      setError('Please select a rating');
      return;
    }
    
    if (reviewComment.trim().length < 3) {
      setError('Please write a review comment (minimum 3 characters)');
      return;
    }
    
    setSubmitting(true);
    setError('');
    
    try {
      const newReview: Review = {
        id: Date.now().toString(),
        movieId: movie.id,
        userId: user.id,
        userName: user.name,
        rating: userRating,
        comment: reviewComment,
        createdAt: new Date().toISOString()
      };
      
      await submitReview(newReview);
      
      // Update local state
      setReviews(prev => [...prev, newReview]);
      setUserRating(0);
      setReviewComment('');
      setSuccess('Your review has been submitted!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-white mb-2">Loading Movie Details...</h2>
          <p className="text-gray-400">Please wait while we fetch the movie information</p>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-lg">
          <h2 className="text-2xl font-semibold text-white mb-4">Movie Not Found</h2>
          <p className="text-gray-400 mb-6">The movie you're looking for doesn't exist or has been removed.</p>
          <Link to="/theatres" className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300">
            Browse Theatres
          </Link>
        </div>
      </div>
    );
  }

  // Calculate average rating
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Movie Poster */}
        <div className="w-full md:w-1/3 lg:w-1/4">
          <img 
            src={movie.posterUrl} 
            alt={movie.title} 
            className="w-full rounded-lg shadow-lg"
          />
          
          <div className="mt-6 space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-300 mb-2">Genre</h3>
              <p className="text-white">{movie.genre}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-300 mb-2">Duration</h3>
              <p className="text-white">{movie.duration}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-300 mb-2">Rating</h3>
              <p className="text-white">{movie.censorRating}</p>
            </div>
            
            {omdbDetails && omdbDetails.Director && (
              <div>
                <h3 className="text-lg font-semibold text-gray-300 mb-2">Director</h3>
                <p className="text-white">{omdbDetails.Director}</p>
              </div>
            )}
            
            {omdbDetails && omdbDetails.Actors && (
              <div>
                <h3 className="text-lg font-semibold text-gray-300 mb-2">Cast</h3>
                <p className="text-white">{omdbDetails.Actors}</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Movie Details and Reviews */}
        <div className="w-full md:w-2/3 lg:w-3/4">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{movie.title}</h1>
          
          {/* User Ratings Overview */}
          <div className="flex items-center gap-3 mb-6">
            <StarRating rating={Math.round(averageRating)} readOnly />
            <span className="text-xl text-gray-300">
              {averageRating.toFixed(1)} ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
            </span>
          </div>
          
          {/* Book Tickets Button */}
          <Link
            to="/theatres"
            className="inline-block bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 mb-8"
          >
            Book Tickets
          </Link>
          
          {/* Synopsis */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Synopsis</h2>
            <p className="text-gray-300 leading-relaxed">
              {omdbDetails?.Plot || 'No synopsis available for this movie.'}
            </p>
          </div>
          
          {/* Reviews Section */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Reviews</h2>
            
            {/* Write Review Section */}
            {isAuthenticated ? (
              <div className="bg-gray-800 rounded-lg p-6 mb-8">
                <h3 className="text-xl font-semibold mb-4">Write a Review</h3>
                
                {error && (
                  <div className="bg-red-900/50 text-red-200 px-4 py-3 rounded-lg mb-4">
                    {error}
                  </div>
                )}
                
                {success && (
                  <div className="bg-green-900/50 text-green-200 px-4 py-3 rounded-lg mb-4">
                    {success}
                  </div>
                )}
                
                <div className="mb-4">
                  <label className="block text-gray-300 mb-2">Your Rating</label>
                  <StarRating rating={userRating} onChange={setUserRating} size="lg" />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-300 mb-2">Your Review</label>
                  <textarea 
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full bg-gray-700 rounded-lg p-3 text-white"
                    rows={4}
                    placeholder="Share your thoughts about this movie..."
                  />
                </div>
                
                <button 
                  onClick={handleSubmitReview}
                  disabled={submitting}
                  className="bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300"
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg p-6 mb-8 text-center">
                <p className="text-gray-300 mb-4">Please log in to write a review</p>
                <Link 
                  to="/login" 
                  className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300"
                >
                  Log In
                </Link>
              </div>
            )}
            
            {/* Reviews List */}
            <div className="space-y-2">
              {reviews.length > 0 ? (
                reviews.map(review => (
                  <ReviewItem key={review.id} review={review} />
                ))
              ) : (
                <p className="text-gray-400 text-center py-8">
                  No reviews yet. Be the first to review this movie!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailsPage;
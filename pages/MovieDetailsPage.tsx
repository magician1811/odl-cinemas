import React, { useMemo, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { THEATRES } from '../constants';
import ReviewsList from '../components/ReviewsList';
import ReviewForm from '../components/ReviewForm';
import { getReviewsForMovie } from '../services/reviewService';
import StarRating from '../components/StarRating';
import { getMovies } from '../services/azureBlobService';

// Utility to find a movie by id across all theatres and extra list
const findMovieById = (movieId: string, extraMovies: typeof THEATRES[number]['movies'] = []) => {
  for (const theatre of THEATRES) {
    const movie = theatre.movies.find(m => m.id === movieId);
    if (movie) {
      return { movie, theatre } as const;
    }
  }
  // search in extra movies (ones added via admin, not tied to a default theatre)
  const movie = extraMovies.find(m => m.id === movieId);
  if (movie) {
    // fabricate a theatre placeholder so UI still shows a theatre name
    return { movie, theatre: { id: 'custom', name: 'ODL Cinemas', movies: extraMovies } as any } as const;
  }
  return null;
};

const MovieDetailsPage: React.FC = () => {
  const { movieId } = useParams<{ movieId: string }>();

  const [extraMovies, setExtraMovies] = useState<typeof THEATRES[number]['movies']>([]);

  useEffect(() => {
    (async () => {
      try {
        const fetched = await getMovies();
        setExtraMovies(fetched);
      } catch (e) {
        console.error('Failed to fetch movies list', e);
      }
    })();
  }, []);

  const data = useMemo(() => (movieId ? findMovieById(movieId, extraMovies) : null), [movieId, extraMovies]);

  if (!data) {
    return (
      <div className="text-center pt-10 text-red-500">Movie not found.</div>
    );
  }

  const { movie, theatre } = data;
  const reviews = getReviewsForMovie(movie.id);
  const averageRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Link to="/movies" className="text-cyan-400 hover:underline">&larr; Back to Movies</Link>

      <div className="mt-4 flex flex-col md:flex-row gap-6">
        <img src={movie.posterUrl} alt={movie.title} className="w-60 h-auto rounded-lg shadow-lg" />
        <div className="flex-1 space-y-2">
          <h1 className="text-3xl font-bold font-gold">{movie.title}</h1>
          <p className="text-gray-400">{movie.genre} | {movie.duration} | {movie.censorRating}</p>
          <p className="text-gray-300">Playing at: {theatre.name}</p>

          {/* Rating */}
          <div className="flex items-center gap-2 mt-2">
            <StarRating rating={averageRating} readOnly />
            <span className="text-sm text-gray-400">({reviews.length} reviews)</span>
          </div>

          {/* Synopsis */}
          {movie.synopsis && (
            <div className="mt-4">
              <h2 className="text-xl font-semibold mb-2">Synopsis</h2>
              <p className="text-gray-300 whitespace-pre-line">{movie.synopsis}</p>
            </div>
          )}

          {/* Trailer */}
          {movie.trailerUrl && (
            <div className="mt-4">
              <h2 className="text-xl font-semibold mb-2">Trailer</h2>
              <div className="aspect-w-16 aspect-h-9">
                <iframe
                  src={movie.trailerUrl}
                  title={`${movie.title} Trailer`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full rounded-md"
                ></iframe>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-10 space-y-6">
        <h2 className="text-2xl font-semibold">User Reviews</h2>
        <ReviewForm movieId={movie.id} />
        <ReviewsList movieId={movie.id} />
      </div>
    </div>
  );
};

export default MovieDetailsPage;
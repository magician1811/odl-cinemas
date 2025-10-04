
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Movie, Theatre } from '../types';
import { getMovies } from '../services/azureBlobService';
import DateSelector from './components/DateSelector';
import { THEATRES } from '../constants';

const MoviesPage: React.FC = () => {
  const { theatreId } = useParams<{ theatreId: string }>();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    // Default to today's date
    return new Date().toISOString().split('T')[0];
  });

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const fetchedMovies = await getMovies();
        const currentTheatre = THEATRES.find(t => t.id === theatreId);
        const defaultMovies = currentTheatre?.movies || [];
        const combined = [...defaultMovies, ...fetchedMovies.filter(m => !defaultMovies.some(dm => dm.id === m.id))];
        setMovies(combined);
      } catch (error) {
        console.error('Error fetching movies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [theatreId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-white mb-2">Loading Movies...</h2>
          <p className="text-gray-400">Please wait while we fetch the latest movie data</p>
        </div>
      </div>
    );
  }

  if (!loading && movies.length === 0) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center space-y-4">
        <h2 className="text-2xl font-semibold">No movies available</h2>
        <p className="text-gray-400 max-w-md">
          There are currently no movies in the system. If you are an admin, please add new movies from the Admin panel.
        </p>
      </div>
    );
  }
  const availableDates = movies.reduce((dates: string[], movie) => {
    movie.dates.forEach(date => {
      if (!dates.includes(date.date)) {
        dates.push(date.date);
      }
    });
    return dates.sort();
  }, []);

  const getShowtimesForDate = (movie: Movie, date: string) => {
    const dateData = movie.dates.find(d => d.date === date);
    return dateData?.showtimes.filter(showtime => showtime.available) || [];
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-center">Now Showing</h1>
      
      <DateSelector
        availableDates={availableDates}
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
      />
      
      <div className="space-y-10 mt-8">
        {movies.map((movie) => {
          const showtimesForDate = getShowtimesForDate(movie, selectedDate);
          
          // Only show movie if it has available showtimes for the selected date
          if (showtimesForDate.length === 0) return null;
          
          return (
            <div key={movie.id} className="flex flex-col md:flex-row bg-gray-800/50 rounded-lg shadow-lg overflow-hidden">
              <Link to={`/movie/${movie.id}`}>
                <img src={movie.posterUrl} alt={movie.title} className="w-full md:w-48 h-64 md:h-auto object-cover" />
              </Link>
              <div className="p-6 flex flex-col justify-between flex-grow">
                <div>
                  <Link to={`/movie/${movie.id}`}> <h2 className="text-3xl font-bold text-white mb-2">{movie.title}</h2></Link>
                  <p className="text-gray-400 mb-4">
                    {movie.genre} • {movie.duration} • {movie.censorRating}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-300 mb-3">
                    Showtimes for {new Date(selectedDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric'
                    })}:
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {showtimesForDate.map((showtime) => (
                      <Link
                        key={showtime.time}
                        to={`/seats/${theatreId}/${movie.id}/${selectedDate}/${encodeURIComponent(showtime.time)}`}
                        className="bg-gray-700 text-white font-semibold py-2 px-4 rounded hover:bg-cyan-500 transition duration-300"
                      >
                        {showtime.time}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MoviesPage;

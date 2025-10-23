import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Movie, MovieDate, Showtime, Booking } from '../types';
import { addMovie, uploadMoviePoster, deleteMovie, getMovies, getUsers } from '../services/azureBlobService';
import { getAllBookings } from '../services/bookingService';

const AdminPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [duration, setDuration] = useState('');
  const [censorRating, setCensorRating] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
    }
  }, [isAdmin, navigate]);

  const generateDefaultShowtimes = (): Showtime[] => [
    { time: '10:00 AM', available: true },
    { time: '1:00 PM', available: true },
    { time: '4:00 PM', available: true },
    { time: '7:00 PM', available: true },
    { time: '10:00 PM', available: true },
  ];

  const generateDefaultDates = (): MovieDate[] => {
    const dates: MovieDate[] = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        date: date.toISOString().split('T')[0],
        showtimes: generateDefaultShowtimes(),
      });
    }

    return dates;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!posterUrl.trim()) {
      alert('Please provide a valid poster URL.');
      return;
    }

    setLoading(true);
    try {
      const newMovie: Movie = {
        id: Date.now().toString(),
        title: title.trim(),
        genre: genre.trim(),
        duration: duration.trim(),
        censorRating,
        posterUrl: posterUrl.trim(),
        dates: generateDefaultDates(),
      };

      await addMovie(newMovie);
      alert('Movie added successfully!');

      // reset form
      setTitle('');
      setGenre('');
      setDuration('');
      setCensorRating('');
      setPosterUrl('');
    } catch (error) {
      console.error('Error adding movie:', error);
      alert('Failed to add movie. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch and display movies for deletion
  const [movies, setMovies] = useState<Movie[]>([]);
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const fetchedMovies = await getMovies();
        console.log('AdminPage: Fetched movies for deletion:', fetchedMovies);
        setMovies(fetchedMovies);
      } catch (error) {
        console.error('Error fetching movies:', error);
      }
    };
    fetchMovies();
  }, []);
  
  const handleDeleteMovie = async (movieId: string) => {
    if (!window.confirm('Are you sure you want to delete this movie?')) return;
    setLoading(true);
    try {
      await deleteMovie(movieId);
      setMovies(movies.filter(m => m.id !== movieId));
      alert('Movie deleted successfully!');
    } catch (error) {
      console.error('Error deleting movie:', error);
      alert('Failed to delete movie. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [userMap, setUserMap] = useState<Record<string, string>>({});
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);

  const fetchBookingsAndUsers = async () => {
    setIsLoadingBookings(true);
    try {
      const [allBookings, users] = await Promise.all([
        getAllBookings(),
        getUsers()
      ]);
      console.log('Fetched bookings:', allBookings);
      setBookings(allBookings);
      const map: Record<string, string> = {};
      users.forEach((u: any) => {
        map[u.id] = u.name || u.email;
      });
      setUserMap(map);
    } catch (error) {
      console.error('Error fetching bookings/users:', error);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  useEffect(() => {
    fetchBookingsAndUsers();
  }, []);

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleString();
  const formatSeats = (seats: any[]) => seats.map((s: any) => `${s.row}${s.number}`).join(', ');

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Add New Movie Section */}
      <div className="mb-12">
        <h1 className="text-3xl font-bold mb-8 text-center">Add New Movie</h1>
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Movie Title */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Movie Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-cyan-500"
              />
            </div>
            {/* Genre */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Genre</label>
              <input
                type="text"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-cyan-500"
              />
            </div>
            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Duration (e.g., 2h 30m)
              </label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-cyan-500"
              />
            </div>
            {/* Censor Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Censor Rating (U, U/A, A)
              </label>
              <select
                value={censorRating}
                onChange={(e) => setCensorRating(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-cyan-500"
              >
                <option value="">Select Rating</option>
                <option value="U">U</option>
                <option value="U/A">U/A</option>
                <option value="A">A</option>
              </select>
            </div>
            {/* Poster URL */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Poster URL
              </label>
              <input
                type="url"
                value={posterUrl}
                onChange={(e) => setPosterUrl(e.target.value)}
                placeholder="https://example.com/poster.jpg"
                required
                className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed transition duration-300"
            >
              {loading ? 'Adding Movie...' : 'Add Movie'}
            </button>
          </form>
        </div>
      </div>

      {/* Delete Movies Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-center">Delete Movies</h2>
        <div className="space-y-4">
          {movies.length === 0 ? (
            <p className="text-gray-400 text-center">No movies available for deletion.</p>
          ) : (
            movies.map(movie => (
              <div key={movie.id} className="flex items-center justify-between bg-gray-800/50 rounded-lg p-4">
                <div>
                  <span className="text-lg font-semibold text-white">{movie.title}</span>
                  <span className="ml-2 text-gray-400">({movie.genre}, {movie.duration})</span>
                </div>
                <button
                  onClick={() => handleDeleteMovie(movie.id)}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                  disabled={loading}
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Booking History Section */}
      <div className="mb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div className="text-center md:text-left flex-grow">
            <h2 className="text-2xl font-bold">All Users Booking History</h2>
            <p className="text-gray-400 text-sm mt-1">Total Bookings: {bookings.length}</p>
          </div>
          <button
            onClick={fetchBookingsAndUsers}
            disabled={isLoadingBookings}
            className="bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center gap-2 justify-center"
          >
            <svg 
              className={`w-5 h-5 ${isLoadingBookings ? 'animate-spin' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {isLoadingBookings ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        <div className="space-y-4">
          {bookings.length === 0 ? (
            <p className="text-gray-400 text-center">No bookings found.</p>
          ) : (
            bookings
              .sort((a, b) => new Date(b.bookingTime).getTime() - new Date(a.bookingTime).getTime())
              .map(b => (
              <div key={b.id} className="bg-gray-800/50 rounded-lg p-4 shadow-lg">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-shrink-0">
                    <p className="text-white font-semibold text-lg">{userMap[b.userId] || 'Unknown User'}</p>
                    <p className="text-gray-400 text-sm">User ID: {b.userId}</p>
                    <p className="text-gray-400 text-sm">Booked on: {formatDate(b.bookingTime)}</p>
                  </div>
                  <div className="flex-grow">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-400">Movie: </span>
                        <span className="text-white font-medium">{b.movie?.title || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Theatre: </span>
                        <span className="text-white font-medium">{b.theatre?.name || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Date: </span>
                        <span className="text-white font-medium">{b.date}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Showtime: </span>
                        <span className="text-white font-medium">{b.showtime}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Seats: </span>
                        <span className="text-white font-medium">{formatSeats(b.seats)}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Total: </span>
                        <span className="text-white font-medium">₹{b.totalPrice}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
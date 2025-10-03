import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Movie, MovieDate, Showtime } from '../types';
import { addMovie, deleteMovie } from '../services/azureBlobService';
import { fetchSynopsis } from '../services/movieInfoService';
import { THEATRES } from '../constants';
import { getMovies } from '../services/azureBlobService';

const AdminPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [duration, setDuration] = useState('');
  const [censorRating, setCensorRating] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [existingMovies, setExistingMovies] = useState<Movie[]>([]);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
    }
  }, [isAdmin, navigate]);

  // Load existing movies (remote + default) once on mount
  useEffect(() => {
    const loadMovies = async () => {
      try {
        const remote = await getMovies();
        const defaults = THEATRES.flatMap((t) => t.movies);
        setExistingMovies([...remote, ...defaults]);
      } catch (err) {
        console.error('Failed to load existing movies for admin page', err);
      }
    };
    loadMovies();
  }, []);

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

  const MASTER_SHOWTIMES = [
    '10:00 AM',
    '12:30 PM',
    '3:00 PM',
    '5:30 PM',
    '8:00 PM',
    '10:30 PM',
  ];

  const generateAllTimeSlots = (): string[] => {
    const slots: string[] = [];
    const start = new Date();
    start.setHours(9, 0, 0, 0); // 9:00 AM
    const end = new Date();
    end.setHours(23, 0, 0, 0); // 11:00 PM

    while (start <= end) {
      const hours = start.getHours();
      const minutes = start.getMinutes();
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHour = ((hours + 11) % 12) + 1; // convert 0-23 to 1-12
      const displayMinutes = minutes.toString().padStart(2, '0');
      slots.push(`${displayHour}:${displayMinutes} ${period}`);
      start.setMinutes(start.getMinutes() + 30); // next 30-min slot
    }
    return slots;
  };

  const generateUniqueShowtimes = (
    usedTimes: Set<string>,
    count: number = 5
  ): Showtime[] => {
    const allSlots = generateAllTimeSlots();
    const showtimes: Showtime[] = [];
    for (const slot of allSlots) {
      if (!usedTimes.has(slot)) {
        showtimes.push({ time: slot, available: true });
      }
      if (showtimes.length === count) break;
    }
    return showtimes;
  };
  const generateUniqueDates = async (moviesPool: Movie[]): Promise<MovieDate[]> => {
    const dates: MovieDate[] = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      // Collect showtimes already used on this date
      const usedTimes = new Set<string>();
      moviesPool.forEach((m) => {
        const d = m.dates.find((d) => d.date === dateStr);
        d?.showtimes.forEach((st) => usedTimes.add(st.time));
      });

      dates.push({
        date: dateStr,
        showtimes: generateUniqueShowtimes(usedTimes),
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
        dates: await generateUniqueDates(existingMovies),
        synopsis: await fetchSynopsis(title.trim()) ?? undefined,
      } as Movie;

      await addMovie(newMovie);
      // update local existing movies to include the newly added one so subsequent additions avoid duplicates
      setExistingMovies((prev) => [...prev, newMovie]);
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

  const handleDelete = async (movieId: string) => {
    if (!window.confirm('Are you sure you want to delete this movie?')) return;
    try {
      await deleteMovie(movieId);
      setExistingMovies((prev) => prev.filter((m) => m.id !== movieId));
      alert('Movie deleted');
    } catch (err) {
      console.error(err);
      alert('Failed to delete');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">Add New Movie</h1>

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

      {/* Existing Movies */}
      <h2 className="text-2xl font-semibold mt-10 mb-4 text-center">Existing Movies</h2>
      <ul className="space-y-4">
        {existingMovies.map((movie) => (
          <li key={movie.id} className="flex justify-between items-center bg-gray-800 p-4 rounded-lg">
            <span className="text-white font-medium">{movie.title}</span>
            <button
              onClick={() => handleDelete(movie.id)}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminPage;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Movie, MovieDate, Showtime } from '../types';
import { addMovie, uploadMoviePoster } from '../services/azureBlobService';

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
    </div>
  );
};

export default AdminPage;
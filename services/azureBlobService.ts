import { Movie, Booking } from '../types';

const MOVIES_CONTAINER = import.meta.env.VITE_AZURE_CONTAINER_NAME;
const ACCOUNT = import.meta.env.VITE_AZURE_STORAGE_ACCOUNT;
const SAS_TOKEN = import.meta.env.VITE_AZURE_SAS_TOKEN;

const MOVIES_FILE = 'movies.json';
const BOOKINGS_FILE = 'bookings.json';

const sasToken = SAS_TOKEN?.startsWith('?') ? SAS_TOKEN : `?${SAS_TOKEN}`;

const getBlobUrl = (blobName: string) => {
  return `https://${ACCOUNT}.blob.core.windows.net/${MOVIES_CONTAINER}/${blobName}${sasToken}`;
};

export const uploadMoviePoster = async (file: File): Promise<string> => {
  const blobName = `posters/${Date.now()}-${file.name}`;
  const url = getBlobUrl(blobName);

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'x-ms-blob-type': 'BlockBlob',
        'Content-Type': file.type,
      },
      body: file,
    });

    if (!response.ok) {
      throw new Error('Failed to upload poster');
    }

    // Return the public URL of the uploaded poster
    return `https://${ACCOUNT}.blob.core.windows.net/${MOVIES_CONTAINER}/${blobName}`;
  } catch (error) {
    console.error('Error uploading poster:', error);
    throw error;
  }
};

export const getMovies = async (): Promise<Movie[]> => {
  try {
    const response = await fetch(getBlobUrl(MOVIES_FILE));
    
    if (response.status === 404) {
      // If movies.json doesn't exist yet, return empty array
      return [];
    }

    if (!response.ok) {
      throw new Error('Failed to fetch movies');
    }

    const movies = await response.json();
    return movies;
  } catch (error) {
    console.error('Error fetching movies:', error);
    return [];
  }
};

export const saveMovies = async (movies: Movie[]): Promise<void> => {
  try {
    const response = await fetch(getBlobUrl(MOVIES_FILE), {
      method: 'PUT',
      headers: {
        'x-ms-blob-type': 'BlockBlob',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(movies),
    });

    if (!response.ok) {
      throw new Error('Failed to save movies');
    }
  } catch (error) {
    console.error('Error saving movies:', error);
    throw error;
  }
};

export const addMovie = async (movie: Movie): Promise<void> => {
  try {
    const movies = await getMovies();
    movies.push(movie);
    await saveMovies(movies);
  } catch (error) {
    console.error('Error adding movie:', error);
    throw error;
  }
};

// Booking related methods
export const getBookings = async (): Promise<Booking[]> => {
  try {
    const response = await fetch(getBlobUrl(BOOKINGS_FILE));
    
    if (response.status === 404) {
      // If bookings.json doesn't exist yet, return empty array
      return [];
    }

    if (!response.ok) {
      throw new Error('Failed to fetch bookings');
    }

    const bookings = await response.json();
    return bookings;
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return [];
  }
};

export const saveBookings = async (bookings: Booking[]): Promise<void> => {
  try {
    const response = await fetch(getBlobUrl(BOOKINGS_FILE), {
      method: 'PUT',
      headers: {
        'x-ms-blob-type': 'BlockBlob',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookings),
    });

    if (!response.ok) {
      throw new Error('Failed to save bookings');
    }
  } catch (error) {
    console.error('Error saving bookings:', error);
    throw error;
  }
};

export const addBooking = async (booking: Booking): Promise<void> => {
  try {
    const bookings = await getBookings();
    bookings.push(booking);
    await saveBookings(bookings);
  } catch (error) {
    console.error('Error adding booking:', error);
    throw error;
  }
};

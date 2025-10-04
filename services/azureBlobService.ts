import { Movie, Booking, Review } from '../types';

const MOVIES_CONTAINER = import.meta.env.VITE_AZURE_CONTAINER_NAME;
const ACCOUNT = import.meta.env.VITE_AZURE_STORAGE_ACCOUNT;
const SAS_TOKEN = import.meta.env.VITE_AZURE_SAS_TOKEN;
const USERS_FILE = 'users.json';

const MOVIES_FILE = 'movies.json';
const BOOKINGS_FILE = 'bookings.json';
const REVIEWS_FILE = 'reviews.json';

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

export const addMovie = async (movie: Movie): Promise<void> => {
  try {
    const movies = await getMovies();
    movies.push(movie);
    await saveMovies(movies);
    console.log('addMovie: Successfully saved movies:', movies);
  } catch (error) {
    console.error('Error adding movie:', error);
    throw error;
  }
};

export const deleteMovie = async (movieId: string): Promise<void> => {
  try {
    const movies = await getMovies();
    const updatedMovies = movies.filter(movie => movie.id !== movieId);
    await saveMovies(updatedMovies);
  } catch (error) {
    console.error('Error deleting movie:', error);
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

// Review related methods
export const getReviews = async (): Promise<Review[]> => {
  try {
    const response = await fetch(getBlobUrl(REVIEWS_FILE));
    if (response.status === 404) {
      return [];
    }
    if (!response.ok) throw new Error('Failed to fetch reviews');
    const reviews = await response.json();
    return reviews;
  } catch (err) {
    console.error('Error fetching reviews:', err);
    return [];
  }
};

export const saveReviews = async (reviews: Review[]): Promise<void> => {
  try {
    const response = await fetch(getBlobUrl(REVIEWS_FILE), {
      method: 'PUT',
      headers: {
        'x-ms-blob-type': 'BlockBlob',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reviews),
    });
    if (!response.ok) throw new Error('Failed to save reviews');
  } catch (err) {
    console.error('Error saving reviews:', err);
    throw err;
  }
};

export const addReview = async (review: Review): Promise<void> => {
  const reviews = await getReviews();
  reviews.push(review);
  await saveReviews(reviews);
};

// User related methods
export const getUsers = async (): Promise<any[]> => {
  try {
    const response = await fetch(getBlobUrl(USERS_FILE));
    if (response.status === 404) {
      return [];
    }
    if (!response.ok) throw new Error('Failed to fetch users');
    const users = await response.json();
    return users;
  } catch (err) {
    console.error('Error fetching users:', err);
    return [];
  }
};

export const saveUsers = async (users: any[]): Promise<void> => {
  try {
    const response = await fetch(getBlobUrl(USERS_FILE), {
      method: 'PUT',
      headers: {
        'x-ms-blob-type': 'BlockBlob',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(users),
    });
    if (!response.ok) throw new Error('Failed to save users');
  } catch (err) {
    console.error('Error saving users:', err);
    throw err;
  }
};

// Removed blobClient-based getUsers and addUser functions (lines 221-239)

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
      const errorText = await response.text();
      console.error('saveMovies: Failed to save movies. Response:', errorText);
      throw new Error('Failed to save movies');
    }
    console.log('saveMovies: Movies saved successfully:', movies);
  } catch (error) {
    console.error('Error saving movies:', error);
    throw error;
  }
};

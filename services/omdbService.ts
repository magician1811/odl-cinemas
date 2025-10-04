import { Movie } from '../types';

const API_KEY = import.meta.env.VITE_OMDB_API_KEY;
const BASE_URL = 'https://www.omdbapi.com/';

export interface OmdbMovie {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Awards: string;
  Poster: string;
  Ratings: Array<{ Source: string; Value: string }>;
  Metascore: string;
  imdbRating: string;
  imdbVotes: string;
  imdbID: string;
  Type: string;
  DVD: string;
  BoxOffice: string;
  Production: string;
  Website: string;
  Response: string;
}

export const fetchMovieDetails = async (title: string): Promise<OmdbMovie | null> => {
  if (!API_KEY) {
    console.warn('OMDb API key is missing');
    return null;
  }
  try {
    const url = `${BASE_URL}?apikey=${API_KEY}&t=${encodeURIComponent(title)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch OMDb');
    const data = (await res.json()) as OmdbMovie;
    if (data.Response === 'False') return null;
    return data;
  } catch (err) {
    console.error('Error fetching OMDb data', err);
    return null;
  }
};
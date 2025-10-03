import axios from 'axios';

// Fetches movie synopsis from OMDb API using the movie title.
// Requires environment variable VITE_OMDB_API_KEY to be set.
export const fetchSynopsis = async (title: string): Promise<string | undefined> => {
  const apiKey = import.meta.env.VITE_OMDB_API_KEY;
  if (!apiKey) {
    console.warn('OMDb API key not configured. Skipping synopsis fetch.');
    return undefined;
  }

  try {
    // OMDb does not enable CORS on free tier; use allorigins proxy for browser requests
    const omdbUrl = `https://www.omdbapi.com/?t=${encodeURIComponent(title)}&plot=short&r=json&apikey=${apiKey}`;
    const response = await axios.get(`https://api.allorigins.win/raw?url=${encodeURIComponent(omdbUrl)}`);

    if (response.data && response.data.Response === 'True') {
      return response.data.Plot as string;
    }
  } catch (err: any) {
    console.error('Failed to fetch synopsis:', err?.message || err);
  }

  return undefined;
};
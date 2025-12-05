import type { ItunesResponse, ItunesSong } from '../types/music';

export const searchMusic = async (term: string): Promise<ItunesSong[]> => {
  if (!term) return [];

  // search for songs, maximum 10 results
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&country=US&entity=song&limit=10`;

  try {
    const response = await fetch(url);
    const data: ItunesResponse = await response.json();
    return data.results;
  } catch (error) {
    console.error('Music search failed:', error);
    return [];
  }
};
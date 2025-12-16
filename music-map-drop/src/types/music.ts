export interface ItunesSong {
  trackId: number;
  trackName: string;
  artistName: string;
  collectionName: string;
  artworkUrl100: string;
  previewUrl?: string;
  releaseDate: string;
}

export interface ItunesResponse {
  resultCount: number;
  results: ItunesSong[];
}

export interface MusicDrop {
  id: string;
  song: ItunesSong;
  text: string;
  tags: string[];
  location: {
    lat: number;
    lng: number;
  };
  createdAt: string;
}


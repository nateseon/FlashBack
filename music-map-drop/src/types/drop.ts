export interface Drop {
  id: string;
  title: string;
  artist?: string;
  mood?: string;
  text?: string;
  coverUrl?: string;
  previewUrl?: string;
  lat: number;
  lng: number;
  createdAt: number;
}


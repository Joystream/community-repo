export interface Video {
  videoId: number;
  category: string;
  categoryId: number;
  count: number;
}

export interface OrionVideo {
  videoId: number;
  videoCutUrl: string;
}

export interface Category {
  categoryId: number;
  videos: OrionVideo[];
}

export interface Schedule {
  [key: string]: { categories: Category[] };
}


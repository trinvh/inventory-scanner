export interface Author {
  id: number;
  name: string;
  slug: string;
}

export interface Source {
  id: number;
  name: string;
  slug: string;
}

export interface Genre {
  id: number;
  name: string;
  slug: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export interface Story {
  id: number;
  name: string;
  slug: string;
  source_id: number;
  status: number;
  author_id: number;
  total_words: number;
  view: number;
  cover: string;
  desc: string;
  chapters_count: number;
  is_mine: boolean;
  saved: boolean;
  subscribed: boolean;
  auto_buy: boolean;
  gc_auto_buy?: any;
  favorite: number;
  price_a_word: string;
  author: Author;
  source: Source;
  categories?: Genre[];
  tags?: Tag[];
}

export interface Chapter {
  id: number;
  name: string;
  slug: string;
  chapter_number: number;
  public_content?: string;
  content: string;
  story_id: number;
  price?: number;
  created_at: string;
  updated_at: string;
  published_at: string;
  bought: boolean;
}

export interface Paginated {
  current_page: number;
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  next_page_url: string;
  path: string;
  per_page: string;
  prev_page_url?: any;
  to: number;
  total: number;
}

export interface StoryPaginated extends Paginated {
  data: Story[];
}

export interface ChapterPaginated extends Paginated {
  data: Chapter[];
}
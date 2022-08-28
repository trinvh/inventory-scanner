import axios, { AxiosInstance } from 'axios'
import { Chapter, ChapterPaginated, Story, StoryPaginated } from './interfaces';
import { RateLimiter } from "limiter";

interface PaginatedResponse<T> {
  items: T[];
  next_page: number;
  total: number;
}

const limiter = new RateLimiter({ tokensPerInterval: 100, interval: 'minute'});

export default class BachNgocSach {
  readonly _client: AxiosInstance;

  constructor() {
    this._client = axios.create({
      baseURL: 'https://api.bachngocsach.com',
      headers: {
        Accept: 'application/json, text/plain, */*',
        Authorization: 'Bearer 29748|8ODAfdAUIore1EcXmoIFjRMUC5oz5ytnIZWPtwFL'
      }
    })
    this._client.interceptors.request.use(async (config: any) => {
      const remainingRequests = await limiter.removeTokens(1)
      console.log({ remainingRequests })
      return config
    })
  }

  public async buyStory(id: number): Promise<void> {
    await this._client.post(`/api/buy-combo/${id}`)
  }

  public async getStories(page: number): Promise<PaginatedResponse<Story>> {
    const { data } = await this._client.get<StoryPaginated>('/api/story-newest', {
      params: {
        per_page: 50,
        page: page
      }
    })
    const { data: stories, current_page, last_page, total } = data
    return {
      items: stories,
      next_page: current_page < last_page ? current_page + 1 : 0,
      total: total
    }
  }

  public async getStory(id: number): Promise<Story> {
    const { data } = await this._client.get(`/api/story/${id}`)
    return data
  }

  public async getChapters(id: number, limit: number = 50, page: number): Promise<PaginatedResponse<Chapter>> {
    const { data } = await this._client.get<{ chapters: ChapterPaginated }>(`/api/story/${id}/chapter`, {
      params: {
        per_page: limit,
        page: page,
        order_by: 'asc'
      }
    })
    const { data: chapters, current_page, last_page, total } = data.chapters
    return {
      items: chapters,
      next_page: current_page < last_page ? current_page + 1 : 0,
      total: total
    }
  }

  public async getChapter(id: number): Promise<Chapter> {
    const { data } = await this._client.get(`/api/chapter/${id}`)
    const { chapter } = data
    return chapter
  }

}
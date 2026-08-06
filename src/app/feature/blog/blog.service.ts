import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { Blog } from '../../../models/blog';
import { environment } from '../../../environments/environment';

interface BlogResponse {
  data: Blog[];
  maxPageSize: number;
  pageIndex: number;
  pageSize: number;
  totalCount: number;
}

@Injectable({
  providedIn: 'root',
})
export class BlogService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.api}/entries`;

  private blogs: Blog[] = [];

  async getBlogs(): Promise<Blog[]> {
    try {
      const response = await firstValueFrom(this.http.get<BlogResponse>(this.apiUrl));

      this.blogs = response.data;

      return response.data;
    } catch (error) {
      console.error('Fehler beim Laden der Blogs:', error);
      return [];
    }
  }

  async createBlog(blog: Blog): Promise<Blog> {
    try {
      return await firstValueFrom(this.http.post<Blog>(this.apiUrl, blog));
    } catch (error) {
      console.error('Fehler beim Erstellen des Blogs:', error);
      throw error;
    }
  }

  async updateBlog(id: string, blog: Blog): Promise<Blog> {
    try {
      return await firstValueFrom(this.http.put<Blog>(`${this.apiUrl}/${id}`, blog));
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Blogs:', error);
      throw error;
    }
  }

  async deleteBlog(id: string): Promise<void> {
    try {
      await firstValueFrom(this.http.delete<void>(`${this.apiUrl}/${id}`));
    } catch (error) {
      console.error('Fehler beim Löschen des Blogs:', error);
      throw error;
    }
  }

  getById(id: number): Blog | undefined {
    return this.blogs.find((blog) => blog.id === id);
  }
}

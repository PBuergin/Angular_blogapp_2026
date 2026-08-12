import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { z } from 'zod';

import { Blog } from '../../../models/blog';
import { environment } from '../../../environments/environment';

interface BlogResponse {
  data: unknown;
  maxPageSize: number;
  pageIndex: number;
  pageSize: number;
  totalCount: number;
}

const BlogSchema = z.object({
  id: z.number(),
  title: z.string(),
  contentPreview: z.string(),
  author: z.string(),
  likes: z.number(),
  comments: z.number(),
  likedByMe: z.boolean(),
  createdByMe: z.boolean(),
  headerImageUrl: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const BlogArraySchema = z.array(BlogSchema);

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

      // original für zod test auskommentieren und zod test entkommentieren
      const result = BlogArraySchema.safeParse(response.data);

      /* zod test mit falschen daten  ***
      
      // Testdaten erzeugen
      const invalidData = structuredClone(response.data as Blog[]);

      // Absichtlich falschen Datentyp erzeugen
      invalidData[0].id = 'falscher Typ' as never;

      // Zod prüfen lassen
      const result = BlogArraySchema.safeParse(invalidData);

      */

      if (!result.success) {
        console.error('Ungültige Blog-Daten vom Backend:', result.error);

        this.blogs = [];
        return [];
      }

      this.blogs = result.data;

      return result.data;
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

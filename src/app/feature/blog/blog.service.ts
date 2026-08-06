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
    const response = await firstValueFrom(this.http.get<BlogResponse>(this.apiUrl));

    this.blogs = response.data;

    return response.data;
  }

  getById(id: number): Blog | undefined {
    return this.blogs.find((blog) => blog.id === id);
  }
}

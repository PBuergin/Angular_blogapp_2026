import { Service } from '@angular/core';
import { Blog } from '../../../models/blog';
import blogData from '../../data/blogs.json';

@Service()
export class BlogService {
  private blogs: Blog[] = blogData as Blog[];

  getAll(): Blog[] {
    return this.blogs;
  }

  getById(id: number): Blog | undefined {
    return this.blogs.find((blog) => blog.id === id);
  }
}

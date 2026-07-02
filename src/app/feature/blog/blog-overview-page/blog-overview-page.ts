import { Component, inject } from '@angular/core';
import { BlogCardComponent } from '../blog-card/blog-card';
import { Blog } from '../../../../models/blog';
import { BlogService } from '../blog.service';

@Component({
  selector: 'app-blog-overview-page',
  standalone: true,
  imports: [BlogCardComponent],
  templateUrl: './blog-overview-page.html',
  styleUrl: './blog-overview-page.scss',
})
export class BlogOverviewPageComponent {
  private blogService = inject(BlogService);

  blogs: Blog[] = this.blogService.getAll();

  toggleLike(id: number): void {
    const blog = this.blogs.find((b) => b.id === id);

    if (!blog) {
      return;
    }

    if (blog.likedByMe) {
      blog.likedByMe = false;
      blog.likes--;
    } else {
      blog.likedByMe = true;
      blog.likes++;
    }
  }
}

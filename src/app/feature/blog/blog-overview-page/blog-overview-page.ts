import { Component, inject, OnInit, signal } from '@angular/core';
import { BlogCardComponent } from '../blog-card/blog-card';
import { Blog } from '../../../../models/blog';
import { BlogService } from '../blog.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-blog-overview-page',
  standalone: true,
  imports: [BlogCardComponent, MatButtonModule, MatIconModule],
  templateUrl: './blog-overview-page.html',
  styleUrl: './blog-overview-page.scss',
})
export class BlogOverviewPageComponent implements OnInit {
  isDarkMode = false;

  private blogService = inject(BlogService);

  readonly blogs = signal<Blog[]>([]);

  async ngOnInit(): Promise<void> {
    const blogs = await this.blogService.getBlogs();
    this.blogs.set(blogs);
  }

  constructor() {
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'dark') {
      this.isDarkMode = true;
    } else if (savedTheme === 'light') {
      this.isDarkMode = false;
    } else {
      // Kein gespeichertes Theme → System-Einstellung verwenden
      this.isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    document.documentElement.classList.toggle('dark-theme', this.isDarkMode);
  }

  toggleLike(id: number): void {
    const blog = this.blogs().find((b) => b.id === id);

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

    this.blogs.update((blogs) => [...blogs]);
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;

    document.documentElement.classList.toggle('dark-theme', this.isDarkMode);

    // Theme speichern
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
  }
}

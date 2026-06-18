import { Component } from '@angular/core';
import { BlogCardComponent } from '../blog-card/blog-card';
import { Blog } from '../../models/blog';
import blogData from '../data/blogs.json';

@Component({
  selector: 'app-blog-overview-page',
  standalone: true,
  imports: [BlogCardComponent],
  templateUrl: './blog-overview-page.html',
  styleUrl: './blog-overview-page.scss',
})
export class BlogOverviewPageComponent {
  readonly blogs: Blog[] = blogData as Blog[];
}

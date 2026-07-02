import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

import { BlogService } from '../blog.service';

@Component({
  selector: 'app-blog-detail-page',
  standalone: true,
  imports: [RouterLink, MatButtonModule],
  templateUrl: './blog-detail-page.html',
  styleUrl: './blog-detail-page.scss',
})
export class BlogDetailPageComponent {
  private readonly blogService = inject(BlogService);

  readonly id = input.required<string>();

  readonly blog = computed(() => this.blogService.getById(Number(this.id())));
}

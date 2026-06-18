import { Component, input } from '@angular/core';
import { Blog } from '../../models/blog';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-blog-card',
  standalone: true,
  imports: [MatCardModule],
  templateUrl: './blog-card.html',
  styleUrl: './blog-card.scss',
})
export class BlogCardComponent {
  //Aufgabe 1.1.3
  readonly model = input.required<Blog>();
}

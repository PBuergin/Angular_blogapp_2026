import { Component, input, output } from '@angular/core';
import { Blog } from '../../models/blog';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-blog-card',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './blog-card.html',
  styleUrl: './blog-card.scss',
})
export class BlogCardComponent {
  //Aufgabe 1.1.3
  readonly model = input.required<Blog>();
  readonly liked = output<number>();
  onLike(): void {
    this.liked.emit(this.model().id);
  }
}

import { Component } from '@angular/core';
import { BlogOverviewPageComponent } from './blog-overview-page/blog-overview-page';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [BlogOverviewPageComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}

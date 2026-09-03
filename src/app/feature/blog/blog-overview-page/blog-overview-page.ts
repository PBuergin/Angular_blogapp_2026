import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { BlogCardComponent } from '../blog-card/blog-card';

import { BlogStateService } from '../../../services/blog-state';
import { AuthStore } from '../../../services/auth-store';

// Angular Material
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

  // Zentraler Blog-State
  readonly state = inject(BlogStateService);

  // Zentraler Auth-State
  readonly authStore = inject(AuthStore);

  // Angular Router
  private readonly router = inject(Router);

  async ngOnInit(): Promise<void> {
    await this.state.loadBlogs();
  }

  constructor() {
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'dark') {
      this.isDarkMode = true;
    } else if (savedTheme === 'light') {
      this.isDarkMode = false;
    } else {
      // Kein gespeichertes Theme:
      // Systemeinstellung verwenden
      this.isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    document.documentElement.classList.toggle('dark-theme', this.isDarkMode);
  }

  // Like-State ändern
  toggleLike(id: number): void {
    this.state.toggleLike(id);
  }

  // Zur Login-Seite navigieren
  goToLogin(): void {
    void this.router.navigate(['/login'], {
      queryParams: {
        returnUrl: '/',
      },
    });
  }

  // Logout über den AuthStore
  logout(): void {
    void this.authStore.logout();
  }

  // Dark-/Light-Mode umschalten
  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;

    document.documentElement.classList.toggle('dark-theme', this.isDarkMode);

    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
  }
}

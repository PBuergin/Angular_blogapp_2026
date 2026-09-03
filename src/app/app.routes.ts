import { Routes } from '@angular/router';

import { BlogOverviewPageComponent } from './feature/blog/blog-overview-page/blog-overview-page';
import { blogDetailResolver } from './feature/blog/blog-detail.resolver';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: BlogOverviewPageComponent,
  },

  {
    path: 'login',
    loadComponent: () => import('./login-page/login-page').then((m) => m.LoginPageComponent),
  },

  {
    path: 'blog/:id',
    canMatch: [authGuard],
    loadComponent: () =>
      import('./feature/blog/blog-detail-page/blog-detail-page').then(
        (m) => m.BlogDetailPageComponent,
      ),
    resolve: {
      blog: blogDetailResolver,
    },
  },

  {
    path: '**',
    loadComponent: () =>
      import('./not-found-page/not-found-page').then((m) => m.NotFoundPageComponent),
  },
];

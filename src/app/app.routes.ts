import { Routes } from '@angular/router';

import { BlogOverviewPageComponent } from './blog-overview-page/blog-overview-page';
import { blogDetailResolver } from './shared/blog-detail.resolver';

export const routes: Routes = [
  {
    path: '',
    component: BlogOverviewPageComponent,
  },
  {
    path: 'blog/:id',
    loadComponent: () =>
      import('./blog-detail-page/blog-detail-page').then((m) => m.BlogDetailPageComponent),
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

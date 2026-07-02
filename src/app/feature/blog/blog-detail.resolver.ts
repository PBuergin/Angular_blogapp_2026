import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

import { Blog } from '../../../models/blog';
import { BlogService } from './blog.service';

export const blogDetailResolver: ResolveFn<Blog | undefined> = (route) => {
  const blogService = inject(BlogService);
  const id = Number(route.paramMap.get('id'));

  return blogService.getById(id);
};

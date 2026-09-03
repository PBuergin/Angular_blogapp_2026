import { HttpInterceptorFn } from '@angular/common/http';

import { environment } from '../../environments/environment';

export const bffInterceptor: HttpInterceptorFn = (req, next) => {
  // Nur Requests an das BFF verändern
  if (!req.url.startsWith(environment.api)) {
    return next(req);
  }

  const request = req.clone({
    withCredentials: true,
    setHeaders: {
      'X-Requested-With': 'XMLHttpRequest',
    },
  });

  return next(request);
};

import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';

import { AuthStore } from '../services/auth-store';

export const authGuard: CanMatchFn = async (_route, segments) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  // Warten, bis der initiale Session-Check abgeschlossen ist
  await authStore.ready;

  const returnUrl = '/' + segments.map((segment) => segment.path).join('/');

  if (!authStore.isAuthenticated()) {
    return router.createUrlTree(['/login'], {
      queryParams: {
        returnUrl,
      },
    });
  }

  if (!authStore.roles().includes('user')) {
    return router.createUrlTree(['/']);
  }

  return true;
};

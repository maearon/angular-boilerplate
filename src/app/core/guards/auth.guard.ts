import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

/** Requires Bearer token in storage (Sanctum). */
export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  const token = localStorage.getItem('token') ?? sessionStorage.getItem('token');
  if (token) {
    return true;
  }

  void router.navigate(['/login']);
  return false;
};

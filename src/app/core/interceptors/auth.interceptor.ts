import { HttpInterceptorFn } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const toastr = inject(ToastrService);
  const platformId = inject(PLATFORM_ID);

  if (isPlatformBrowser(platformId)) {
    const token = localStorage.getItem('token') ?? sessionStorage.getItem('token');
    if (token) {
      req = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      });
    }
  }

  return next(req).pipe(
    catchError((err) => {
      if (
        err.status === 401 &&
        !req.url.includes('/login') &&
        // !req.url.includes('/user') &&
        !req.url.includes('/signup') &&
        !req.url.includes('/account_activations') &&
        !req.url.includes('/password_resets')
      ) {
        toastr.error('Session expired or unauthorized.');
      }
      return throwError(() => err);
    }),
  );
};

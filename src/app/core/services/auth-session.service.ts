import { isPlatformBrowser } from '@angular/common';
import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, switchMap, tap, catchError, of } from 'rxjs';
import type { CurrentUserJson, LoginResponseJson } from '../models/api.types';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  /** Current user from GET /user or login */
  readonly user = signal<CurrentUserJson | null>(null);
  readonly loggedIn = computed(() => this.user() !== null);

  initFromStorage(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const token = localStorage.getItem('token') ?? sessionStorage.getItem('token');
    if (!token) {
      return;
    }
    this.api.get<CurrentUserJson>('/user').subscribe({
      next: (u) => this.user.set(u),
      error: () => this.clearTokens(),
    });
  }

  login(email: string, password: string, rememberMe: boolean): Observable<CurrentUserJson> {
    return this.api.post<LoginResponseJson>('/login', { email, password }).pipe(
      tap((res) => {
        if (!isPlatformBrowser(this.platformId)) {
          return;
        }
        if (rememberMe) {
          localStorage.setItem('token', res.token);
        } else {
          sessionStorage.setItem('token', res.token);
        }
      }),
      switchMap(() => this.api.get<CurrentUserJson>('/user')),
      tap((u) => this.user.set(u)),
    );
  }

  logout(): Observable<unknown> {
    return this.api.post<{ message: string }>('/logout', {}).pipe(
      tap(() => {
        this.clearTokens();
        this.user.set(null);
        void this.router.navigateByUrl('/');
      }),
      catchError(() => {
        this.clearTokens();
        this.user.set(null);
        void this.router.navigateByUrl('/');
        return of(null);
      }),
    );
  }

  private clearTokens(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
  }
}

import { isPlatformBrowser } from '@angular/common';
import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, switchMap, tap, catchError, of } from 'rxjs';
import type { CurrentUserJson, LoginResponseJson, SessionResponse } from '../models/api.types';
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
    this.api.get<SessionResponse>('/sessions').subscribe({
      next: (res) => this.user.set(res.user),
      error: () => this.clearTokens(),
    });
  }

  login(email: string, password: string, rememberMe: boolean): Observable<SessionResponse> {
    return this.api.post<LoginResponseJson>('/login', { session: { email, password } }).pipe(
      tap((res) => {
        console.log(res);
        if (!isPlatformBrowser(this.platformId)) {
          return;
        }
        const token = res.tokens.access.token;
        if (rememberMe) {
          localStorage.setItem('token', token);
        } else {
          sessionStorage.setItem('token', token);
        }
      }),
      switchMap(() => this.api.get<SessionResponse>('/sessions')),
      tap((res) => this.user.set(res.user)),
    );
  }

  logout(): Observable<unknown> {
    return this.api.delete<{ message: string }>('/logout', {}).pipe(
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

  incrementMicropostCount(): void {
    const u = this.user();
    if (!u) return;

    this.user.set({
      ...u,
      micropost: (u.micropost ?? 0) + 1,
    });
  }

  decrementMicropostCount(): void {
    const u = this.user();
    if (!u) return;

    this.user.set({
      ...u,
      micropost: Math.max((u.micropost ?? 1) - 1, 0),
    });
  }
}

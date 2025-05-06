import { Injectable } from "@angular/core"
import { Router } from "@angular/router"
import { Store } from "@ngrx/store"
import { type Observable, of, throwError } from "rxjs"
import { catchError, tap } from "rxjs/operators"
import { ApiService } from "./api.service"
import type { User } from "../models/user.model"
import * as SessionActions from "../store/session/session.actions"

export interface LoginCredentials {
  email: string
  password: string
  remember_me: boolean
}

export interface LoginResponse {
  user: User
  tokens: {
    access: {
      token: string
      expires: string
    }
    refresh: {
      token: string
      expires: string
    }
  }
  flash?: [string, string]
}

@Injectable({
  providedIn: "root",
})
export class AuthService {
  constructor(
    private apiService: ApiService,
    private store: Store,
    private router: Router,
  ) {}

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.apiService.post<LoginResponse>("/login", { session: credentials }).pipe(
      tap((response) => {
        if (response.tokens && response.tokens.access) {
          const { token, expires } = response.tokens.access
          const rememberToken = response.tokens.refresh?.token || ""

          if (credentials.remember_me) {
            localStorage.setItem("token", token)
            localStorage.setItem("remember_token", rememberToken)
          } else {
            sessionStorage.setItem("token", token)
            sessionStorage.setItem("remember_token", rememberToken)
          }

          this.store.dispatch(SessionActions.loginSuccess({ user: response.user }))
        }
      }),
    )
  }

  logout(): Observable<any> {
    return this.apiService.delete("/logout").pipe(
      tap(() => {
        localStorage.removeItem("token")
        localStorage.removeItem("remember_token")
        sessionStorage.removeItem("token")
        sessionStorage.removeItem("remember_token")
        this.store.dispatch(SessionActions.logout())
        this.router.navigate(["/"])
      }),
      catchError((error) => {
        // Even if the API call fails, we still want to log out locally
        localStorage.removeItem("token")
        localStorage.removeItem("remember_token")
        sessionStorage.removeItem("token")
        sessionStorage.removeItem("remember_token")
        this.store.dispatch(SessionActions.logout())
        this.router.navigate(["/"])
        return throwError(() => error)
      }),
    )
  }

  checkAuthStatus(): void {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token")

    if (!token) {
      this.store.dispatch(SessionActions.checkAuthStatusComplete({ loggedIn: false }))
      return
    }

    this.apiService
      .get<{ user: User }>("/sessions")
      .pipe(
        tap((response) => {
          if (response && response.user) {
            this.store.dispatch(SessionActions.loginSuccess({ user: response.user }))
          } else {
            this.store.dispatch(SessionActions.checkAuthStatusComplete({ loggedIn: false }))
          }
        }),
        catchError((error) => {
          this.store.dispatch(SessionActions.checkAuthStatusComplete({ loggedIn: false }))
          return of(error)
        }),
      )
      .subscribe()
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem("token") || !!sessionStorage.getItem("token")
  }
}

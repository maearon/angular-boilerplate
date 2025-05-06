import { Injectable } from "@angular/core"
import { type Actions, createEffect, ofType } from "@ngrx/effects"
import { of } from "rxjs"
import { catchError, map, switchMap } from "rxjs/operators"
import type { Router } from "@angular/router"
import type { ToastrService } from "ngx-toastr"
import type { AuthService } from "../../services/auth.service"
import * as SessionActions from "./session.actions"

@Injectable()
export class SessionEffects {
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SessionActions.login),
      switchMap(({ email, password, rememberMe }) =>
        this.authService.login({ email, password, remember_me: rememberMe }).pipe(
          map((response) => {
            this.toastr.success("Logged in successfully")
            this.router.navigate(["/"])
            return SessionActions.loginSuccess({ user: response.user })
          }),
          catchError((error) => {
            let errorMessage = "Login failed"
            if (error.error && error.error.message) {
              errorMessage = error.error.message
            }
            this.toastr.error(errorMessage)
            return of(SessionActions.loginFailure({ error }))
          }),
        ),
      ),
    ),
  )

  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService,
  ) {}
}

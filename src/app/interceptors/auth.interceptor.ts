import { HttpInterceptorFn } from "@angular/common/http"
import { inject } from "@angular/core"
import { catchError, throwError } from "rxjs"
import { Router } from "@angular/router"
import { ToastrService } from "ngx-toastr"

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router)
  const toastr = inject(ToastrService)

  // Get token from storage
  const token = localStorage.getItem("token") || sessionStorage.getItem("token")
  const rememberToken = localStorage.getItem("remember_token") || sessionStorage.getItem("remember_token")

  // Clone the request and add the authorization header if token exists
  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token} ${rememberToken || ""}`,
      },
    })

    return next(authReq).pipe(
      catchError((error) => {
        // Handle 401 errors for session checks silently
        if (error.status === 401 && req.url.includes("/sessions")) {
          return next(req)
        }

        // Handle other 401 errors (unauthorized)
        if (error.status === 401) {
          localStorage.removeItem("token")
          localStorage.removeItem("remember_token")
          sessionStorage.removeItem("token")
          sessionStorage.removeItem("remember_token")
          router.navigate(["/login"])
          toastr.error("Your session has expired. Please log in again.")
        }

        return throwError(() => error)
      }),
    )
  }

  return next(req)
}

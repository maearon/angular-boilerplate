import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthSessionService } from '../../core/services/auth-session.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="row">
      <div class="col-md-6 offset-md-3">
        <h1 class="mb-4">Log in</h1>
        <form (submit)="onSubmit($event)">
          <div class="mb-3">
            <label class="form-label" for="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              class="form-control"
              required
              [(ngModel)]="email"
              autocomplete="username"
            />
          </div>
          <div class="mb-3">
            <label class="form-label" for="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              class="form-control"
              required
              [(ngModel)]="password"
              autocomplete="current-password"
            />
          </div>
          <div class="mb-3 form-check">
            <input id="rm" type="checkbox" class="form-check-input" [(ngModel)]="rememberMe" name="rm" />
            <label class="form-check-label" for="rm">Remember me on this computer</label>
          </div>
          <button type="submit" class="btn btn-primary w-100" [disabled]="loading()">
            @if (loading()) {
              <span class="spinner-border spinner-border-sm me-2"></span>
            }
            Log in
          </button>
          <p class="mt-3 text-center mb-0">New user? <a routerLink="/signup">Sign up now!</a></p>
        </form>
        <p class="text-center mt-4">
          <a routerLink="/password_resets/new" class="btn btn-outline-secondary btn-sm">Forgot Password?</a>
        </p>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private readonly auth = inject(AuthSessionService);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);

  email = '';
  password = '';
  rememberMe = true;
  readonly loading = signal(false);

  onSubmit(ev: Event): void {
    ev.preventDefault();
    this.loading.set(true);
    this.auth.login(this.email, this.password, this.rememberMe).subscribe({
      next: () => {
        this.toastr.success('Logged in');
        this.loading.set(false);
        void this.router.navigateByUrl('/');
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err.error?.message ?? 'Login failed';
        this.toastr.error(msg);
      },
    });
  }
}

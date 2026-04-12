import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { PasswordResetService } from '../../core/services/password-reset.service';

/** Route: password_resets/:token — stub (đặt lại mật khẩu qua Laravel web hoặc API sau này). */
@Component({
  selector: 'app-password-resets',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `


    <div class="row">
    <div class="col-md-6 offset-md-3">
    <h1 class="h4">Reset password</h1>
    <p class="text-muted">Token: <code>{{ token }}</code></p>
    <form (submit)="onSubmit($event)" class="mt-3">
      <div class="mb-3">
        <label class="form-label">Email</label>
        <input
          type="email"
          class="form-control"
          required
          [(ngModel)]="email"
          name="email"
        />
      </div>

      <div class="mb-3">
        <label class="form-label">New password</label>
        <input
          type="password"
          class="form-control"
          required
          [(ngModel)]="password"
          name="password"
        />
      </div>

      <div class="mb-3">
        <label class="form-label">Confirm password</label>
        <input
          type="password"
          class="form-control"
          required
          [(ngModel)]="passwordConfirmation"
          name="passwordConfirmation"
        />
      </div>

      <button class="btn btn-primary" [disabled]="submitting()">
        @if (submitting()) {
          <span class="spinner-border spinner-border-sm me-2"></span>
        }
        Reset password
      </button>
    </form>
    @if (error()) {
      <div class="alert alert-danger mt-3">
        {{ error() }}
      </div>
    }

    @if (success()) {
      <div class="alert alert-success mt-3">
        Password reset thành công!
      </div>
      <a routerLink="/login" class="btn btn-primary mt-2">Login</a>
    }

    <p>Form đặt lại mật khẩu có thể nối với API Laravel sau. Hiện dùng luồng web hoặc thêm endpoint.</p>
    <a routerLink="/password_resets/new" class="btn btn-outline-secondary me-2">Request new link</a>
    <a routerLink="/" class="btn btn-outline-primary">Home</a>
    </div>
    </div>


  `,
})
export class PasswordResetsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);
  private readonly passwordResetService = inject(PasswordResetService);

  readonly token = this.route.snapshot.paramMap.get('token') ?? '';

  email = '';
  password = '';
  passwordConfirmation = '';

  readonly submitting = signal(false);
  readonly success = signal(false);
  readonly error = signal<string | null>(null);

  onSubmit(ev: Event): void {
    ev.preventDefault();

    if (!this.email || !this.password || !this.passwordConfirmation) return;

    if (this.password !== this.passwordConfirmation) {
      this.error.set('Password confirmation không khớp');
      return;
    }

    this.submitting.set(true);
    this.error.set(null);

    this.passwordResetService
      .resetPassword(this.token, {
        email: this.email,
        user: {
          password: this.password,
          password_confirmation: this.passwordConfirmation,
        },
      })
      .subscribe({
        next: (res) => {
          this.success.set(true);
          this.toastr.success(res.flash?.[1] || 'Reset password thành công!');
          this.submitting.set(false);

          // redirect sau 10s
          setTimeout(() => this.router.navigate(['/login']), 10000);
        },
        error: (err) => {
          const message =
            err?.error?.message ||
            err?.error?.errors?.[0] ||
            'Reset password thất bại';

          this.error.set(message);
          this.toastr.error(message);
          this.submitting.set(false);
        },
      });
  }
}

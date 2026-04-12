import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AccountActivationService } from '../../core/services/account-activation.service';

/** Route: account_activations/:token/edit — stub (activation thường xử lý qua Laravel web). */
@Component({
  selector: 'app-account-activations',
  standalone: true,
  imports: [RouterLink],
  template: `
    <h1 class="h4">Account activation</h1>
    <p class="text-muted">
      Token in URL: <code>{{ token }}</code>
    </p>
    @if (loading()) {
      <div class="mt-3">
        <span class="spinner-border spinner-border-sm me-2"></span>
        Activating account...
      </div>
    } else @if (error()) {
      <div class="alert alert-danger mt-3">
        Activation failed: {{ error() }}
      </div>
    }

    @if (error()) {
      <div class="alert alert-danger mt-3">
        {{ error() }}
      </div>
    }

    @if (success()) {
      <div class="alert alert-success mt-3">
        Account activated successfully!
      </div>
      <a routerLink="/" class="btn btn-primary mt-2">Go Home</a>
    }

    <p>
      Kích hoạt tài khoản thường được xử lý bởi backend web. Thêm API hoặc redirect tới Laravel nếu cần.
    </p>
    <a routerLink="/" class="btn btn-outline-primary">Home</a>
  `,
})
export class AccountActivationsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);
  private readonly activationService = inject(AccountActivationService);

  readonly token = this.route.snapshot.paramMap.get('token') ?? '';
  readonly email = this.route.snapshot.queryParamMap.get('email') ?? 'random@example.com';

  readonly loading = signal(false);
  readonly success = signal(false);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    if (!this.token || !this.email) {
      this.error.set('Token hoặc email không hợp lệ');
      return;
    }

    this.activate();
  }

  activate(): void {
    this.loading.set(true);

    this.activationService
      .activateAccount(this.token, this.email)
      .subscribe({
        next: (res) => {
          this.success.set(true);
          this.toastr.success(res.flash?.[1] || 'Kích hoạt thành công!');
          this.loading.set(false);

          // Optional: redirect sau 10s
          setTimeout(() => this.router.navigate(['/login']), 10000);
        },
        error: (err) => {
          const message =
            err?.error?.message ||
            err?.error?.errors?.[0] ||
            'Kích hoạt thất bại';

          this.error.set(message);
          this.toastr.error(message);
          this.loading.set(false);
        },
      });
  }
}

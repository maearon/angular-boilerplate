import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

/** Route: password_resets/:token — stub (đặt lại mật khẩu qua Laravel web hoặc API sau này). */
@Component({
  selector: 'app-password-resets',
  standalone: true,
  imports: [RouterLink],
  template: `
    <h1 class="h4">Reset password</h1>
    <p class="text-muted">Token: <code>{{ token }}</code></p>
    <p>Form đặt lại mật khẩu có thể nối với API Laravel sau. Hiện dùng luồng web hoặc thêm endpoint.</p>
    <a routerLink="/password_resets/new" class="btn btn-outline-secondary me-2">Request new link</a>
    <a routerLink="/" class="btn btn-outline-primary">Home</a>
  `,
})
export class PasswordResetsComponent {
  private readonly route = inject(ActivatedRoute);

  readonly token = this.route.snapshot.paramMap.get('token') ?? '';
}

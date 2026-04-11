import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

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
    <p>
      Kích hoạt tài khoản thường được xử lý bởi backend web. Thêm API hoặc redirect tới Laravel nếu cần.
    </p>
    <a routerLink="/" class="btn btn-outline-primary">Home</a>
  `,
})
export class AccountActivationsComponent {
  private readonly route = inject(ActivatedRoute);

  readonly token = this.route.snapshot.paramMap.get('token') ?? '';
}

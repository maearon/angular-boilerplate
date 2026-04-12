import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AccountActivationService } from '../../core/services/account-activation.service';

@Component({
  selector: 'app-account-activations-new',
  standalone: true,
  imports: [FormsModule],
  template: `

    <div class="row">
      <div class="col-md-6 offset-md-3">
        <h1>Resend Activation Email</h1>
        <form (submit)="onSubmit($event)">
          <div class="mb-3">
            <label class="form-label" for="email">Email</label>
            <input id="email" name="email" type="email" class="form-control" required [(ngModel)]="email" />
          </div>
          <button type="submit" class="btn btn-primary" [disabled]="submitting()">
            @if (submitting()) {
              <span class="spinner-border spinner-border-sm me-2"></span>
            }
            Resend activation email
          </button>
        </form>
      </div>
    </div>
  `,
})
export class AccountActivationsNewComponent {
  private readonly toastr = inject(ToastrService);
  private readonly activationService = inject(AccountActivationService);

  email = '';
  readonly submitting = signal(false);

  onSubmit(ev: Event): void {
    ev.preventDefault();
    if (!this.email) return;
    this.submitting.set(true);
    // setTimeout(() => {
    //   this.toastr.info('Resend activation API chưa có — thêm endpoint Laravel hoặc dùng web.');
    //   this.submitting.set(false);
    // }, 400);
    this.activationService.resendActivationEmail({ resend_activation_email: { email: this.email } }).subscribe({
      next: () => {
        this.toastr.success('Activation email sent');
        this.submitting.set(false);
      },
      error: (err) => {
        this.submitting.set(false);
        const msg = err.error?.message ?? 'Failed to send activation email';
        this.toastr.error(msg);
      },
    });
  }
}

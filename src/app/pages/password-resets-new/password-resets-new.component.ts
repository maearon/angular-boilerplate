import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { PasswordResetService } from '../../core/services/password-reset.service';

@Component({
  selector: 'app-password-resets-new',
  standalone: true,
  imports: [FormsModule],
  template: `

    <div class="row">
      <div class="col-md-6 offset-md-3">
        <h1>Forgot password</h1>
        <form (submit)="onSubmit($event)">
          <div class="mb-3">
            <label class="form-label" for="email">Email</label>
            <input id="email" name="email" type="email" class="form-control" required [(ngModel)]="email" />
          </div>
          <button type="submit" class="btn btn-primary" [disabled]="submitting()">
            @if (submitting()) {
              <span class="spinner-border spinner-border-sm me-2"></span>
            }
            Submit
          </button>
        </form>
      </div>
    </div>
  `,
})
export class PasswordResetsNewComponent {
  private readonly toastr = inject(ToastrService);
  private readonly passwordResetService = inject(PasswordResetService);

  email = '';
  readonly submitting = signal(false);

  onSubmit(ev: Event): void {
    ev.preventDefault();
    if (!this.email) return;
    this.submitting.set(true);
    // setTimeout(() => {
    //   this.toastr.info('Password reset API for SPA is not wired yet. Use Laravel web routes or add POST /api/password/forgot.');
    //   this.email = '';
    //   this.submitting.set(false);
    // }, 400);
    this.passwordResetService.requestPasswordReset({ password_reset: { email: this.email } }).subscribe({
      next: () => {
        this.toastr.success('Password reset email sent');
        this.submitting.set(false);
      },
      error: (err) => {
        this.submitting.set(false);
        const msg = err.error?.message ?? 'Failed to send password reset email';
        this.toastr.error(msg);
      },
    });
  }
}

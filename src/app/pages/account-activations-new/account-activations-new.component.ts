import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-account-activations-new',
  standalone: true,
  imports: [FormsModule],
  template: `
    <h1>Resend Activation Email</h1>
    <div class="row">
      <div class="col-md-6 offset-md-3">
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

  email = '';
  readonly submitting = signal(false);

  onSubmit(ev: Event): void {
    ev.preventDefault();
    this.submitting.set(true);
    setTimeout(() => {
      this.toastr.info('Resend activation API chưa có — thêm endpoint Laravel hoặc dùng web.');
      this.submitting.set(false);
    }, 400);
  }
}

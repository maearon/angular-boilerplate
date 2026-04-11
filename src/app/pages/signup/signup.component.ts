import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <h1>Sign up</h1>
    <div class="row">
      <div class="col-md-6 offset-md-3">
        <form (submit)="onSubmit($event)">
          @if (errors().length) {
            <div class="alert alert-danger">
              <ul class="mb-0">
                @for (e of errors(); track e) {
                  <li>{{ e }}</li>
                }
              </ul>
            </div>
          }
          <div class="mb-3">
            <label class="form-label" for="name">Name</label>
            <input id="name" name="name" class="form-control" required [(ngModel)]="name" />
          </div>
          <div class="mb-3">
            <label class="form-label" for="email">Email</label>
            <input id="email" name="email" type="email" class="form-control" required [(ngModel)]="email" />
          </div>
          <div class="mb-3">
            <label class="form-label" for="password">Password</label>
            <input id="password" name="password" type="password" class="form-control" required [(ngModel)]="password" />
          </div>
          <div class="mb-3">
            <label class="form-label" for="pc">Confirmation</label>
            <input id="pc" name="pc" type="password" class="form-control" required [(ngModel)]="passwordConfirmation" />
          </div>
          <button type="submit" class="btn btn-primary" [disabled]="submitting()">Create my account</button>
        </form>
        <p class="text-center mt-4">
          <a routerLink="/account_activations/new" class="btn btn-outline-secondary btn-sm">Resend activation email</a>
        </p>
      </div>
    </div>
  `,
})
export class SignupComponent {
  private readonly users = inject(UserService);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);

  name = '';
  email = '';
  password = '';
  passwordConfirmation = '';
  readonly submitting = signal(false);
  readonly errors = signal<string[]>([]);

  onSubmit(ev: Event): void {
    ev.preventDefault();
    this.errors.set([]);
    if (this.password !== this.passwordConfirmation) {
      this.errors.set(['Password confirmation does not match']);
      return;
    }
    this.submitting.set(true);
    this.users.register({ name: this.name, email: this.email, password: this.password }).subscribe({
      next: () => {
        this.toastr.success('Account created — you can log in.');
        this.submitting.set(false);
        void this.router.navigate(['/login']);
      },
      error: (err) => {
        this.submitting.set(false);
        const bag = err.error?.errors;
        if (bag) {
          const list: string[] = [];
          for (const k of Object.keys(bag)) {
            for (const m of bag[k]) {
              list.push(`${k}: ${m}`);
            }
          }
          this.errors.set(list);
        } else {
          this.toastr.error(err.error?.message ?? 'Registration failed');
        }
      },
    });
  }
}

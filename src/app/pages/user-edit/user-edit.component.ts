import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import type { UserProfileJson } from '../../core/models/api.types';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-user-edit',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="container py-4">
      <h1 class="mb-4 h3">Update your profile</h1>
      @if (loading()) {
        <div class="text-center py-5"><div class="spinner-border"></div></div>
      } @else if (user(); as u) {
        <div class="row">
          <div class="col-md-4">
            <div class="card mb-4">
              <div class="card-body text-center">
                <img [src]="u.gravatar" [alt]="u.name" class="gravatar rounded-circle mb-3" width="80" height="80" />
                <h2 class="h5">{{ u.name }}</h2>
                <p class="mt-2">
                  <a href="https://gravatar.com/emails" target="_blank" rel="noopener noreferrer">change</a>
                </p>
              </div>
            </div>
          </div>
          <div class="col-md-8">
            <div class="card">
              <div class="card-body">
                <form (submit)="submit($event)">
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
                    <label class="form-label" for="pw">Password</label>
                    <input id="pw" name="pw" type="password" class="form-control" [(ngModel)]="password" />
                  </div>
                  <button type="submit" class="btn btn-primary" [disabled]="submitting()">Save changes</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class UserEditComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly users = inject(UserService);
  private readonly toastr = inject(ToastrService);

  readonly user = signal<UserProfileJson | null>(null);
  readonly loading = signal(true);
  readonly submitting = signal(false);
  readonly errors = signal<string[]>([]);

  name = '';
  email = '';
  password = '';
  private userId = 0;

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      if (!Number.isFinite(id)) {
        void this.router.navigate(['/']);
        return;
      }
      this.userId = id;
      this.users.getProfile(id).subscribe({
        next: (p) => {
          this.user.set(p);
          this.name = p.name;
          this.email = p.email;
          this.loading.set(false);
        },
        error: () => {
          this.toastr.error('Could not load profile');
          void this.router.navigate(['/']);
        },
      });
    });
  }

  submit(ev: Event): void {
    ev.preventDefault();
    this.errors.set([]);
    this.submitting.set(true);
    const body: { name: string; email: string; password?: string } = { name: this.name, email: this.email };
    if (this.password.trim()) {
      body.password = this.password;
    }
    this.users.update(this.userId, body).subscribe({
      next: () => {
        this.toastr.success('Profile updated');
        this.submitting.set(false);
        void this.router.navigate(['/users', this.userId]);
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
          this.toastr.error('Update failed');
        }
      },
    });
  }
}

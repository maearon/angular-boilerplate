import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import type { UserJson } from '../../core/models/api.types';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [RouterLink],
  template: `
    <h1 class="mb-4">All users</h1>
    @if (loading()) {
      <div class="text-center py-5">
        <div class="spinner-border" role="status"></div>
      </div>
    } @else if (list().length === 0) {
      <p>No users found.</p>
    } @else {
      <ul class="list-group">
        @for (u of list(); track u.id) {
          <li class="list-group-item d-flex align-items-center">
            <img [src]="u.gravatar" [alt]="u.name" class="gravatar rounded-circle me-3" width="50" height="50" />
            <a [routerLink]="['/users', u.id]" class="flex-grow-1">{{ u.username }}</a>
          </li>
        }
      </ul>
      @if (meta(); as m) {
        @if (m.last_page > 1) {
          <nav class="mt-3">
            <ul class="pagination justify-content-center">
              <li class="page-item" [class.disabled]="m.current_page <= 1">
                <button type="button" class="page-link" (click)="go(m.current_page - 1)">Previous</button>
              </li>
              <li class="page-item disabled">
                <span class="page-link">{{ m.current_page }} / {{ m.last_page }}</span>
              </li>
              <li class="page-item" [class.disabled]="m.current_page >= m.last_page">
                <button type="button" class="page-link" (click)="go(m.current_page + 1)">Next</button>
              </li>
            </ul>
          </nav>
        }
      }
    }
  `,
})
export class UsersComponent implements OnInit {
  private readonly users = inject(UserService);
  private readonly toastr = inject(ToastrService);

  readonly list = signal<UserJson[]>([]);
  readonly meta = signal<{ current_page: number; last_page: number } | null>(null);
  readonly loading = signal(true);
  private page = 1;

  ngOnInit(): void {
    this.fetch();
  }

  go(p: number): void {
    this.page = p;
    this.fetch();
  }

  private fetch(): void {
    this.loading.set(true);
    this.users.list(this.page, 10).subscribe({
      next: (res) => {
        this.list.set(res.data);
        this.meta.set({ current_page: res.meta.current_page, last_page: res.meta.last_page });
        this.loading.set(false);
      },
      error: () => {
        this.toastr.error('Failed to load users');
        this.loading.set(false);
      },
    });
  }
}

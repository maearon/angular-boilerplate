import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { combineLatest, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import type { UserJson, UserProfileJson } from '../../core/models/api.types';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-show-follow',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    @if (header(); as h) {
      <div class="text-center mb-4">
        <img [src]="h.avatar" [alt]="h.name" class="gravatar rounded-circle mb-3" width="100" height="100" />
        <h1 class="h4">{{ h.name }}</h1>
        <div>{{ h.micropost }} micropost{{ h.micropost !== 1 ? 's' : '' }}</div>
      </div>
    }
    <ul class="nav nav-tabs justify-content-center mb-4">
      <li class="nav-item">
        <a
          class="nav-link"
          [routerLink]="['/users', userId()]"
          routerLinkActive="active"
          [routerLinkActiveOptions]="{ exact: true }"
          >Profile</a
        >
      </li>
      <li class="nav-item">
        <a class="nav-link" [routerLink]="['/users', userId(), 'following']" routerLinkActive="active">Following</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" [routerLink]="['/users', userId(), 'followers']" routerLinkActive="active">Followers</a>
      </li>
    </ul>
    @if (loading()) {
      <div class="text-center py-5"><div class="spinner-border"></div></div>
    } @else {
      <h2 class="h5 mb-3">{{ kind() === 'following' ? 'Following' : 'Followers' }} ({{ total() }})</h2>
      @if (list().length === 0) {
        <p class="text-center text-muted">No users yet.</p>
      } @else {
        <ul class="list-group">
          @for (u of list(); track u.id) {
            <li class="list-group-item d-flex align-items-center">
              <img [src]="u.avatar" [alt]="u.name" class="gravatar rounded-circle me-3" width="50" height="50" />
              <a [routerLink]="['/users', u.id]" class="flex-grow-1">{{ u.name }}</a>
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
    }
  `,
})
export class ShowFollowComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly users = inject(UserService);
  private readonly toastr = inject(ToastrService);

  readonly userId = signal(0);
  readonly kind = signal<'following' | 'followers'>('following');
  readonly header = signal<UserProfileJson | null>(null);
  readonly list = signal<UserJson[]>([]);
  readonly meta = signal<{ current_page: number; last_page: number } | null>(null);
  readonly total = signal(0);
  readonly loading = signal(true);
  private page = 1;

  ngOnInit(): void {
    combineLatest([
      this.route.paramMap.pipe(map((p) => Number(p.get('id')) || 0)),
      this.route.data.pipe(map((d) => (d['followType'] ?? 'following') as 'following' | 'followers')),
    ]).subscribe(([id, kind]) => {
      this.userId.set(id);
      this.kind.set(kind);
      this.page = 1;
      this.load();
    });
  }

  go(p: number): void {
    this.page = p;
    this.load();
  }

  private load(): void {
    const id = this.userId();
    if (!id) {
      return;
    }
    this.loading.set(true);
    const list$ =
      this.kind() === 'following'
        ? this.users.following(id, this.page, 10)
        : this.users.followers(id, this.page, 10);

    forkJoin({ profile: this.users.getProfile(id), list: list$ }).subscribe({
      next: ({ profile, list }) => {
        this.header.set(profile);
        this.list.set(list.data);
        this.meta.set({ current_page: list.meta.current_page, last_page: list.meta.last_page });
        this.total.set(list.meta.total);
        this.loading.set(false);
      },
      error: () => {
        this.toastr.error('Failed to load');
        this.loading.set(false);
      },
    });
  }
}

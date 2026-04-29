import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import type { MicropostJson, UserProfileJson } from '../../core/models/api.types';
import { AuthSessionService } from '../../core/services/auth-session.service';
import { RelationshipService } from '../../core/services/relationship.service';
import { UserService } from '../../core/services/user.service';
import { TimeAgoPipe } from '../../core/pipes/time-ago.pipe';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [RouterLink, TimeAgoPipe],
  template: `
    @if (loading()) {
      <div class="text-center py-5"><div class="spinner-border"></div></div>
    } @else if (error()) {
      <div class="alert alert-danger">{{ error() }}</div>
    } @else if (profile(); as u) {
      <div class="row">
        <div class="col-md-4">
          <div class="card mb-4">
            <div class="card-body">
              <div class="d-flex align-items-center mb-3">
                <img [src]="u.avatar" [alt]="u.name" class="gravatar rounded-circle me-3" width="80" height="80" />
                <h2 class="h4 mb-0">{{ u.name }}</h2>
              </div>
              <div>{{ u.micropost }} micropost{{ u.micropost !== 1 ? 's' : '' }}</div>
            </div>
          </div>
          <div class="card">
            <div class="card-body">
              <div class="d-flex justify-content-around">
                <a [routerLink]="['/users', u.id, 'following']" class="text-decoration-none text-center">
                  <div class="h5 mb-0">{{ u.following }}</div>
                  <div>following</div>
                </a>
                <a [routerLink]="['/users', u.id, 'followers']" class="text-decoration-none text-center">
                  <div class="h5 mb-0">{{ u.followers }}</div>
                  <div>followers</div>
                </a>
              </div>
              @if (auth.user()?.id !== u.id) {
                <div class="text-center mt-3">
                  @if (u.currentUserFollowingUser) {
                    <button type="button" class="btn btn-outline-danger" [disabled]="busy()" (click)="unfollow(u.id)">
                      Unfollow
                    </button>
                  } @else {
                    <button type="button" class="btn btn-primary" [disabled]="busy()" (click)="follow(u.id)">Follow</button>
                  }
                </div>
              }
            </div>
          </div>
        </div>
        <div class="col-md-8">
          <h3 class="mb-3">Microposts</h3>
          @if (posts().length === 0) {
            <div class="alert alert-info">No microposts yet.</div>
          } @else {
            <ul class="list-group">
              @for (item of posts(); track item.id) {
                <li class="list-group-item">
                  <div class="d-flex">
                    <img [src]="item.user?.avatar" class="gravatar rounded-circle me-3" width="50" height="50" alt="" />
                    <div class="flex-grow-1">
                      <div class="mb-1">
                        <a [routerLink]="['/users', item.user?.id]">{{ item.user?.name }}</a>
                      </div>
                      <div class="mb-2">{{ item.content }}</div>
                      @if (item.imageUrl) {
                        <img [src]="item.imageUrl" class="img-fluid rounded mb-2" alt="" />
                      }
                      <div class="text-muted small">Posted {{ item.createdAt | timeAgo }} ago.</div>
                    </div>
                  </div>
                </li>
              }
            </ul>
            @if (meta(); as m) {
              @if (m.last_page > 1) {
                <nav class="mt-3">
                  <ul class="pagination justify-content-center">
                    <li class="page-item" [class.disabled]="m.current_page <= 1">
                      <button type="button" class="page-link" (click)="page(m.current_page - 1)">Previous</button>
                    </li>
                    <li class="page-item disabled">
                      <span class="page-link">{{ m.current_page }} / {{ m.last_page }}</span>
                    </li>
                    <li class="page-item" [class.disabled]="m.current_page >= m.last_page">
                      <button type="button" class="page-link" (click)="page(m.current_page + 1)">Next</button>
                    </li>
                  </ul>
                </nav>
              }
            }
          }
        </div>
      </div>
    }
  `,
})
export class UserProfileComponent implements OnInit {
  readonly auth = inject(AuthSessionService);
  private readonly route = inject(ActivatedRoute);
  private readonly users = inject(UserService);
  private readonly rel = inject(RelationshipService);
  private readonly toastr = inject(ToastrService);

  readonly profile = signal<UserProfileJson | null>(null);
  readonly posts = signal<MicropostJson[]>([]);
  readonly meta = signal<{ current_page: number; last_page: number } | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly busy = signal(false);
  private userId = 0;
  private pageNum = 1;

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      if (!Number.isFinite(id)) {
        this.error.set('Invalid user');
        this.loading.set(false);
        return;
      }
      this.userId = id;
      this.pageNum = 1;
      this.load();
    });
  }

  page(p: number): void {
    this.pageNum = p;
    this.load();
  }

  follow(id: number): void {
    this.busy.set(true);
    this.rel.follow(id).subscribe({
      next: () => {
        this.busy.set(false);
        this.load();
      },
      error: () => {
        this.busy.set(false);
        this.toastr.error('Follow failed');
      },
    });
  }

  unfollow(id: number): void {
    this.busy.set(true);
    this.rel.unfollow(id).subscribe({
      next: () => {
        this.busy.set(false);
        this.load();
      },
      error: () => {
        this.busy.set(false);
        this.toastr.error('Unfollow failed');
      },
    });
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.users.getProfile(this.userId).subscribe({
      next: (p) => {
        this.profile.set(p);
        this.users.microposts(this.userId, this.pageNum, 5).subscribe({
          next: (res) => {
            this.posts.set(res.data);
            this.meta.set({ current_page: res.meta.current_page, last_page: res.meta.last_page });
            this.loading.set(false);
          },
          error: () => {
            this.loading.set(false);
            this.toastr.error('Could not load microposts');
          },
        });
      },
      error: () => {
        this.loading.set(false);
        this.error.set('User not found');
      },
    });
  }
}

import { Component, effect, inject, signal, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import type { MicropostJson } from '../../core/models/api.types';
import { AuthSessionService } from '../../core/services/auth-session.service';
import { MicropostService } from '../../core/services/micropost.service';
import { TimeAgoPipe } from '../../core/pipes/time-ago.pipe';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, TimeAgoPipe],
  template: `
    @if (auth.loggedIn()) {
      <div class="row">
        <aside class="col-md-4">
          <section class="user-info mb-4">
            <div class="d-flex align-items-center mb-3">
              <img
                class="gravatar rounded-circle me-3"
                [src]="auth.user()!.gravatar"
                [alt]="auth.user()!.name"
                width="50"
                height="50"
              />
              <div>
                <h1 class="h5 mb-1">{{ auth.user()!.name }}</h1>
                <a [routerLink]="['/users', auth.user()!.id]">view my profile</a>
              </div>
            </div>
            <div>{{ auth.user()!.micropost }} micropost{{ auth.user()!.micropost !== 1 ? 's' : '' }}</div>
          </section>

          <section class="stats mb-4">
            <div class="d-flex justify-content-around">
              <div class="text-center">
                <a [routerLink]="['/users', auth.user()!.id, 'following']">
                  <strong class="d-block">{{ auth.user()!.following }}</strong>
                  following
                </a>
              </div>
              <div class="text-center">
                <a [routerLink]="['/users', auth.user()!.id, 'followers']">
                  <strong class="d-block">{{ auth.user()!.followers }}</strong>
                  followers
                </a>
              </div>
            </div>
          </section>

          <section class="micropost-form">
            <form (submit)="submitMicropost($event)">
              @if (errors().length) {
                <div class="alert alert-danger">
                  <ul class="mb-0">
                    @for (err of errors(); track err) {
                      <li>{{ err }}</li>
                    }
                  </ul>
                </div>
              }
              <div class="mb-3">
                <textarea
                  id="micropost_content"
                  class="form-control"
                  name="content"
                  rows="3"
                  placeholder="Compose new micropost..."
                  [value]="draft()"
                  (input)="draft.set($any($event.target).value)"
                ></textarea>
              </div>
              <div class="d-flex flex-wrap gap-2 align-items-center">
                <button type="submit" class="btn btn-primary me-2" [disabled]="submitting()">Post</button>
                <input
                  type="file"
                  class="form-control form-control-sm micropost-file-input"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  (change)="onFile($event)"
                />
              </div>
            </form>
          </section>
        </aside>

        <div class="col-md-8">
          <h3 class="mb-4">Micropost Feed</h3>
          @if (loading()) {
            <div class="text-center py-5">
              <div class="spinner-border" role="status"><span class="visually-hidden">Loading</span></div>
            </div>
          } @else if (feed().length === 0) {
            <div class="alert alert-info">No microposts yet.</div>
          } @else {
            <div class="micropost-feed">
              <ol class="list-unstyled">
                @for (item of feed(); track item.id) {
                  <li [id]="'micropost-' + item.id" class="media mb-4 d-flex">
                    <a [routerLink]="['/users', item.user?.id]" class="me-3">
                      <img
                        class="gravatar rounded-circle"
                        [src]="item.user?.gravatar"
                        [alt]="item.user?.name"
                        width="50"
                        height="50"
                      />
                    </a>
                    <div class="media-body">
                      <div class="user mb-1">
                        <a [routerLink]="['/users', item.user?.id]">{{ item.user?.name }}</a>
                      </div>
                      <div class="content mb-2">
                        {{ item.content }}
                        @if (item.imageUrl) {
                          <div class="mt-2">
                            <img [src]="item.imageUrl" class="img-fluid rounded" alt="" />
                          </div>
                        }
                      </div>
                      <div class="timestamp text-muted small">
                        Posted {{ item.createdAt | timeAgo }} ago.
                        @if (auth.user()?.id === item.user?.id) {
                          <a href="#" class="ms-2" (click)="remove($event, item.id)">delete</a>
                        }
                      </div>
                    </div>
                  </li>
                }
              </ol>
            </div>
            @if (meta(); as m) {
              @if (m.last_page > 1) {
                <nav>
                  <ul class="pagination">
                    <li class="page-item" [class.disabled]="m.current_page <= 1">
                      <button class="page-link" type="button" (click)="goPage(m.current_page - 1)">Previous</button>
                    </li>
                    <li class="page-item disabled">
                      <span class="page-link">{{ m.current_page }} / {{ m.last_page }}</span>
                    </li>
                    <li class="page-item" [class.disabled]="m.current_page >= m.last_page">
                      <button class="page-link" type="button" (click)="goPage(m.current_page + 1)">Next</button>
                    </li>
                  </ul>
                </nav>
              }
            }
          }
        </div>
      </div>
    } @else {
      <div class="text-center jumbotron bg-light p-5 rounded">
        <h1 class="display-4">Welcome to the Sample App</h1>
        <p class="lead">
          This is the home page for the
          <a href="https://angular.dev/" target="_blank" rel="noopener noreferrer">Angular Tutorial</a>
          sample application.
        </p>
        <a routerLink="/signup" class="btn btn-lg btn-primary">Sign up now!</a>
      </div>
      <div class="text-center mt-4 angular-logo-link">
        <a href="https://angular.dev/" target="_blank" rel="noopener noreferrer" aria-label="Angular">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 223 236" width="32" height="34" class="angular-logo">
            <g clip-path="url(#ah)">
              <path
                fill="url(#ab)"
                d="m222.077 39.192-8.019 125.923L137.387 0l84.69 39.192Zm-53.105 162.825-57.933 33.056-57.934-33.056 11.783-28.556h92.301l11.783 28.556ZM111.039 62.675l30.357 73.803H80.681l30.358-73.803ZM7.937 165.115 0 39.192 84.69 0 7.937 165.115Z"
              />
              <path
                fill="url(#ac)"
                d="m222.077 39.192-8.019 125.923L137.387 0l84.69 39.192Zm-53.105 162.825-57.933 33.056-57.934-33.056 11.783-28.556h92.301l11.783 28.556ZM111.039 62.675l30.357 73.803H80.681l30.358-73.803ZM7.937 165.115 0 39.192 84.69 0 7.937 165.115Z"
              />
            </g>
            <defs>
              <linearGradient id="ab" x1="49.009" x2="225.829" y1="213.75" y2="129.722" gradientUnits="userSpaceOnUse">
                <stop stop-color="#E40035" />
                <stop offset=".24" stop-color="#F60A48" />
                <stop offset=".352" stop-color="#F20755" />
                <stop offset=".494" stop-color="#DC087D" />
                <stop offset=".745" stop-color="#9717E7" />
                <stop offset="1" stop-color="#6C00F5" />
              </linearGradient>
              <linearGradient id="ac" x1="41.025" x2="156.741" y1="28.344" y2="160.344" gradientUnits="userSpaceOnUse">
                <stop stop-color="#FF31D9" />
                <stop offset="1" stop-color="#FF5BE1" stop-opacity="0" />
              </linearGradient>
              <clipPath id="ah"><path fill="#fff" d="M0 0h223v236H0z" /></clipPath>
            </defs>
          </svg>
        </a>
      </div>
    }
  `,
})
export class HomeComponent {
  readonly auth = inject(AuthSessionService);
  private readonly microposts = inject(MicropostService);
  private readonly toastr = inject(ToastrService);

  readonly feed = signal<MicropostJson[]>([]);
  readonly meta = signal<{ current_page: number; last_page: number; total: number } | null>(null);
  readonly loading = signal(false);
  readonly submitting = signal(false);
  readonly draft = signal('');
  readonly errors = signal<string[]>([]);
  readonly image = signal<File | null>(null);

  private page = 1;

  constructor() {
    effect(() => {
      const u = this.auth.user();
      untracked(() => {
        if (u) {
          this.page = 1;
          this.loadFeed();
        } else {
          this.feed.set([]);
          this.meta.set(null);
        }
      });
    });
  }

  goPage(p: number): void {
    this.page = p;
    this.loadFeed();
  }

  onFile(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    this.image.set(input.files?.[0] ?? null);
  }

  submitMicropost(ev: Event): void {
    ev.preventDefault();
    const content = this.draft().trim();
    if (!content) {
      this.errors.set(["Content can't be blank"]);
      return;
    }
    this.submitting.set(true);
    this.errors.set([]);
    this.microposts.create(content, this.image()).subscribe({
      next: () => {
        this.toastr.success('Micropost created');
        this.draft.set('');
        this.image.set(null);
        this.submitting.set(false);
        this.page = 1;
        this.loadFeed();
      },
      error: (err) => {
        this.submitting.set(false);
        this.toastr.error(err.error?.message ?? 'Could not create micropost');
      },
    });
  }

  remove(ev: Event, id: number): void {
    ev.preventDefault();
    if (!confirm('Are you sure?')) {
      return;
    }
    this.microposts.remove(id).subscribe({
      next: () => {
        this.toastr.success('Micropost deleted');
        this.loadFeed();
      },
      error: () => this.toastr.error('Delete failed'),
    });
  }

  private loadFeed(): void {
    this.loading.set(true);
    this.microposts.feed(this.page, 10).subscribe({
      next: (res) => {
        this.feed.set(res.data);
        this.meta.set({
          current_page: res.meta.current_page,
          last_page: res.meta.last_page,
          total: res.meta.total,
        });
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toastr.error('Could not load feed');
      },
    });
  }
}

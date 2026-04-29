import { Component, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import type { MicropostJson } from '../../core/models/api.types';
import { AuthSessionService } from '../../core/services/auth-session.service';
import { MicropostService } from '../../core/services/micropost.service';

// 👇 nhớ import các component con (standalone)
import { FeedComponent } from '../../features/shared/feed.component';
import { MicropostFormComponent } from '../../features/shared/micropost-form.component';
import { UserInfoComponent } from '../../features/shared/user-info.component';
import { StatsComponent } from '../../features/shared/stats.component';

type Meta = {
  current_page: number;
  last_page: number;
  total: number;
};

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterLink,
    FeedComponent,
    MicropostFormComponent,
    UserInfoComponent,
    StatsComponent,
  ],
  template: `
    @if (auth.loggedIn()) {
      <div class="row">
        <aside class="col-md-4">
          <section class="user-info mb-4">
            <app-user-info [user]="auth.user()"></app-user-info>
          </section>

          <section class="stats mb-4">
            <app-stats [user]="auth.user()"></app-stats>
          </section>

          <section class="micropost-form">
            <app-micropost-form
              [loading]="submitting()"
              (submitPost)="submitMicropost($event)">
            </app-micropost-form>
          </section>
        </aside>

        <div class="col-md-8">
          <h3 class="mb-4">Micropost Feed</h3>

          <app-feed
            [feed]="feed()"
            [loading]="loading()"
            [meta]="meta()"
            (pageChange)="goPage($event)"
            (deleteItem)="remove($event)">
          </app-feed>
        </div>
      </div>
    } @else {
      <div class="text-center jumbotron bg-light p-5 rounded">
        <h1 class="display-4">Welcome to the Sample App</h1>
        <p class="lead">
          This is the home page for the
          <a href="https://angular.dev/" target="_blank">Angular Tutorial</a>
          sample application.
        </p>
        <a routerLink="/signup" class="btn btn-lg btn-primary">
          Sign up now!
        </a>
      </div>
    }
  `,
})
export class HomeComponent {
  readonly auth = inject(AuthSessionService);
  private readonly microposts = inject(MicropostService);
  private readonly toastr = inject(ToastrService);

  // 🔥 state (signal)
  readonly feed = signal<MicropostJson[]>([]);
  readonly meta = signal<Meta | null>(null);
  readonly loading = signal(false);
  readonly submitting = signal(false);

  private page = 1;
  private readonly pageSize = 5;

  constructor() {
    // 🔥 reactive theo auth
    effect(() => {
      const user = this.auth.user();

      if (user) {
        this.page = 1;
        this.loadFeed();
      } else {
        this.feed.set([]);
        this.meta.set(null);
      }
    });
  }

  // ✅ pagination từ child
  goPage(page: number): void {
    this.page = page;
    this.loadFeed();
  }

  // ✅ nhận data sạch từ form
  submitMicropost(data: { content: string; file: File | null }): void {
    const { content, file } = data;

    if (!content.trim()) {
      this.toastr.error("Content can't be blank");
      return;
    }

    this.submitting.set(true);

    this.microposts.create(content, file).subscribe({
      next: () => {
        this.toastr.success('Micropost created');
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

  // ✅ delete sạch
  remove(id: number): void {
    if (!confirm('Are you sure?')) return;

    this.microposts.remove(id).subscribe({
      next: () => {
        this.toastr.success('Micropost deleted');
        this.loadFeed();
      },
      error: () => this.toastr.error('Delete failed'),
    });
  }

  // 🔥 load feed
  private loadFeed(): void {
    this.loading.set(true);

    this.microposts.feed(this.page, this.pageSize).subscribe({
      next: (res) => {
        this.feed.set(res.feed_items);

        this.meta.set({
          current_page: this.page,
          last_page: Math.ceil(res.total_count / this.pageSize), // ✅ FIX
          total: res.total_count,
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

import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { CurrentUserJson } from '../../core/models/api.types';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [RouterLink],
  template: `
    @if (user(); as u) {
      <div class="d-flex justify-content-around">
        <div class="text-center">
          <a [routerLink]="['/users', u.id, 'following']">
            <strong class="d-block">{{ u.following }}</strong>
            following
          </a>
        </div>

        <div class="text-center">
          <a [routerLink]="['/users', u.id, 'followers']">
            <strong class="d-block">{{ u.followers }}</strong>
            followers
          </a>
        </div>
      </div>
    }
  `,
})
export class StatsComponent {
  // ✅ nhận từ parent
  user = input<CurrentUserJson | null>();
}

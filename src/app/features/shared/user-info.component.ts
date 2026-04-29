import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { CurrentUserJson } from '../../core/models/api.types';

@Component({
  selector: 'app-user-info',
  standalone: true,
  imports: [RouterLink],
  template: `
    @if (user(); as u) {
      <div class="d-flex align-items-center mb-3">
        <img
          class="gravatar rounded-circle me-3"
          [src]="u.avatar"
          [alt]="u.name"
          width="50"
          height="50"
        />
        <div>
          <h1 class="h5 mb-1">{{ u.name }}</h1>
          <a [routerLink]="['/users', u.id]">view my profile</a>
        </div>
      </div>

      <div>
        {{ u.micropost }} micropost{{ u.micropost !== 1 ? 's' : '' }}
      </div>
    }
  `,
})
export class UserInfoComponent {
  // ✅ nhận data từ parent
  user = input<CurrentUserJson | null>();
}

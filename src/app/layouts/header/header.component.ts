import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthSessionService } from '../../core/services/auth-session.service';

/** Matches old Spring FE: Home + Users (when logged); About/Contact only in footer. */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary fixed-top">
  <div class="container">

    <!-- BRAND -->
    <a class="navbar-brand" routerLink="/">Sample App</a>

    <!-- TOGGLER -->
    <button
      class="navbar-toggler"
      type="button"
      data-bs-toggle="collapse"
      data-bs-target="#navbarNav"
    >
      <span class="navbar-toggler-icon"></span>
    </button>

    <!-- MENU -->
    <div class="collapse navbar-collapse" id="navbarNav">
      <ul class="navbar-nav me-auto">
        <li class="nav-item">
          <a class="nav-link" routerLink="/">Home</a>
        </li>
      </ul>

      <ul class="navbar-nav">
        <li class="nav-item">
          <a class="nav-link" routerLink="/login">Log in</a>
        </li>
      </ul>
    </div>

  </div>
</nav>
  `,
})
export class HeaderComponent {
  readonly auth = inject(AuthSessionService);

  logout(ev: Event): void {
    ev.preventDefault();
    this.auth.logout().subscribe();
  }
}

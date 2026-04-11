import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthSessionService } from '../../core/services/auth-session.service';

/** Matches old Spring FE: Home + Users (when logged); About/Contact only in footer. */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container">
        <a class="navbar-brand" routerLink="/">Sample App</a>
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <a
                class="nav-link"
                routerLink="/"
                routerLinkActive="active"
                [routerLinkActiveOptions]="{ exact: true }"
                >Home</a
              >
            </li>
            @if (auth.loggedIn()) {
              <li class="nav-item">
                <a class="nav-link" routerLink="/users" routerLinkActive="active">Users</a>
              </li>
            }
          </ul>
          <ul class="navbar-nav">
            @if (auth.loggedIn()) {
              <li class="nav-item dropdown">
                <a
                  class="nav-link dropdown-toggle"
                  href="#"
                  id="navbarDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  >Account</a
                >
                <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                  <li>
                    <a class="dropdown-item" [routerLink]="['/users', auth.user()!.id]">Profile</a>
                  </li>
                  <li>
                    <a class="dropdown-item" [routerLink]="['/users', auth.user()!.id, 'edit']">Settings</a>
                  </li>
                  <li><hr class="dropdown-divider" /></li>
                  <li>
                    <a class="dropdown-item" href="#" (click)="logout($event)">Log out</a>
                  </li>
                </ul>
              </li>
            } @else {
              <li class="nav-item">
                <a class="nav-link" routerLink="/login" routerLinkActive="active">Log in</a>
              </li>
            }
          </ul>
        </div>
      </div>
    </nav>
  `,
  styles: `
    .dropdown-menu {
      right: 0;
      left: auto;
    }
  `,
})
export class HeaderComponent {
  readonly auth = inject(AuthSessionService);

  logout(ev: Event): void {
    ev.preventDefault();
    this.auth.logout().subscribe();
  }
}

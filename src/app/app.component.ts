import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthSessionService } from './core/services/auth-session.service';
import { FooterComponent } from './layouts/footer/footer.component';
import { HeaderComponent } from './layouts/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    <div class="app-container">
      <app-header />
      <main class="container mt-4 main-content">
        <router-outlet />
      </main>
      <app-footer />
    </div>
  `,
  styles: `
    :host {
      display: block;
      min-height: 100vh;
    }
  `,
})
export class AppComponent implements OnInit {
  private readonly auth = inject(AuthSessionService);

  ngOnInit(): void {
    this.auth.initFromStorage();
  }
}

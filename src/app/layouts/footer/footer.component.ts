import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Ported from spring-boilerplate footer (About, Contact, News). */
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="footer mt-5 py-3 bg-light">
      <div class="container text-center">
        <div class="mb-2">
          <a routerLink="/about" class="me-2">About</a>
          <a routerLink="/contact" class="me-2">Contact</a>
          <a href="https://blog.angular.dev/" target="_blank" rel="noopener noreferrer">News</a>
        </div>
      </div>
    </footer>
  `,
})
export class FooterComponent {}

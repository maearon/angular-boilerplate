import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'login',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'signup',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'users',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'about',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'contact',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'account_activations/new',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'password_resets/new',
    renderMode: RenderMode.Prerender
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];

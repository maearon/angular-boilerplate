/** Dev: `ng serve` proxies `/api` → Laravel (`php artisan serve` on :8000). See `proxy.conf.json`. */
export const environment = {
  production: false,
  apiUrl: 'http://127.0.0.1:8000/api',
};

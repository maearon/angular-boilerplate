import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import type { MicropostJson, Paginated, UserJson, UserProfileJson } from '../models/api.types';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly api = inject(ApiService);

  list(page = 1, perPage = 10): Observable<Paginated<UserJson>> {
    return this.api.get<Paginated<UserJson>>('/users', { page, per_page: perPage });
  }

  getProfile(id: number): Observable<UserProfileJson> {
    return this.api.get<UserProfileJson>(`/users/${id}`);
  }

  register(body: { name: string; email: string; password: string }): Observable<UserJson> {
    return this.api.post<UserJson>('/register', body);
  }

  update(id: number, body: { name: string; email: string; password?: string }): Observable<UserJson> {
    return this.api.put<UserJson>(`/users/${id}`, body);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/users/${id}`);
  }

  microposts(userId: number, page = 1, perPage = 10): Observable<Paginated<MicropostJson>> {
    return this.api.get<Paginated<MicropostJson>>(`/users/${userId}/microposts`, { page, per_page: perPage });
  }

  following(userId: number, page = 1, perPage = 10): Observable<Paginated<UserJson>> {
    return this.api.get<Paginated<UserJson>>(`/users/${userId}/following`, { page, per_page: perPage });
  }

  followers(userId: number, page = 1, perPage = 10): Observable<Paginated<UserJson>> {
    return this.api.get<Paginated<UserJson>>(`/users/${userId}/followers`, { page, per_page: perPage });
  }
}

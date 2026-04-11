import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import type { MicropostJson, Paginated } from '../models/api.types';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class MicropostService {
  private readonly api = inject(ApiService);

  feed(page = 1, perPage = 10): Observable<Paginated<MicropostJson>> {
    return this.api.get<Paginated<MicropostJson>>('/microposts', { page, per_page: perPage });
  }

  create(content: string, image: File | null): Observable<MicropostJson> {
    const fd = new FormData();
    fd.append('content', content);
    if (image) {
      fd.append('image', image);
    }
    return this.api.postFormData<MicropostJson>('/microposts', fd);
  }

  remove(id: number): Observable<void> {
    return this.api.delete<void>(`/microposts/${id}`);
  }
}

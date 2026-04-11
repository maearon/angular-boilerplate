import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class RelationshipService {
  private readonly api = inject(ApiService);

  follow(followedId: number): Observable<{ follow: boolean }> {
    return this.api.post<{ follow: boolean }>('/relationships', { followed_id: followedId });
  }

  unfollow(followedId: number): Observable<{ unfollow: boolean }> {
    return this.api.delete<{ unfollow: boolean }>('/relationships', { followed_id: followedId });
  }
}

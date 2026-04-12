import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PasswordResetCreateParams {
  password_reset: {
    email: string;
  };
}

export interface PasswordResetCreateResponse {
  flash: [string, string];
}

export interface PasswordResetUpdateParams {
  email: string;
  user: {
    password: string;
    password_confirmation: string;
  };
}

export interface PasswordResetUpdateResponse {
  user_id?: string;
  flash?: [string, string];
  error?: string[];
}

@Injectable({
  providedIn: 'root',
})
export class PasswordResetService {
  private http = inject(HttpClient);
  private baseUrl = 'http://127.0.0.1:8000/api';

  requestPasswordReset(
    params: PasswordResetCreateParams
  ): Observable<PasswordResetCreateResponse> {
    return this.http.post<PasswordResetCreateResponse>(
      `${this.baseUrl}/password_resets`,
      params
    );
  }

  resetPassword(
    token: string,
    params: PasswordResetUpdateParams
  ): Observable<PasswordResetUpdateResponse> {
    return this.http.patch<PasswordResetUpdateResponse>(
      `${this.baseUrl}/password_resets/edit/${token}`,
      params
    );
  }
}

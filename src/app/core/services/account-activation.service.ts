import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import type { UserJson } from '../models/api.types';
import { environment } from '../../../environments/environment';

export interface ResendActivationEmailParams {
  resend_activation_email: {
    email: string;
  };
}

export interface ActivationResponse {
  user_id?: string;
  flash?: [string, string];
  error?: string[];
}

export interface ActivationUpdateResponse {
  user?: UserJson;
  jwt?: string;
  token?: string;
  flash: [string, string];
}

@Injectable({
  providedIn: 'root',
})
export class AccountActivationService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  resendActivationEmail(params: ResendActivationEmailParams): Observable<ActivationResponse> {
    return this.http.post<ActivationResponse>(
      `${this.baseUrl}/account_activations`,
      params
    );
  }

  activateAccount(token: string, email: string): Observable<ActivationUpdateResponse> {
    return this.http.patch<ActivationUpdateResponse>(
      `${this.baseUrl}/account_activations/edit/${token}`,
      { email }
    );
  }
}

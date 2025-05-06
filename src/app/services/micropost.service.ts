import { Injectable } from "@angular/core"
import type { Observable } from "rxjs"
import type { ApiService } from "./api.service"
import type { Micropost } from "../models/micropost.model"

export interface MicropostListParams {
  page?: number
  [key: string]: any
}

export interface MicropostListResponse {
  feed_items: Micropost[]
  followers: number
  following: number
  gravatar: string
  micropost: number
  total_count: number
}

export interface MicropostResponse {
  flash?: [string, string]
  error?: string[]
}

@Injectable({
  providedIn: "root",
})
export class MicropostService {
  constructor(private apiService: ApiService) {}

  getAll(params: MicropostListParams = {}): Observable<MicropostListResponse> {
    return this.apiService.get<MicropostListResponse>("", params)
  }

  create(formData: FormData): Observable<MicropostResponse> {
    return this.apiService.post<MicropostResponse>("/microposts", formData)
  }

  remove(id: number): Observable<MicropostResponse> {
    return this.apiService.delete<MicropostResponse>(`/microposts/${id}`)
  }
}

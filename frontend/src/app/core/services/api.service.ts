import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";

export const API_BASE_URL =
  (globalThis as { __env?: Record<string, string> }).__env?.["NG_APP_API_BASE_URL"] ||
  "http://localhost:4000/api";

@Injectable({ providedIn: "root" })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = API_BASE_URL;

  get<T>(path: string) {
    return this.http.get<T>(`${this.baseUrl}${path}`);
  }

  post<T>(path: string, body: unknown) {
    return this.http.post<T>(`${this.baseUrl}${path}`, body);
  }

  patch<T>(path: string, body: unknown) {
    return this.http.patch<T>(`${this.baseUrl}${path}`, body);
  }
}

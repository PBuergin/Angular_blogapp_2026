import { computed, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';

interface UserInfo {
  preferred_username: string;
  email: string;
  name: string;
  roles: string[];
}

interface AuthMeResponse {
  isAuthenticated: boolean;
  user: UserInfo | null;
}

interface LogoutResponse {
  logoutUrl: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthStore {
  readonly isAuthenticated = signal(false);
  readonly user = signal<UserInfo | null>(null);
  readonly loading = signal(true);

  readonly roles = computed(() => this.user()?.roles ?? []);

  readonly ready: Promise<void>;

  constructor() {
    this.ready = this.checkSession();
  }

  async checkSession(): Promise<void> {
    this.loading.set(true);

    try {
      const response = await fetch(`${environment.api}/auth/me`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Session-Check fehlgeschlagen: ${response.status}`);
      }

      const data: AuthMeResponse = await response.json();

      this.isAuthenticated.set(data.isAuthenticated);
      this.user.set(data.user);
    } catch (error) {
      console.error('Fehler beim Session-Check:', error);

      this.isAuthenticated.set(false);
      this.user.set(null);
    } finally {
      this.loading.set(false);
    }
  }

  async logout(): Promise<void> {
    try {
      const response = await fetch(`${environment.api}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      });

      if (!response.ok) {
        throw new Error(`Logout fehlgeschlagen: ${response.status}`);
      }

      const data: LogoutResponse = await response.json();

      window.location.href = data.logoutUrl;
    } catch (error) {
      console.error('Fehler beim Logout:', error);
    }
  }
}

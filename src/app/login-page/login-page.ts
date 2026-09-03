import { Component, input } from '@angular/core';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-login-page',
  standalone: true,
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
})
export class LoginPageComponent {
  readonly returnUrl = input<string>('/');
  readonly error = input<string>();

  login(): void {
    const url = this.returnUrl() || '/';

    window.location.href = `${environment.api}/auth/login?returnUrl=${encodeURIComponent(url)}`;
  }

  errorMessage(): string | null {
    switch (this.error()) {
      case 'access_denied':
        return 'Zugriff verweigert.';

      case 'expired':
        return 'Die Anmeldung ist abgelaufen. Bitte erneut anmelden.';

      case 'failed':
        return 'Die Anmeldung ist fehlgeschlagen.';

      default:
        return null;
    }
  }
}

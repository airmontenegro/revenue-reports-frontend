import { Component } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AccountInfo, InteractionRequiredAuthError } from '@azure/msal-browser';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  private readonly API_SCOPE = 'api://9ac61894-832b-4a38-8258-e4d641a95f2d/user_impersonation';
  adminGroup = '2eaa5375-85c5-4ba0-8d21-688b1c63821b';
  token?: string;

  constructor(private msal: MsalService, private api: ApiService, private router: Router) {}

  async ngOnInit() {
    // 1) Finish any redirect and set active account
    const result = await this.msal.instance.handleRedirectPromise();
    if (result?.account) {
      this.msal.instance.setActiveAccount(result.account);
    } else {
      const accounts = this.msal.instance.getAllAccounts();
      if (accounts.length && !this.msal.instance.getActiveAccount()) {
        this.msal.instance.setActiveAccount(accounts[0]);
      }
    }

    // 2) Ensure we have an active account; if not, sign in (requesting your API scope)
    const account = this.msal.instance.getActiveAccount() as AccountInfo | null;
    if (!account) {
      await this.msal.instance.loginRedirect({ scopes: [this.API_SCOPE] });
      return; // browser will redirect
    }

    // 3) Acquire token for YOUR API scope, with explicit account
    try {
      const silent = await this.msal.instance.acquireTokenSilent({
        account,
        scopes: [this.API_SCOPE],
      });
      this.token = silent.accessToken;          // <-- aud = your API
      this.checkRedirect(account);
    } catch (e) {
      if (e instanceof InteractionRequiredAuthError) {
        await this.msal.instance.acquireTokenRedirect({ account, scopes: [this.API_SCOPE] });
        return;
      }
      console.error('Failed to acquire API token:', e);
    }
  }

  login() {
    this.msal.instance.loginRedirect({ scopes: [this.API_SCOPE] });
  }

  private checkRedirect(account: AccountInfo) {
    const claims: any = account.idTokenClaims;
    if (claims?.groups?.includes(this.adminGroup)) {
      this.router.navigate(['/onboarding']);
    } else {
      this.router.navigate(['/']);
    }
  }
}

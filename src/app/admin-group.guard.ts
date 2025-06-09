// admin-group.guard.ts
import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  UrlTree,
} from '@angular/router';
import { MsalService } from '@azure/msal-angular';

@Injectable({ providedIn: 'root' })
export class AdminGroupGuard implements CanActivate {
  private adminGroupId = '2eaa5375-85c5-4ba0-8d21-688b1c63821b';

  constructor(private msal: MsalService, private router: Router) {}

  async canActivate(): Promise<boolean | UrlTree> {
    const account = this.msal.instance.getActiveAccount();
    if (!account) {
      return this.router.createUrlTree(['/']);
    }

    try {
      const result = await this.msal.instance.acquireTokenSilent({
        scopes: ['openid', 'profile'], // or your custom API scope
        account,
      });

      const token = result.idToken;
      const payload = this.decodeJwt(token);
      const groups: string[] = payload['groups'] || [];

      const isAdmin = groups.includes(this.adminGroupId);
      return isAdmin ? true : this.router.createUrlTree(['/dashboard']);
    } catch (e) {
      console.error('❌ Guard token error:', e);
      return this.router.createUrlTree(['/']);
    }
  }

  private decodeJwt(token: string): any {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  }
}

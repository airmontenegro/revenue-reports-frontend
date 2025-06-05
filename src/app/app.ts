import { Component, OnInit } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { lastValueFrom } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected title = 'InfoWall';
  token: any;

  constructor(private msalService: MsalService, private http: HttpClient) {
    }

  ngOnInit(): void {
    this.msalService.instance.handleRedirectPromise().then((result) => {
      console.log("Result", result);
      this.token= result?.accessToken;
      console.log("token", this.token);
      if (result !== null && result.account !== null) {
        this.msalService.instance.setActiveAccount(result.account);
      } else {
        const accounts = this.msalService.instance.getAllAccounts();
        if (accounts.length > 0) {
          this.msalService.instance.setActiveAccount(accounts[0]);
        }
      }
      this.testCallToBackend()    
    });
  }

  login() {
    this.msalService.loginRedirect();
  }

async testCallToBackend() {
  const account = this.msalService.instance.getActiveAccount();

  if (!account) {
    console.error('❌ No active MSAL account found.');
    return;
  }

  try {
    const result = await this.msalService.instance.acquireTokenSilent({
      scopes: ['api://9ac61894-832b-4a38-8258-e4d641a95f2d/user_impersonation'],
      account,
    });

    const token = result.accessToken;
    console.log('🔑 Access token:', token);

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`, // ✅ Correct spelling
    });

    const url = 'http://localhost:3000';

    const response = await lastValueFrom(this.http.get(url, { headers }));
    console.log('✅ Backend response:', response);
    return response;

  } catch (err) {
    console.error('❌ Token acquisition or API call failed:', err);
    return null; // ✅ Return on error path too
  }
}

}

import { Component, OnInit } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { ApiService } from './services/api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected title = 'InfoWall';
  token: any;

  constructor(private msalService: MsalService, private apiService: ApiService) {
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

testCallToBackend(): void {
  this.apiService.call({
    method: 'GET',
    route: '',
  }).subscribe({
    next: (response) => {
      console.log('✅ Backend response:', response);
    },
    error: (err) => {
      console.error('❌ API call failed:', err.message);
    }
  });
}

}

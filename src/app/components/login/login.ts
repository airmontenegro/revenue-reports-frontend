import { Component } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { HttpMethod } from '../../interfaces/httpMethod.interface';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  protected title = 'InfoWall';
  token: any;
  adminGroup = `2eaa5375-85c5-4ba0-8d21-688b1c63821b`;
  authResult: any;
  constructor(private msalService: MsalService, private apiService: ApiService, private router: Router) {
    }

  ngOnInit(): void {
    this.msalService.instance.handleRedirectPromise().then((result) => {
      console.log("Result", result);
      this.authResult = result;
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
      this.checkRedirect();
      this.testCallToBackend()    
    });
  }

  login() {
    this.msalService.loginRedirect()
  }

  checkRedirect() {
      if(this.authResult.account.idTokenClaims.groups.includes(this.adminGroup)) {
        this.router.navigate(['/compare'])
      }else{
        this.router.navigate(['/compare'])
      }
  }

testCallToBackend(): void {
  this.apiService.call({
    method: HttpMethod.GET,
    route: 'departments',
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

import { Component } from '@angular/core';
import { MsalService } from '@azure/msal-angular';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'InfoWall';

    constructor(private msalService: MsalService) {}

  login() {
    this.msalService.loginRedirect();
  }
}

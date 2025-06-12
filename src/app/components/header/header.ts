import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MsalService } from '@azure/msal-angular';

@Component({
  selector: 'app-header',
  imports: [RouterLink, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  dropdownOpen = false;
  constructor(private msalService: MsalService) {}

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  logout(): void {
    const account = this.msalService.instance.getActiveAccount();

    if (account) {
      this.msalService.instance.logout({
        account,
        postLogoutRedirectUri: '/', // Redirect to home or login screen
        logoutHint: account.username
      });
    } else {
      this.msalService.instance.logoutRedirect({
        postLogoutRedirectUri: '/',
      });
    }
  }
}

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { AccountInfo } from '@azure/msal-browser';

@Component({
  selector: 'app-header',
  imports: [RouterLink, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  dropdownOpen = false;
  constructor(private msalService: MsalService, private router: Router) {}

  toggleDropdown() { this.dropdownOpen = !this.dropdownOpen; }

  /**
   * App-only logout: clear MSAL cache for the current account,
   * drop any app state, and navigate. Does NOT hit the AAD logout endpoint.
   */
logout(): void {
  // 1) Drop active account so interceptor/guards won’t find one
  this.msalService.instance.setActiveAccount(null as any);

  // 2) (Optional) clear any of YOUR app’s own state
  // localStorage.removeItem('your-app-key'); sessionStorage.clear();

  // 3) Navigate to a public, unguarded route
  this.router.navigate(['/']);
}
}

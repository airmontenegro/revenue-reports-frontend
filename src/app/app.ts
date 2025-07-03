import { Component, OnInit } from '@angular/core';

import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { filter } from 'rxjs';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
    standalone: true,

  imports: [RouterModule, Header, Footer, NgClass], 
})
export class App implements OnInit {
  protected title = 'Revenue compare';
  token: any;
  isRootRoute:boolean=true;;

  /**
   *
   */
  constructor(private router: Router) {
    
  }


  ngOnInit(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const currentUrl = event.urlAfterRedirects;
        this.isRootRoute = currentUrl === '/' || currentUrl === '';
        console.log('Is root route:', this.isRootRoute);
        // You can now use `isRootRoute` to conditionally render content or set state
      });
  }
}

import { Component, OnInit } from '@angular/core';

import { RouterModule } from '@angular/router';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
    standalone: true,

  imports: [RouterModule, Header, Footer], 
})
export class App implements OnInit {
  protected title = 'InfoWall';
  token: any;


  ngOnInit(): void {}
}

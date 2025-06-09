import { Component, OnInit } from '@angular/core';

import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
 imports: [RouterModule], 
})
export class App implements OnInit {
  protected title = 'InfoWall';
  token: any;


  ngOnInit(): void {}
}

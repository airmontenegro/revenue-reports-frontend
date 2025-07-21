import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Header } from '../../header/header';

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterModule], 
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss',
  standalone: true
})
export class AdminDashboard {

}

import { Routes } from '@angular/router';
import { Dashboard } from './components/dashboard/dashboard';
import { AdminDashboard } from './components/admin-dashboard/admin-dashboard';
import { Login } from './components/login/login';
import { AdminGroupGuard } from './admin-group.guard';

export const routes: Routes = [
  { path: '', component: Login },
  { path: 'dashboard', component: Dashboard },
  { path: 'admin', component: AdminDashboard,  canActivate: [AdminGroupGuard], },
];

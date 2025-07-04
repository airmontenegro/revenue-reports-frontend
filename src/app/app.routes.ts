import { Routes } from '@angular/router';
import { Dashboard } from './components/dashboard/dashboard';
import { AdminDashboard } from './components/admin-dashboard/admin-dashboard';
import { Login } from './components/login/login';
import { AdminGroupGuard } from './admin-group.guard';
import { UserProfile } from './components/user-profile/user-profile';
import { ExcelCompare } from './components/excel-compare/excel-compare';
import { CompareWrapper } from './components/compare-wrapper/compare-wrapper';

export const routes: Routes = [
  { path: '', component: Login },
  { path: 'dashboard', component: Dashboard },
  { path: 'admin', component: AdminDashboard,  canActivate: [AdminGroupGuard], },
  {
    path: 'profile', component: UserProfile 
  },
  {
    path: 'compare' , component: CompareWrapper
  }
];

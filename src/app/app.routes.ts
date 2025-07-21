import { Routes } from '@angular/router';
import { Dashboard } from './components/dashboard/dashboard';
import { AdminDashboard } from './components/admin/admin-dashboard/admin-dashboard';
import { Login } from './components/login/login';
import { AdminGroupGuard } from './admin-group.guard';
import { UserProfile } from './components/user-profile/user-profile';
import { CompareWrapper } from './components/compare-wrapper/compare-wrapper';
import { OnboardingWrapper } from './components/onboarding-wrapper/onboarding-wrapper';
import { CreateUpdateOnboardingLesson } from './components/admin/create-update-onboarding-lesson/create-update-onboarding-lesson';
import { OnbordingLessonList } from './components/admin/onbording-lesson-list/onbording-lesson-list';

export const routes: Routes = [
  { path: '', component: Login },
  { path: 'dashboard', component: Dashboard },
  {
    path: 'admin', component: AdminDashboard, canActivate: [AdminGroupGuard], children: [
      { path: 'lessons', component: OnbordingLessonList },
      { path: 'lesson/new', component: CreateUpdateOnboardingLesson },
      { path: '', redirectTo: 'lessons', pathMatch: 'full' },
    ],
  },
  {
    path: 'profile', component: UserProfile
  },
  {
    path: 'compare', component: CompareWrapper
  },
  {
    path: 'onboarding', component: OnboardingWrapper
  }
];

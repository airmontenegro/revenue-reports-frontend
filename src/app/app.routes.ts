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
import { CategoryCreateUpdateComponent } from './components/admin/category-create-update/category-create-update';
import { CategoryListComponent } from './components/admin/category-list/category-list';

export const routes: Routes = [
  { path: '', component: Login },
  { path: 'dashboard', component: Dashboard },
  {
    path: 'admin', component: AdminDashboard, canActivate: [AdminGroupGuard], children: [
      { path: 'lessons', component: OnbordingLessonList },
      { path: 'lesson/new', component: CreateUpdateOnboardingLesson },
      { path: 'lessons/edit/:id', component: CreateUpdateOnboardingLesson },
      // 📂 Categories
      { path: 'categories', component: CategoryListComponent },
      { path: 'category/new', component: CategoryCreateUpdateComponent },
      { path: 'categories/edit/:slug', component: CategoryCreateUpdateComponent }, { path: '', redirectTo: 'lessons', pathMatch: 'full' },
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

import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/users', pathMatch: 'full' },
  { path: 'users', loadComponent: () => import('./components/user-list/user-list').then(m => m.UserList) },
  { path: 'users/new', loadComponent: () => import('./components/user-form/user-form').then(m => m.UserForm) },
  { path: 'users/:id', loadComponent: () => import('./components/user-detail/user-detail').then(m => m.UserDetail) },
  { path: 'users/:id/edit', loadComponent: () => import('./components/user-form/user-form').then(m => m.UserForm) }
];

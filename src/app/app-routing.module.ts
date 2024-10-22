import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';

import { HomeComponent } from './components/home/home.component';
import { AdminPageComponent } from './components/admin-page/admin-page.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ProfileComponent } from './components/profile/profile.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { StatsComponent } from './components/stats/stats.component';
import { UpdateProfileComponent } from './components/update-profile/update-profile.component';
import { AdminGuard } from './guards/admin.guard';
import { UserGuard } from './guards/user.guard';
import { LandingPageComponent } from './components/landing-page/landing-page.component';

const routes: Routes = [
  {path: '', pathMatch: 'full', redirectTo: '/landing'},
  {path: 'landing', component: LandingPageComponent},
  {path: 'home', component: HomeComponent, canActivate: [UserGuard]},
  {path: 'admin', component: AdminPageComponent, canActivate: [AdminGuard]},
  {path: 'profile', component: ProfileComponent, canActivate: [UserGuard]},
  {path: 'login', component: LoginComponent},
  {path: 'register', component: RegisterComponent},
  {path: 'personalstats', component: StatsComponent, canActivate: [UserGuard]},
  {path: 'updateprofile', component: UpdateProfileComponent, canActivate: [UserGuard]},
  {path: '**', component: PageNotFoundComponent}
];

@NgModule({
  imports: [CommonModule, BrowserModule, RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

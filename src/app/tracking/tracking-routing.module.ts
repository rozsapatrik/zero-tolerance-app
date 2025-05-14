import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { AdminGuard } from '../core/guards/admin.guard';
import { DrinkListComponent } from './components/drink-list/drink-list.component';
import { HomeComponent } from './components/home/home.component';

const routes: Routes = [
  { path: 'drinklist', component: DrinkListComponent },
  { path: 'home', component: HomeComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TrackingRoutingModule {}

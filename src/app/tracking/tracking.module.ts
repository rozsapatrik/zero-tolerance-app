import { NgModule } from '@angular/core';
import { DrinkListComponent } from './components/drink-list/drink-list.component';
import { HomeComponent } from './components/home/home.component';
import { SharedModule } from '../shared/shared.module';
import { TrackingRoutingModule } from './tracking-routing.module';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [DrinkListComponent, HomeComponent],
  imports: [SharedModule, TrackingRoutingModule, CommonModule],
})
export class TrackingModule {}

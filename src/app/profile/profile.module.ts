import { NgModule } from '@angular/core';
import { ProfileComponent } from './components/profile/profile.component';
import { StatsComponent } from './components/stats/stats.component';
import { UpdateProfileComponent } from './components/update-profile/update-profile.component';
import { SharedModule } from '../shared/shared.module';
import { ProfileRoutingModule } from './profile-routing.module';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [ProfileComponent, StatsComponent, UpdateProfileComponent],
  imports: [SharedModule, ProfileRoutingModule, CommonModule],
})
export class ProfileModule {}

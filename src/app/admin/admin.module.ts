import { NgModule } from '@angular/core';
import { AdminFormComponent } from './components/admin-form/admin-form.component';
import { AdminPageComponent } from './components/admin-page/admin-page.component';
import { AdminRoutingModule } from './admin-routing.module';
import { SharedModule } from '../shared/shared.module';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [AdminFormComponent, AdminPageComponent],
  imports: [SharedModule, AdminRoutingModule, CommonModule],
})
export class AdminModule {}

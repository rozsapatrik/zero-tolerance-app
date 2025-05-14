import { NgModule } from '@angular/core';
import { AboutUsComponent } from './components/about-us/about-us.component';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { NavigationComponent } from '../shared/navigation/navigation.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { SharedModule } from '../shared/shared.module';
import { PagesRoutingModule } from './pages-routing.module';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [AboutUsComponent, LandingPageComponent, PageNotFoundComponent],
  imports: [SharedModule, PagesRoutingModule, CommonModule],
})
export class PagesModule {}

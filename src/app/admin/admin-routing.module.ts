import { RouterModule, Routes } from "@angular/router";
import { AdminPageComponent } from "./components/admin-page/admin-page.component";
import { AdminFormComponent } from "./components/admin-form/admin-form.component";
import { NgModule } from "@angular/core";
import { AdminGuard } from "../core/guards/admin.guard";

const routes: Routes = [
  { path: 'admin', component: AdminPageComponent, canActivate: [AdminGuard] },
  { path: 'adminform', component: AdminFormComponent, canActivate: [AdminGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}

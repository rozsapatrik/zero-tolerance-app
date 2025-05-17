import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { take } from 'rxjs';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { NavigationService } from 'src/app/core/services/navigation.service';

@Component({
  selector: 'app-redirect',
  templateUrl: './redirect.component.html',
  styleUrls: ['./redirect.component.scss'],
})
export class RedirectComponent {
  constructor(
    private authService: AuthenticationService,
    private navigationService: NavigationService
  ) {}

  ngOnInit() {
    this.authService
      .isUser()
      .pipe(take(1))
      .subscribe((user) => {
        if (user) {
          this.navigationService.navigate('/tracking/home');
        } else {
          this.navigationService.navigate('/pages/landing');
        }
      });
  }
}

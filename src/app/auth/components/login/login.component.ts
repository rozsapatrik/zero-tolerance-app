import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NotyfService } from 'src/app/core/services/notyf/notyf.service';
import { NavigationService } from 'src/app/core/services/navigation.service';
import { NgxSpinnerService } from 'ngx-spinner';

/**
 * Handles the logging in of the user.
 */
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  /**
   * The login form group.
   */
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  /**
   *
   * @param authService Service for user authentication.
   * @param router Router for routing.
   * @param auth Angular Firebase Authentication.
   * @param notyfService Service for displaying messages.
   */
  constructor(
    private authService: AuthenticationService,
    private router: Router,
    private auth: AngularFireAuth,
    private notyfService: NotyfService,
    private navigationService: NavigationService,
    private spinnerService: NgxSpinnerService
  ) {}

  ngOnInit(): void {}

  /**
   * Gets the e-mail input.
   */
  get email() {
    return this.loginForm.get('email');
  }
  /**
   * Gets the password input.
   */
  get password() {
    return this.loginForm.get('password');
  }

  /**
   * Displays hint message.
   */
  showHint() {
    this.notyfService.info(
      'E-mail: valid forrmat<br>Password: min. 8 characters'
    );
  }

  /**
   * Submits the typed in data for log in.
   * @returns The user's credentials.
   */
  submit() {
    if (!this.loginForm.valid) {
      this.notyfService.error('Please provide valid data');
      return;
    }

    this.spinnerService.show();

    const { email, password } = this.loginForm.value;

    this.authService.login(email as string, password as string).subscribe({
      next: () => {
        this.auth.user.subscribe(async (user) => {
          if (user) {
            this.navigationService.navigate(
              'tracking/home',
              undefined,
              500,
              300
            );
            this.notyfService.success('Logged in successfully');
          }
        });
      },
      error: (error) => {
        this.notyfService.error('Something went wrong');
      },
    });
  }
}

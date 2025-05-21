import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { NavigationService } from 'src/app/core/services/navigation.service';
import { NotyfService } from 'src/app/core/services/notyf/notyf.service';

/**
 * Handles user registration.
 */
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  /**
   * Form for user registration.
   */
  registerForm = new FormGroup(
    {
      username: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
      ]),
      email: new FormControl('', [Validators.email, Validators.required]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
      ]),
      confirmPassword: new FormControl('', Validators.required),
      weight: new FormControl('', [Validators.required, Validators.min(30)]), // Minimum weight validation
      gender: new FormControl(false, Validators.required), // Gender must be selected
    },
    { validators: this.passwordsMatchValidator() }
  );

  /**
   *
   * @param authService Service for user authentication.
   * @param afs Angular Firestore.
   * @param notyfService Service for displaying notifications.
   * @param navigationService Service for loading spinner navigation.
   * @param spinnerService Service for spinner.
   */
  constructor(
    private authService: AuthenticationService,
    private afs: AngularFirestore,
    private notyfService: NotyfService,
    private navigationService: NavigationService,
    private spinnerService: NgxSpinnerService
  ) {}

  ngOnInit(): void {}

  /**
   * Gets the input username.
   */
  get username() {
    return this.registerForm.get('username');
  }
  /**
   * Gets the input e-mail.
   */
  get email() {
    return this.registerForm.get('email');
  }
  /**
   * Gets the input password.
   */
  get password() {
    return this.registerForm.get('password');
  }
  /**
   * Gets the input confirmed password.
   */
  get confirmPassword() {
    return this.registerForm.get('confirmPassword');
  }
  /**
   * Gets the input weight.
   */
  get weight() {
    return this.registerForm.get('weight');
  }
  /**
   * Gets the input gender.
   */
  get gender() {
    return this.registerForm.get('gender');
  }

  /**
   * Displays hint message.
   */
  showHint() {
    this.notyfService.info(
      'Username: min. 3 characters<br>E-mail: valid format<br>Password: min. 8 characters<br>Weight: min. 30 kilograms'
    );
  }

  /**
   * Checks if the two passwords typed in the `registerForm` match
   */
  passwordsMatchValidator(): ValidatorFn {
    return (AbsControl: AbstractControl): ValidationErrors | null => {
      const password = AbsControl.get('password')?.value;
      const confirmPassword = AbsControl.get('confirmPassword')?.value;

      if (password && password !== confirmPassword) {
        return { passwordsDontMatch: true };
      } else if (
        password != '' &&
        (password.length < 8 || confirmPassword.length < 8)
      ) {
        return { passwordLengthMin: true };
      }
      return null;
    };
  }

  /**
   * Submits the user's data for registration.
   * @returns If the registration form's data is invalid then returns.
   */
  async registerSubmit() {
    if (!this.registerForm.valid) {
      console.error('Invalid form');
      this.notyfService.error('Please provide valid data!');
      return;
    }

    let userData = {
      username: this.registerForm.value.username,
      email: this.registerForm.value.email,
      profilePicUrl: '',
      registerDate: new Date().toLocaleDateString(),
      weight: this.registerForm.value.weight,
      gender: !!this.registerForm.value.gender ? 'female' : 'male',
    };

    const usernameExists = await this.authService.checkUsernameExists(
      userData.username as string
    );
    if (usernameExists) {
      this.spinnerService.hide();
      this.notyfService.error('Username is already registered.');
      return;
    }

    const emailExists = await this.authService.checkEmailExists(
      userData.email as string
    );
    if (emailExists) {
      this.spinnerService.hide();
      this.notyfService.error('E-mail is already registered.');
      return;
    }

    this.spinnerService.show();

    this.afs.collection('user').add(userData);

    const { username, email, password } = this.registerForm.value;
    this.authService
      .registerUser(username as string, email as string, password as string)
      .subscribe({
        next: () => {
          this.notyfService.success('Registered successfully');
          this.authService.logoutUser();
          this.navigationService.navigate(
            'auth/login',
            undefined,
            undefined,
            500,
            300
          );
        },
        error: (error) => {
          this.spinnerService.hide();
          this.notyfService.error('Something went wrong');
        },
      });
  }
}

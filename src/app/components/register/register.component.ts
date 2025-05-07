import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { NotyfService } from '../../services/notyf/notyf.service';

/**
 * Checks if the two passwords typed in the `registerForm` match
 */
export function passwordsMatchValidator(): ValidatorFn{
  return(AbsControl: AbstractControl): ValidationErrors | null => {
    const password = AbsControl.get('password')?.value;
    const confirmPassword = AbsControl.get('confirmPassword')?.value;

    if(password && (password !== confirmPassword)){
      return{ passwordsDontMatch: true }
    }
    else if(password != "" && (password.length < 8 || confirmPassword.length < 8)){
      return{ passwordLengthMin: true }

    }
    return null;
  }
}

/**
 * Handles user registration.
 */
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})

export class RegisterComponent implements OnInit{
  /**
   * Form for user registration.
   */
  registerForm = new FormGroup({
    username: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.email, Validators.required]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
    confirmPassword: new FormControl('', Validators.required),
    weight: new FormControl('', [Validators.required, Validators.min(30)]), // Minimum weight validation
    gender: new FormControl('male', Validators.required) // Gender must be selected
  }, { validators: passwordsMatchValidator() })

  /**
   * 
   * @param authService Service for user authentication.
   * @param router Router for routing.
   * @param afs Angular Firestore.
   * @param notyfService Service for displaying notifications.
   */
  constructor(
    private authService: AuthenticationService,
    private router: Router,
    private afs: AngularFirestore,
    private notyfService: NotyfService
  ){}

  ngOnInit(): void {}

  /**
   * Gets the input username.
   */
  get username(){ return this.registerForm.get('username') }
  /**
   * Gets the input e-mail.
   */
  get email(){ return this.registerForm.get('email') }
  /**
   * Gets the input password.
   */
  get password(){ return this.registerForm.get('password') }
  /**
   * Gets the input confirmed password.
   */
  get confirmPassword(){ return this.registerForm.get('confirmPassword') }
  /**
   * Gets the input weight.
   */
  get weight() { return this.registerForm.get('weight'); }
  /**
   * Gets the input gender.
   */
  get gender() { return this.registerForm.get('gender'); }

  /**
   * Submits the user's data for registration.
   * @returns If the registration form's data is invalid then returns.
   */
  registerSubmit(){
    if(!this.registerForm.valid){ 
      console.log("Invalid form");
      return; }

    let userData = {
      'username': this.registerForm.value.username,
      'email': this.registerForm.value.email,
      'profilePicUrl': "",
      'registerDate': new Date().toLocaleDateString(),
      'weight': this.registerForm.value.weight,
      'gender': this.registerForm.value.gender
    };

    this.afs.collection('user').add(userData);

    const{ username, email, password } = this.registerForm.value;
    this.authService.registerUser(username as string, email as string, password as string).subscribe({
      next: () => {
        this.notyfService.success('Registered successfully');
        this.authService.logoutUser();
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.notyfService.error('Something went wrong');
      }
    })
  }
}

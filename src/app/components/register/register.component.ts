import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HotToastService } from '@ngneat/hot-toast';
import { AuthenticationService } from 'src/app/services/authentication.service';

//Checks if the two password typed in the registerForm match
export function passwordsMatchValidator(): ValidatorFn{
  return(AbsControl: AbstractControl): ValidationErrors | null => {
    const password = AbsControl.get('password')?.value;
    const confirmPassword = AbsControl.get('confirmPassword')?.value;

    if(password && confirmPassword !== confirmPassword){
      return{ passwordsDontMatch: true }
    }
    return null;
  }
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})

export class RegisterComponent implements OnInit{

  //registerForm FormGroup with it's FormControls
  registerForm = new FormGroup({
    username: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.email, Validators.required]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
    confirmPassword: new FormControl('', Validators.required)
  }, { validators: passwordsMatchValidator() })

  constructor(private authService: AuthenticationService, private router: Router, private toast: HotToastService, private afs: AngularFirestore){}

  ngOnInit(): void {
    
  }

  //Get methods for the registerForm
  get username(){ return this.registerForm.get('username') }
  get email(){ return this.registerForm.get('email') }
  get password(){ return this.registerForm.get('password') }
  get confirmPassword(){ return this.registerForm.get('confirmPassword') }

  //Registers the user's data into the Firestore database and shows a toast message.
  registerSubmit(){
    if(!this.registerForm.valid){ 
      console.log("Form nich gut");
      return; }

    let userData = {
      'username': this.registerForm.value.username,
      'email': this.registerForm.value.email,
      'profilePicUrl': "",
      'favoriteDrink': 'No favorite drink',
      'registerAgeInDays': '0 days'
    };

    this.afs.collection('user').add(userData);

    const{ username, email, password } = this.registerForm.value;
    this.authService.registerUser(username as string, email as string, password as string).pipe(
      this.toast.observe({
        success: 'Registration done!',
        loading: 'Logging in...',
        error: ({errorMessage}) => `${errorMessage}`
      })
    ).subscribe(() => {
      this.authService.logoutUser();
      this.router.navigate(['/login'])
    })
  }
}

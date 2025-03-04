import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { NotyfService } from '../../services/notyf/notyf.service';

//Checks if the two password typed in the registerForm match
export function passwordsMatchValidator(): ValidatorFn{
  return(AbsControl: AbstractControl): ValidationErrors | null => {
    const password = AbsControl.get('password')?.value;
    const confirmPassword = AbsControl.get('confirmPassword')?.value;

    /*if(password !== confirmPassword){
      return{ passwordsDontMatch: true }
    }
    return null;*/

    if(password && (password !== confirmPassword)){
      return{ passwordsDontMatch: true }
    }
    else if(password != "" && (password.length < 8 || confirmPassword.length < 8)){
      return{ passwordLengthMin: true }

    }
    return null;
  }
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})

export class RegisterComponent implements OnInit{

  //registerForm FormGroup with it's FormControls
  registerForm = new FormGroup({
    username: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.email, Validators.required]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
    confirmPassword: new FormControl('', Validators.required),
    weight: new FormControl('', [Validators.required, Validators.min(30)]), // Minimum weight validation
    gender: new FormControl('male', Validators.required) // Gender must be selected
  }, { validators: passwordsMatchValidator() })

  constructor(
    private authService: AuthenticationService,
    private router: Router,
    private afs: AngularFirestore,
    private notyfService: NotyfService
  ){}

  ngOnInit(): void {}

  //Get methods for the registerForm
  get username(){ return this.registerForm.get('username') }
  get email(){ return this.registerForm.get('email') }
  get password(){ return this.registerForm.get('password') }
  get confirmPassword(){ return this.registerForm.get('confirmPassword') }
  get weight() { return this.registerForm.get('weight'); }
  get gender() { return this.registerForm.get('gender'); }
  registerSubmit(){
    if(!this.registerForm.valid){ 
      console.log("Invalid form");
      return; }

    let userData = {
      'username': this.registerForm.value.username,
      'email': this.registerForm.value.email,
      'profilePicUrl': "",
      'favoriteDrink': 'No favorite drink',
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

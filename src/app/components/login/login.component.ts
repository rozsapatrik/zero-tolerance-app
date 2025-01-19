import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { AuthenticationService } from '../../services/authentication.service';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user/user.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit{
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required])
  })

  constructor(
    private authService: AuthenticationService,
    private router: Router,
    private auth: AngularFireAuth,
    private userService: UserService,
    private afs: AngularFirestore,
  ){}

  ngOnInit(): void { console.log('HELLO'); }

  get email(){ return this.loginForm.get('email'); }
  get password(){ return this.loginForm.get('password'); }

  submit(){
    if(!this.loginForm.valid){ return; }

    const { email, password } = this.loginForm.value;

    this.authService.login(email as string, password as string);

    this.auth.user.subscribe(async user => {
      if(user){
        this.router.navigate(['/home'])
      } 
    })
  }
}

import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent {

  constructor(
    private afs: AngularFirestore,
    private authService: AuthenticationService,
    private route: ActivatedRoute,
    private auth: AngularFireAuth,
    private userService: UserService,
    private router: Router
  ){}

  redirectToRegister(){
    this.router.navigate(['/register']);
  }

  redirectToLogin(){
    this.router.navigate(['/login']);
  }

}

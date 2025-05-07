import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { UserService } from 'src/app/services/user/user.service';
import { Router } from '@angular/router';
import { NotyfService } from '../../services/notyf/notyf.service';

/**
 * Handles user profile display and it's actions.
 */
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  /**
   * Currently logged in user's ID.
   */
  currentUserID: string;
  /**
   * Currently logged in user's username.
   */
  username: string;
  /**
   * Currently logged in user's registration date.
   */
  registerDate: Date;
  /**
   * Subscription of profile.
   */
  profileSub?: Subscription;
  /**
   * Currently logged in user's gender.
   */
  gender: string;
  /**
   * Currently logged in user's weight.
   */
  weight: number;

  /**
   * 
   * @param afs Angular Firestore.
   * @param authService Service for user authentication
   * @param route Currently active route.
   * @param userService Service for user data.
   * @param router Router for routing.
   * @param notyfService Service for displaying notifications.
   */
  constructor(
    private afs: AngularFirestore,
    private authService: AuthenticationService,
    private route: ActivatedRoute,
    private userService: UserService,
    private router: Router,
    private notyfService: NotyfService
  ){}

  /**
   * Initializes profile with the currently logged in user's data.
   */
  ngOnInit(){
    this.profileSub = this.route.paramMap.subscribe(params => {
      this.currentUserID = params.get('id') as string;
      if(!this.currentUserID){
        this.userService.getCurrentUserId().then((result: string | undefined) => {
          const tempString: string = result || '';
          this.currentUserID = tempString;
          console.log(this.currentUserID);

          this.getUsername();
          this.getRegisterDate();
          this.getProfilePicture();
          this.getGender();
          this.getWeight();
        })
      }
    })
  }

  /**
   * Logs out the user.
   */
  logoutUser(){
    this.authService.logoutUser().subscribe(() => {
      this.notyfService.success('Logged out');
      this.router.navigate(['']);
    });
  }

  /**
   * Gets the currently logged in user's username.
   */
  async getUsername(){
    const userDocRef = this.afs.collection("user").doc(this.currentUserID);
    const userDoc = await userDocRef.get().toPromise();
    this.username = userDoc?.get('username');
  }

  /**
   * Gets the currently logged in user's registration date.
   */
  async getRegisterDate(){
    const userDocRef = this.afs.collection("user").doc(this.currentUserID);
    const userDoc = await userDocRef.get().toPromise();
    this.registerDate = userDoc?.get('registerDate');
  }

  /**
   * Gets the currently logged in user's profile picture.
   */
  async getProfilePicture(){
    const userDocRef = this.afs.collection("user").doc(this.currentUserID);
    const userDoc = await userDocRef.get().toPromise();
    const picUrl = userDoc?.get('profilePicUrl');
    const profilePicHtml = document.getElementById("profilePic") as HTMLImageElement;
    profilePicHtml.src = picUrl ? picUrl : "https://cdn.discordapp.com/attachments/905132673356410932/1295650761803567144/c0749b7cc401421662ae901ec8f9f660.jpg?ex=670f6c4d&is=670e1acd&hm=c475e7139b4d6fea1067d23489cbf043e59050b17f9f5cab50cc39cf9c7cee11&"
  }

  /**
   * Gets the currently logged in user's gender.
   */
  async getGender(){
    const userDocRef = this.afs.collection("user").doc(this.currentUserID);
    const userDoc = await userDocRef.get().toPromise();
    const genderTemp = userDoc?.get('gender');
    this.gender = genderTemp.charAt(0).toUpperCase() + genderTemp.slice(1);
  }

  /**
   * Gets the currently logged in user's weight.
   */
  async getWeight(){
    const userDocRef = this.afs.collection("user").doc(this.currentUserID);
    const userDoc = await userDocRef.get().toPromise();
    this.weight = userDoc?.get('weight');
  }

  /**
   * Redirects to currently logged in user's personal statistics page.
   */
  redirectToPersonalStats(){ this.router.navigate(['/personalstats']); }

  /**
   * Redirects to update profile page.
   */
  redirectToUpdateProfile(){ this.router.navigate(['/updateprofile']); }

  /**
   * Redirects to admin page.
   */
  redirectToAdminPage() { this.router.navigate(['/admin']); }
}

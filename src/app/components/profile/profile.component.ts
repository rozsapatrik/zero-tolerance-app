import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { UserService } from 'src/app/services/user/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  currentUserID: string;
  username: string;
  favoriteDrink: string;
  registerDate: Date;
  profileSub?: Subscription;
  gender: string;
  weight: number;

  
  constructor(
    private afs: AngularFirestore,
    private authService: AuthenticationService,
    private route: ActivatedRoute,
    private auth: AngularFireAuth,
    private userService: UserService,
    private router: Router
  ){}

  ngOnInit(){
    this.profileSub = this.route.paramMap.subscribe(params => {
      this.currentUserID = params.get('id') as string;
      if(!this.currentUserID){
        this.userService.getCurrentUserId().then((result: string | undefined) => {
          const tempString: string = result || '';
          this.currentUserID = tempString;
          console.log(this.currentUserID);

          this.getUsername();
          this.getFavoriteDrink();
          this.getRegisterDate();
          this.getProfilePicture();
          this.getGender();
          this.getWeight();
        })
      }
    })
  }

  logoutUser(){
    this.authService.logoutUser().subscribe(() => { this.router.navigate(['']); });
  }

  async getUsername(){
    const userDocRef = this.afs.collection("user").doc(this.currentUserID);
    const userDoc = await userDocRef.get().toPromise();
    this.username = userDoc?.get('username');
  }

  async getFavoriteDrink(){
    const userDocRef = this.afs.collection("user").doc(this.currentUserID);
    const userDoc = await userDocRef.get().toPromise();
    this.favoriteDrink = userDoc?.get('favoriteDrink');
  }

  async getRegisterDate(){
    const userDocRef = this.afs.collection("user").doc(this.currentUserID);
    const userDoc = await userDocRef.get().toPromise();
    this.registerDate = userDoc?.get('registerDate');
  }

  async getProfilePicture(){
    const userDocRef = this.afs.collection("user").doc(this.currentUserID);
    const userDoc = await userDocRef.get().toPromise();
    const picUrl = userDoc?.get('profilePicUrl');
    const profilePicHtml = document.getElementById("profilePic") as HTMLImageElement;
    profilePicHtml.src = picUrl ? picUrl : "https://cdn.discordapp.com/attachments/905132673356410932/1295650761803567144/c0749b7cc401421662ae901ec8f9f660.jpg?ex=670f6c4d&is=670e1acd&hm=c475e7139b4d6fea1067d23489cbf043e59050b17f9f5cab50cc39cf9c7cee11&"
  }

  async getGender(){
    const userDocRef = this.afs.collection("user").doc(this.currentUserID);
    const userDoc = await userDocRef.get().toPromise();
    this.gender = userDoc?.get('gender');
  }

  async getWeight(){
    const userDocRef = this.afs.collection("user").doc(this.currentUserID);
    const userDoc = await userDocRef.get().toPromise();
    this.weight = userDoc?.get('weight');
  }

  redirectToPersonalStats(){ this.router.navigate(['/personalstats']); }
  redirectToUpdateProfile(){ this.router.navigate(['/updateprofile']); }
}

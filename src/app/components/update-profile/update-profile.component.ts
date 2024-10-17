import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HotToastService } from '@ngneat/hot-toast';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { DocumentReference, getDoc } from "firebase/firestore";
import { UserService } from 'src/app/services/user/user.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';

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

@Component({
  selector: 'app-update-profile',
  templateUrl: './update-profile.component.html',
  styleUrls: ['./update-profile.component.css']
})
export class UpdateProfileComponent implements OnInit{
  
  usernameFromDB: string;
  profilePicUrlFromDB: string;
  pwCheck: boolean = true;
  
  updateProfileForm = new FormGroup({
    password: new FormControl('', [Validators.minLength(8)]),
    confirmPassword: new FormControl(''),
    profilePicUrl: new FormControl('')
  }, { validators: passwordsMatchValidator() });

  constructor(
    private authService: AuthenticationService,
    private router: Router,
    private toast: HotToastService,
    private afs: AngularFirestore,
    private userService: UserService,
    private afAuth: AngularFireAuth
  ){}

  ngOnInit(): void {
    this.getUsername();
    this.getProfilePicUrl();
  }

  get profilePicUrl(){ return this.updateProfileForm.get('profilePicUrl') }
  get password(){ return this.updateProfileForm.get('password') }
  get confirmPassword(){ return this.updateProfileForm.get('confirmPassword') }

  async getUsername() {
    const userDocRef = this.afs.collection("user").doc(await this.userService.getUserId());
    const userDoc = await userDocRef.get().toPromise();
    this.usernameFromDB = userDoc?.get('username');
  }

  async getProfilePicUrl() {
    const userDocRef = this.afs.collection("user").doc(await this.userService.getUserId());
    const userDoc = await userDocRef.get().toPromise();
    this.profilePicUrlFromDB = userDoc?.get('profilePicUrl');
    const profilePicHtml = document.getElementById("profilePic") as HTMLImageElement;
    profilePicHtml.src = this.profilePicUrlFromDB ? this.profilePicUrlFromDB : "https://cdn.discordapp.com/attachments/905132673356410932/1295650761803567144/c0749b7cc401421662ae901ec8f9f660.jpg?ex=670f6c4d&is=670e1acd&hm=c475e7139b4d6fea1067d23489cbf043e59050b17f9f5cab50cc39cf9c7cee11&"
  }

  async updateProfileSubmit(){
    const user = this.userService.getCurrentUserId();
    if (!user) {
      console.error('User not logged in');
      return;
    }

    const userId = await this.userService.getUserId();
    const userDocRef = this.afs.collection('user').doc(userId).ref;

    const newProfilePicUrl = (document.getElementById('profilePicInput') as HTMLInputElement).value;
    if (newProfilePicUrl !== this.profilePicUrlFromDB && newProfilePicUrl != "") {
      this.profilePicUrlFromDB = newProfilePicUrl;
      userDocRef.update({ profilePicUrl: newProfilePicUrl })
        .then(() => console.log('URL updated successfully')) //TODO: Toaster
        .catch((error) => console.error('Error updating URL:', error));
    }

    const newPassword = this.password?.value;
    if(newPassword){
      try{
        const currentUser = await this.afAuth.currentUser;
        if(currentUser){
          await currentUser.updatePassword(newPassword);
          this.toast.success('Password updated successfully.');
          this.pwCheck = true;
        }
      } catch (error){
        this.toast.error('Error updating password. Please try again.')
        console.error('Error updating password: ', error);
        this.pwCheck = false;
      }
    }

    if(this.pwCheck){ this.router.navigate(['/profile']); }
  }
}

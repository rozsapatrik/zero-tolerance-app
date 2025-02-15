import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { DocumentReference, getDoc } from "firebase/firestore";
import { UserService } from 'src/app/services/user/user.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { NotyfService } from '../../services/notyf/notyf.service';

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
  styleUrls: ['./update-profile.component.scss']
})
export class UpdateProfileComponent implements OnInit{
  
  usernameFromDB: string;
  profilePicUrlFromDB: string;
  weightFromDB: number;
  genderFromDB: string;
  pwCheck: boolean = true;
  
  updateProfileForm = new FormGroup({
    password: new FormControl('', [Validators.minLength(8)]),
    confirmPassword: new FormControl(''),
    profilePicUrl: new FormControl(''),
    weight: new FormControl('', [Validators.required, Validators.min(30)]),
    gender: new FormControl('', Validators.required)
  }, { validators: passwordsMatchValidator() });

  constructor(
    private authService: AuthenticationService,
    private router: Router,
    private afs: AngularFirestore,
    private userService: UserService,
    private afAuth: AngularFireAuth,
    private notyfService: NotyfService
  ){}

  ngOnInit(): void {
    this.getUsername();
    this.getGenderAndWeight();
    this.getProfilePicUrl();
  }

  get profilePicUrl(){ return this.updateProfileForm.get('profilePicUrl') }
  get password(){ return this.updateProfileForm.get('password') }
  get confirmPassword(){ return this.updateProfileForm.get('confirmPassword') }
  get weight() { return this.updateProfileForm.get('weight'); }
  get gender() { return this.updateProfileForm.get('gender'); }

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

  async getGenderAndWeight(){
    const userDocRef = this.afs.collection("user").doc(await this.userService.getUserId());
    const userDoc = await userDocRef.get().toPromise();
    this.weightFromDB = userDoc?.get('weight');
    this.genderFromDB = userDoc?.get('gender');

    this.updateProfileForm.patchValue({
      weight: this.weightFromDB.toString(),
      gender: this.genderFromDB
    });
  }

  async updateProfileSubmit(){
    const user = this.userService.getCurrentUserId();
    if (!user) {
      console.error('User not logged in');
      this.notyfService.error('User is not logged in');
      return;
    }

    if(this.updateProfileForm.invalid) return;
    
    const updates: any = {};
    const userId = await this.userService.getUserId();
    const userDocRef = this.afs.collection('user').doc(userId).ref;

    const newProfilePicUrl = (document.getElementById('profilePicInput') as HTMLInputElement).value;
    if (newProfilePicUrl !== this.profilePicUrlFromDB && newProfilePicUrl != "") {
      this.profilePicUrlFromDB = newProfilePicUrl;
      userDocRef.update({ profilePicUrl: newProfilePicUrl })
        .then(() => this.notyfService.success('URL updated'))
        .catch((error) => this.notyfService.error('Something went wrong'));
    }

    const newWeight = this.weight?.value;
    if (newWeight !== this.weightFromDB.toString()) {
      updates.weight = newWeight;
    }

    const newGender = this.gender?.value;
    if (newGender !== this.genderFromDB) {
      updates.gender = newGender;
    }

    if (Object.keys(updates).length > 0) {
      userDocRef.update(updates).then(() => this.notyfService.success('Profile updated'));
    }

    const newPassword = this.password?.value;
    if(newPassword){
      try{
        const currentUser = await this.afAuth.currentUser;
        if(currentUser){
          await currentUser.updatePassword(newPassword);
          this.pwCheck = true;
          this.notyfService.success('Password updated');
        }
      } catch (error){
        console.error('Error updating password: ', error);
        this.pwCheck = false;
        this.notyfService.error('Something went wrong');
      }
    }

    if(this.pwCheck){ this.router.navigate(['/profile']); }
  }
}

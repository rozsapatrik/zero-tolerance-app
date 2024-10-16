import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HotToastService } from '@ngneat/hot-toast';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { DocumentReference, getDoc } from "firebase/firestore";
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-update-profile',
  templateUrl: './update-profile.component.html',
  styleUrls: ['./update-profile.component.css']
})
export class UpdateProfileComponent implements OnInit{
  
  usernameFromDB: string;
  profilePicUrlFromDB: string;
  
  updateProfileForm = new FormGroup({
    username: new FormControl('', Validators.required),
    profilePicUrl: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.minLength(8)]),
    confirmPassword: new FormControl('')
  }, {})

  constructor(
    private authService: AuthenticationService,
    private router: Router,
    private toast: HotToastService,
    private afs: AngularFirestore,
    private userService: UserService
  ){}

  ngOnInit(): void {
    this.getUsername();
    this.getProfilePicUrl();
  }
  
  get username(){ return this.updateProfileForm.get('username') }
  get email(){ return this.updateProfileForm.get('email') }
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

  updateProfileSubmit(){}


}

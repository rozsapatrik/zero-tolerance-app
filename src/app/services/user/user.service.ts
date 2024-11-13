import { Injectable, Input } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { HotToastService } from '@ngneat/hot-toast';
import { ActivatedRoute, Router } from '@angular/router';
import { increment } from 'firebase/firestore';
import { UserModule } from './user.module';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  formData: UserModule;
  currentUserEmail: string;
  currentUserID: string;
  
  constructor(
    private afs : AngularFirestore,
    public auth : AngularFireAuth,
    private toast: HotToastService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.auth.authState.subscribe(async (user) => {
      if (user) {
        //... MAJD HA KÉSZ LESZ A TRACKING RÉSZ + DB
      }
    });
  }

  //Gets the current user's ID from the databse
  async getCurrentUserId(): Promise<string | undefined> {
    const user = await this.auth.currentUser;
    if (user) {
      const userDocs = await this.afs.collection('user', ref => ref.where('email', '==', user.email)).get().toPromise();
      const userDoc = userDocs?.docs[0];
      return userDoc?.id;
    } else {
      this.toast.error("Login to use this feature.");
      this.router.navigate(['/login']);
      throw new Error('No currently logged in user');
    }
  }

  //Returns with the ID base on the getCurrentUserId() method
  async getUserId(){
    try {
      const userID = await this.getCurrentUserId();
      return userID;
    } catch (error){
      console.error(error);
      return '';
    }
  }

  //Returns the currently logged in user's e-mail
  async getCurrentUserEmail()
  {
    const user = await this.auth.currentUser;
    if(user){
      const userRef = this.afs.collection('user').doc(await this.getUserId())
      const userDoc = await userRef.get().toPromise();
      const currentEmail = userDoc?.get('email') as string;
      this.currentUserEmail = currentEmail;
      console.log('fetched email:', this.currentUserEmail);
    }
  }

  //Returns the currently logged in user's e-mail as a string.
  async getCurrentUserEmailString()
  {
    await this.getCurrentUserEmail();
    return this.currentUserEmail;
  }
}

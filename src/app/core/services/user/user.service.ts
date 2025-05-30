import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { UserModule } from './user.module';

/**
 * Service for getting user data.
 */
@Injectable({
  providedIn: 'root',
})
export class UserService {
  /**
   * User module.
   */
  formData: UserModule;
  /**
   * Currently logged in user's e-mail.
   */
  currentUserEmail: string;
  /**
   * Currently logged in user's ID.
   */
  currentUserID: string;

  /**
   *
   * @param afs Angular Firestore.
   * @param auth Angular Firebase Authentication.
   * @param router Router for routing.
   */
  constructor(
    private afs: AngularFirestore,
    public auth: AngularFireAuth,
    private router: Router
  ) {}

  /**
   * Gets the current user's ID from the databse.
   */
  async getCurrentUserId(): Promise<string | undefined> {
    const user = await firstValueFrom(this.auth.authState);
    if (user) {
      const userDocs = await this.afs
        .collection('user', (ref) => ref.where('email', '==', user.email))
        .get()
        .toPromise();
      const userDoc = userDocs?.docs[0];
      return userDoc?.id;
    } else {
      this.router.navigate(['/pages/landing']);
      throw new Error('No currently logged in user');
    }
  }

  /**
   * Returns with the ID based on the `getCurrentUserId()` method.
   */
  async getUserId() {
    try {
      const userID = await this.getCurrentUserId();
      return userID;
    } catch (error) {
      console.error(error);
      return '';
    }
  }

  /**
   * Returns the currently logged in user's e-mail.
   */
  async getCurrentUserEmail() {
    const user = await this.auth.currentUser;
    if (user) {
      const userRef = this.afs.collection('user').doc(await this.getUserId());
      const userDoc = await userRef.get().toPromise();
      const currentEmail = userDoc?.get('email') as string;
      this.currentUserEmail = currentEmail;
    }
  }

  /**
   * Returns the currently logged in user's e-mail as a string.
   */
  async getCurrentUserEmailString() {
    await this.getCurrentUserEmail();
    return this.currentUserEmail;
  }
}

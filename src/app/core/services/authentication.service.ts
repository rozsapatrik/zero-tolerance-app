import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Auth, signInWithEmailAndPassword, authState, createUserWithEmailAndPassword, updateProfile } from '@angular/fire/auth';
import { from, map, Observable, switchMap } from 'rxjs';

/**
 * Service for user authentication.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  /**
   * Observable that gets the current user's authetntication state
   */
  currentUser$ = authState(this.auth);
  
  /**
   * 
   * @param auth Authentication.
   * @param fireAuth Angular Firebase Authentication.
   */
  constructor(private auth: Auth, private fireAuth: AngularFireAuth) { }

  /**
   * Logs in user.
   * @param username Current user's username.
   * @param password Current user's password.
   * @returns Logged in user.
   */
  login(username: string, password: string){
    return from(
      signInWithEmailAndPassword(this.auth, username, password));
  }

  /**
   * Returns an observable of the currently aunthenticated user
   */
  getUser(){ return this.currentUser$; }

  /**
   * Checks if the user is currently authenticated based on the user from AngularFireAuth and the current user from Auth
   */
  isUser(): Observable<boolean>{
    return this.fireAuth.user.pipe(map(user => {return user?.email == this.auth.currentUser?.email;}));
  }

  /**
   * Checks if the currently authenticated user is an admin by checking if the email matches the admin email.
   */
  isAdmin(): Observable<boolean>{
    return this.fireAuth.user.pipe(map(user => {return user?.email == "admin@zt.com"}));
  }

  /**
   * Registers a new user with the given email and password, and sets the user's display name to the provided username.
   */
  registerUser(username: string, email: string, password: string){
    return from(createUserWithEmailAndPassword(this.auth, email, password))
    .pipe(switchMap(({user}) => updateProfile(user, {displayName: username})));
  }

  /**
   * Logs in an existing user with the provided username and password.
   * @param username Username to be logged in with.
   * @param password Password to be logged in with.
   */
  loginUser(username: string, password: string){
    return from(signInWithEmailAndPassword(this.auth, username, password));
  }

  /**
   * Logs out the currently authenticated user.
   */
  logoutUser(){ return from(this.auth.signOut()); }
}

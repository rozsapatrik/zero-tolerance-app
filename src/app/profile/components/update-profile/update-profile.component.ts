import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from 'src/app/core/services/user/user.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { NotyfService } from 'src/app/core/services/notyf/notyf.service';
import { NavigationService } from 'src/app/core/services/navigation.service';
import { NgxSpinnerService } from 'ngx-spinner';

/**
 * Handles user profile update.
 */
@Component({
  selector: 'app-update-profile',
  templateUrl: './update-profile.component.html',
  styleUrls: ['./update-profile.component.scss'],
})
export class UpdateProfileComponent implements OnInit {
  /**
   * User's username from the database.
   */
  usernameFromDB: string;
  /**
   * User's profile picture from the database.
   */
  profilePicUrlFromDB: string;
  /**
   * User's weight from the database.
   */
  weightFromDB: number;
  /**
   * User's gender from the database.
   */
  genderFromDB: string;

  /**
   * Form group for profile update data.
   */
  updateProfileForm = new FormGroup(
    {
      password: new FormControl('', [Validators.minLength(8)]),
      confirmPassword: new FormControl('', [Validators.minLength(8)]),
      profilePicUrl: new FormControl(''),
      weight: new FormControl('', [Validators.required, Validators.min(30)]),
      gender: new FormControl(false, Validators.required),
    },
    { validators: this.passwordsMatchValidator() }
  );

  /**
   *
   * @param router Router for routing.
   * @param afs Angular Firestore.
   * @param userService Service for user data.
   * @param afAuth Angular Firebase Authentication.
   * @param notyfService Service for displaying messages.
   * @param navigationService Service for spinner loaidng navigation.
   * @param spinnerService Service for loading spinner.
   */
  constructor(
    private router: Router,
    private afs: AngularFirestore,
    private userService: UserService,
    private afAuth: AngularFireAuth,
    private notyfService: NotyfService,
    private navigationService: NavigationService,
    private spinnerService: NgxSpinnerService
  ) {}

  /**
   * Gets user's data on initialization.
   */
  ngOnInit(): void {
    this.getUsername();
    this.getGenderAndWeight();
    this.getProfilePicUrl();
  }

  /**
   * Gets user's input profile picture.
   */
  get profilePicUrl() {
    return this.updateProfileForm.get('profilePicUrl');
  }
  /**
   * Gets user's input password.
   */
  get password() {
    return this.updateProfileForm.get('password');
  }
  /**
   * Gets user' input password confirmation.
   */
  get confirmPassword() {
    return this.updateProfileForm.get('confirmPassword');
  }
  /**
   * Gets user's input weight.
   */
  get weight() {
    return this.updateProfileForm.get('weight');
  }
  /**
   * Gets user's input gender.
   */
  get gender() {
    return this.updateProfileForm.get('gender');
  }

  /**
   * Checks if the input passwords match.
   * @returns True flag if passwords match
   */
  passwordsMatchValidator(): ValidatorFn {
    return (AbsControl: AbstractControl): ValidationErrors | null => {
      const password = AbsControl.get('password')?.value;
      const confirmPassword = AbsControl.get('confirmPassword')?.value;

      if (password && password !== confirmPassword) {
        return { passwordsDontMatch: true };
      } else if (
        password != '' &&
        (password.length < 8 || confirmPassword.length < 8)
      ) {
        return { passwordLengthMin: true };
      }
      return null;
    };
  }

  /**
   * Get's currently logged in user's username.
   */
  async getUsername() {
    const userDocRef = this.afs
      .collection('user')
      .doc(await this.userService.getUserId());
    const userDoc = await userDocRef.get().toPromise();
    this.usernameFromDB = userDoc?.get('username');
  }

  /**
   * Get's currently logged in user's profile picture.
   */
  async getProfilePicUrl() {
    const userDocRef = this.afs
      .collection('user')
      .doc(await this.userService.getUserId());
    const userDoc = await userDocRef.get().toPromise();
    this.profilePicUrlFromDB = userDoc?.get('profilePicUrl');
    const profilePicHtml = document.getElementById(
      'profile-picture-input'
    ) as HTMLImageElement;
    profilePicHtml.src = this.profilePicUrlFromDB
      ? this.profilePicUrlFromDB
      : 'https://cdn.discordapp.com/attachments/905132673356410932/1295650761803567144/c0749b7cc401421662ae901ec8f9f660.jpg?ex=670f6c4d&is=670e1acd&hm=c475e7139b4d6fea1067d23489cbf043e59050b17f9f5cab50cc39cf9c7cee11&';
  }

  /**
   * Get's currently logged in user's gender and weight.
   */
  async getGenderAndWeight() {
    const userDocRef = this.afs
      .collection('user')
      .doc(await this.userService.getUserId());
    const userDoc = await userDocRef.get().toPromise();
    this.weightFromDB = userDoc?.get('weight');
    this.genderFromDB = userDoc?.get('gender');

    this.updateProfileForm.patchValue({
      weight: this.weightFromDB.toString(),
      gender: this.genderFromDB == 'male' ? false : true,
    });
  }

  /**
   * Displays hint message.
   */
  showHint() {
    this.notyfService.info(
      'Only input a value if you wish to update it <br><br>Password: min. 8 characters<br>Weight: min. 30 kilograms'
    );
  }

  /**
   * Submits data for profile update.
   * @returns If userID is invalid returns.
   */
  async updateProfileSubmit() {
    const user = this.userService.getCurrentUserId();
    if (!user) {
      console.error('User not logged in');
      this.notyfService.error('User is not logged in');
      return;
    }

    if (this.updateProfileForm.invalid) {
      this.notyfService.error('Please provide valid data');
      return;
    }

    this.spinnerService.show();

    const updates: any = {};
    const userId = await this.userService.getUserId();
    const userDocRef = this.afs.collection('user').doc(userId).ref;

    const newProfilePicUrl = (
      document.getElementById('profile-picture-input') as HTMLInputElement
    ).value;
    if (
      newProfilePicUrl !== this.profilePicUrlFromDB &&
      newProfilePicUrl != ''
    ) {
      this.profilePicUrlFromDB = newProfilePicUrl;
      userDocRef
        .update({ profilePicUrl: newProfilePicUrl })
        .then(() => this.notyfService.success('Profile updated successfully'))
        .catch((error) => this.notyfService.error('Something went wrong'));
    }

    const newWeight = this.weight?.value;
    if (newWeight !== this.weightFromDB.toString()) {
      updates.weight = newWeight;
    }

    const newGender = !!this.gender?.value ? 'female' : 'male';
    if (newGender !== this.genderFromDB) {
      updates.gender = newGender;
    }

    if (Object.keys(updates).length > 0) {
      userDocRef
        .update(updates)
        .then(() => this.notyfService.success('Profile updated successfully'));
    }

    const newPassword = this.password?.value;
    if (newPassword) {
      try {
        const currentUser = await this.afAuth.currentUser;
        if (currentUser) {
          await currentUser.updatePassword(newPassword);
          this.notyfService.success('Profile updated successfully');
        }
      } catch (error) {
        console.error('Error updating password: ', error);
        this.notyfService.error('Something went wrong');
        // this.spinnerService.hide();
      }
    }

    this.navigationService.navigate(
      'profile/profile',
      undefined,
      undefined,
      500,
      300
    );
  }
}

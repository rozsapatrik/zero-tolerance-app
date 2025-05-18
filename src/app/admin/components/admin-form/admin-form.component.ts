import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { NavigationService } from 'src/app/core/services/navigation.service';
import { NotyfService } from 'src/app/core/services/notyf/notyf.service';
import { UserService } from 'src/app/core/services/user/user.service';

/**
 * Contains a form that is needed for the admin add or modify a drink in the database.
 */
@Component({
  selector: 'app-admin-form',
  templateUrl: './admin-form.component.html',
  styleUrls: ['./admin-form.component.scss'],
})
export class AdminFormComponent implements OnInit {
  /**
   * The from group for the drink.
   */
  drinkForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    abv: new FormControl(null, [
      Validators.required,
      Validators.min(0),
      Validators.max(100),
    ]),
    caloriesPerServing: new FormControl(null, [
      Validators.required,
      Validators.min(0),
    ]),
    ml: new FormControl(null, [Validators.required, Validators.min(1)]),
    category: new FormControl('', Validators.required),
  });

  /**
   * ID of the currently edited drink.
   */
  editingDrinkId: string | null = null;
  /**
   * Flag for checking for editing mode.
   */
  isEditMode: boolean = false;

  /**
   * Initializes the form with drink data if it is passed through navigation.
   * If drink data is present it fills the form for editing and sets edit mode.
   * Otherwise initializes an empty form for creating a new drink.
   * @param fb The form builder.
   * @param afs Angular Firestore.
   * @param router Router for routing.
   * @param notyfService Service for displaying messages.
   * @param userService Service for user data.
   * @param navigationService Service for spinner loading navigation.
   * @param spinnerService Service for spinner loading.
   */
  constructor(
    private fb: FormBuilder,
    private afs: AngularFirestore,
    private router: Router,
    private notyfService: NotyfService,
    private userService: UserService,
    private navigationService: NavigationService,
    private spinnerService: NgxSpinnerService
  ) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state as { drink: any };

    if (state && state.drink) {
      const { id, name, ml, category, caloriesPerServing, abv } = state.drink;
      this.editingDrinkId = id;
      this.drinkForm = this.fb.group({
        name: [name, Validators.required],
        ml: [ml, [Validators.required, Validators.pattern('^[0-9]+$')]],
        category: [category, Validators.required],
        caloriesPerServing: [
          caloriesPerServing,
          [Validators.required, Validators.pattern('^[0-9]+$')],
        ],
        abv: [abv, [Validators.required, Validators.pattern('^[0-9]+$')]],
      });
    }
  }

  /**
   * Initializes the form when the component is initialized.
   */
  ngOnInit(): void {
    this.userService.getCurrentUserId();
    const drinkToEdit = history.state.drink;
    if (drinkToEdit) {
      this.isEditMode = true;
      this.editingDrinkId = drinkToEdit.id;
      this.drinkForm.patchValue(drinkToEdit);
    }
  }

  /**
   * Gets the input drink name.
   */
  get name() {
    return this.drinkForm.get('name');
  }

  /**
   * Gets the input alcohol %.
   */
  get abv() {
    return this.drinkForm.get('abv');
  }

  /**
   * Gets the input calories per serving.
   */
  get caloriesPerServing() {
    return this.drinkForm.get('caloriesPerServing');
  }

  /**
   * Gets the input volume.
   */
  get ml() {
    return this.drinkForm.get('ml');
  }

  /**
   * Gets the input category.
   */
  get category() {
    return this.drinkForm.get('category');
  }

  /**
   * Shows hints for filling out the form.
   */
  showHint() {
    this.notyfService.info(
      "Drink name: min. 3 characters<br>Number fields can't be negative"
    );
  }

  /**
   * Handles the form submission.
   * If the form is valid:
   * - Updates an existing drink if `editingDrinkId` is valid.
   * - Adds a new drink if `editingDrinkId` is not valid.
   *
   * On success navigates back to the admin page and shows a success notification.
   * On error shows an error notification.
   */
  async onSubmit(): Promise<void> {
    if (this.drinkForm.valid) {
      const drinkData = this.drinkForm.value;

      this.spinnerService.show();

      try {
        if (this.editingDrinkId) {
          // Updates existing drink.
          await this.afs
            .collection('drink')
            .doc(this.editingDrinkId)
            .update(drinkData);
          this.notyfService.success('Drink updated');
        } else {
          // Adds new drink.
          await this.afs.collection('drink').add(drinkData);
          this.notyfService.success('Drink added');
        }

        // Navigates back to the admin page.
        this.navigationService.navigate('/profile/profile');
      } catch (error) {
        this.notyfService.error('Something went wrong');
        console.error('Error adding drink to Firestore:', error);
        this.spinnerService.hide();
      }
    } else {
      this.notyfService.error('Please provide valid data');
    }
  }
}

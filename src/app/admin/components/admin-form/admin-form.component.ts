import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
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
export class AdminFormComponent {
  /**
   * The from group for the drink.
   */
  drinkForm: FormGroup;
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
   */
  constructor(
    private fb: FormBuilder,
    private afs: AngularFirestore,
    private router: Router,
    private notyfService: NotyfService,
    private userService: UserService
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
    } else {
      this.drinkForm = this.fb.group({
        name: ['', Validators.required],
        ml: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
        category: ['', Validators.required],
        caloriesPerServing: [
          '',
          [Validators.required, Validators.pattern('^[0-9]+$')],
        ],
        abv: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      });
    }
  }

  /**
   * Initializes the form when the component is initialized.
   */
  ngOnInit(): void {
    this.userService.getCurrentUserId();
    this.initializeForm();
    const drinkToEdit = history.state.drink;
    if (drinkToEdit) {
      this.isEditMode = true;
      this.editingDrinkId = drinkToEdit.id;
      this.drinkForm.patchValue(drinkToEdit);
    }
  }

  /**
   * Initializes the form with default values and validation rules.
   */
  initializeForm(): void {
    this.drinkForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      abv: [
        null,
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
      caloriesPerServing: [null, [Validators.required, Validators.min(0)]],
      ml: [null, [Validators.required, Validators.min(1)]],
      category: ['', Validators.required],
    });
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
        this.router.navigate(['/admin/admin']);
      } catch (error) {
        this.notyfService.error('Something went wrong');
        console.error('Error adding drink to Firestore:', error);
      }
    }
  }
}

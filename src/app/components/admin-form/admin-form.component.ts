import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Route, Router } from '@angular/router';
import { NotyfService } from '../../services/notyf/notyf.service';

@Component({
  selector: 'app-admin-form',
  templateUrl: './admin-form.component.html',
  styleUrls: ['./admin-form.component.scss']
})
export class AdminFormComponent {

  drinkForm: FormGroup;
  editingDrinkId: string | null = null;
  isEditMode: boolean = false;

  constructor(
    private fb: FormBuilder,
    private afs: AngularFirestore,
    private router: Router,
    private notyfService: NotyfService
  ) {
    // Retrieve passed drink data
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state as { drink: any };
    if (state && state.drink) {
      const { id, name, ml, category, caloriesPerServing, abv } = state.drink;
      this.editingDrinkId = id;
      this.drinkForm = this.fb.group({
        name: [name, Validators.required],
        ml: [ml, [Validators.required, Validators.pattern('^[0-9]+$')]],
        category: [category, Validators.required],
        caloriesPerServing: [caloriesPerServing, [Validators.required, Validators.pattern('^[0-9]+$')]],
        abv: [abv, [Validators.required, Validators.pattern('^[0-9]+$')]],
      });
    } else {
      this.drinkForm = this.fb.group({
        name: ['', Validators.required],
        ml: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
        category: ['', Validators.required],
        caloriesPerServing: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
        abv: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      });
    }
  }

  ngOnInit(): void {
    this.initializeForm();
    const drinkToEdit = history.state.drink;
    if (drinkToEdit) {
      this.isEditMode = true;
      this.editingDrinkId = drinkToEdit.id;
      this.drinkForm.patchValue(drinkToEdit);
    }
  }

  initializeForm(): void {
    this.drinkForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      abv: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      caloriesPerServing: [null, [Validators.required, Validators.min(0)]],
      ml: [null, [Validators.required, Validators.min(1)]],
      category: ['', Validators.required]
    });
  }

  async onSubmit(): Promise<void> {
    if (this.drinkForm.valid) {
      const drinkData = this.drinkForm.value;

      try {
        if (this.editingDrinkId) {
          // Update existing drink
          await this.afs.collection('drink').doc(this.editingDrinkId).update(drinkData);
          this.notyfService.success('Drink updated');
          console.log('Drink updated successfully:', drinkData);
        } else {
          // Add new drink
          await this.afs.collection('drink').add(drinkData);
          this.notyfService.success('Drink added');
          console.log('Drink added successfully:', drinkData);
        }

        // Navigate back to the admin page
        this.router.navigate(['/admin']);
      } catch (error) {
        this.notyfService.error('Something went wrong');
        console.error('Error adding drink to Firestore:', error);
      }
    }
  }

}

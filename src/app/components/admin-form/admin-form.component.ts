import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Route, Router } from '@angular/router';

@Component({
  selector: 'app-admin-form',
  templateUrl: './admin-form.component.html',
  styleUrls: ['./admin-form.component.css']
})
export class AdminFormComponent {

  drinkForm: FormGroup;

  constructor(private fb: FormBuilder, private afs: AngularFirestore, private router: Router) {}

  ngOnInit(): void {
    this.initializeForm();
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
        // Add new drink to the Firestore 'drink' collection
        await this.afs.collection('drink').add(drinkData);
        console.log('Drink added successfully:', drinkData);

        // Navigate back to the admin page
        this.router.navigate(['/admin']);
      } catch (error) {
        console.error('Error adding drink to Firestore:', error);
      }
    }
  }

}

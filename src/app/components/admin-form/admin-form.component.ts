import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-admin-form',
  templateUrl: './admin-form.component.html',
  styleUrls: ['./admin-form.component.css']
})
export class AdminFormComponent {

  drinkForm: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.drinkForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      abv: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      calories: [null, [Validators.required, Validators.min(0)]],
      volume: [null, [Validators.required, Validators.min(1)]],
      category: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.drinkForm.valid) {
      console.log('Form Submitted:', this.drinkForm.value);
    }
  }

}

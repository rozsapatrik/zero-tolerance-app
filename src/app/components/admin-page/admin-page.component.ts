import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-page',
  templateUrl: './admin-page.component.html',
  styleUrls: ['./admin-page.component.css']
})
export class AdminPageComponent {

  drinks: any[] = [];

  constructor(private afs: AngularFirestore, private router: Router) {}

  ngOnInit(){
    this.fetchAllDrinks();
  }

  fetchAllDrinks(): void {
    this.afs.collection("drink").valueChanges({idField: 'id'}).subscribe(
      (drinks) => {
        this.drinks = drinks;
        console.log("Fetched drinks: ", this.drinks);
      },
      (error) => {
        console.error('Error fetching drinks', error);
      }
    )
  }

  redirectToAdminFormAddDrink(): void {
    this.router.navigate(['/adminform']); // Redirects to the admin form page
  }

}

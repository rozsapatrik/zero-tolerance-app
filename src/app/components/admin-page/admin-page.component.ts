import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { NotyfService } from '../../services/notyf/notyf.service';

@Component({
  selector: 'app-admin-page',
  templateUrl: './admin-page.component.html',
  styleUrls: ['./admin-page.component.scss']
})
export class AdminPageComponent {

  drinks: any[] = [];

  constructor(
    private afs: AngularFirestore,
    private router: Router,
    private notyfService: NotyfService
  ) {}

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

  editDrink(drink: any): void {
    this.router.navigate(['/adminform'], { state: { drink } });
  }

  deleteDrink(drinkId: string): void {
    if (confirm('Are you sure you want to delete this drink?')) {
      this.afs
        .collection('drink')
        .doc(drinkId)
        .delete()
        .then(() => {
          this.notyfService.success('Drink deleted');
          console.log(`Drink with ID ${drinkId} deleted successfully`);
          // Refresh the list of drinks
          this.fetchAllDrinks();
        })
        .catch((error) => {
          this.notyfService.error('Something went wrong');
          console.error('Error deleting drink: ', error);
        });
    }
  }

}

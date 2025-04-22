import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { NotyfService } from '../../services/notyf/notyf.service';
import { UserService } from 'src/app/services/user/user.service';

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
    private notyfService: NotyfService,
    private userService: UserService
  ) {}

  ngOnInit(): void{
    this.userService.getCurrentUserId();
    this.fetchAllDrinks();
  }

  // Refreshes the list of drinks
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
    this.router.navigate(['/adminform']);
  }

  editDrink(drink: any): void {
    this.router.navigate(['/adminform'], { state: { drink } });
  }

  // Delete a specific drink
  deleteDrink(drinkId: string): void {
    if (confirm('Are you sure you want to delete this drink?')) {
      this.afs
        .collection('drink')
        .doc(drinkId)
        .delete()
        .then(() => {
          this.notyfService.success('Drink deleted');
          console.log(`Drink with ID ${drinkId} deleted successfully`);
          this.fetchAllDrinks();
        })
        .catch((error) => {
          this.notyfService.error('Something went wrong');
          console.error('Error deleting drink: ', error);
        });
    }
  }

}

import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { NotyfService } from '../../services/notyf/notyf.service';
import { UserService } from 'src/app/services/user/user.service';

/**
 * Serves as the admin interface for managing drinks in the Firestore database.
 * It allows the admin to:
 * - View the list of all drinks
 * - Navigate to a form to add a new drink
 * - Edit an existing drink
 * - Delete drinks from the collection
 */
@Component({
  selector: 'app-admin-page',
  templateUrl: './admin-page.component.html',
  styleUrls: ['./admin-page.component.scss']
})
export class AdminPageComponent {

  /**
   * Array for the drinks.
   */
  drinks: any[] = [];

  /**
   * 
   * @param afs Angular Firestore.
   * @param router Router for routing.
   * @param notyfService Service for displaying messages.
   * @param userService Service for user data.
   */
  constructor(
    private afs: AngularFirestore,
    private router: Router,
    private notyfService: NotyfService,
    private userService: UserService
  ) {}

  /**
   * Initializes with current user ID and drinks
   */
  ngOnInit(): void{
    this.userService.getCurrentUserId();
    this.fetchAllDrinks();
  }

  /**
   * Fetches all the drinks from the database
   */
  fetchAllDrinks(): void {
    this.afs.collection("drink").valueChanges({idField: 'id'}).subscribe(
      (drinks) => {
        this.drinks = drinks;
      },
      (error) => {
        console.error('Error fetching drinks', error);
      }
    )
  }

  /**
   * Redirects to the admin form
   */
  redirectToAdminFormAddDrink(): void {
    this.router.navigate(['/adminform']);
  }

  /**
   * Redirects to the admin form filled with the data of the selected drink
   * @param drink The drink that we want to edit
   */
  editDrink(drink: any): void {
    this.router.navigate(['/adminform'], { state: { drink } });
  }

  /**
   * Deletes the drink specified by the ID
   * @param drinkId The ID of the drink we want to delete
   */
  deleteDrink(drinkId: string): void {
    if (confirm('Are you sure you want to delete this drink?')) {
      this.afs
        .collection('drink')
        .doc(drinkId)
        .delete()
        .then(() => {
          this.notyfService.success('Drink deleted');
          this.fetchAllDrinks();
        })
        .catch((error) => {
          this.notyfService.error('Something went wrong');
          console.error('Error deleting drink: ', error);
        });
    }
  }

}

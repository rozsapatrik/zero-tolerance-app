import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map, Observable } from 'rxjs';
import { DateService } from 'src/app/core/services/date.service';
import { UserService } from 'src/app/core/services/user/user.service';
import { NotyfService } from 'src/app/core/services/notyf/notyf.service';

/**
 * Interface for a drink.
 */
export interface Drink {
  name: string;
  abv: number;
  caloriesPerServing: number;
  category: string;
  ml: number;
}

/**
 * Interface for the consumed drink.
 */
interface DrinkAmount {
  id: string;
  amount: number;
  time: string;
  calories: number;
  alcohol: number;
  category: string;
}

/**
 * Interface for a map of consumed drinks.
 */
interface DrinkAmountsMap {
  [key: string]: DrinkAmount[];
}

/**
 * Interface for consumed drinks with proper type.
 */
interface FirestoreDocumentData {
  drinkAmounts: DrinkAmountsMap;
}

/**
 * Lists out all the drinks in the database.
 * If the user clicks on a specific drink they can add it to their tracking after providing the necessary data.
 */
@Component({
  selector: 'app-drink-list',
  templateUrl: './drink-list.component.html',
  styleUrls: ['./drink-list.component.scss'],
})
export class DrinkListComponent {
  /**
   * List of the drinks from the database.
   */
  drinksList: Drink[] = [];
  /**
   * The selected drink.
   */
  selectedDrink: Drink | null = null;
  /**
   * The drinks matching the search term.
   */
  filteredDrinks: Drink[] = [];
  /**
   * The search term in the search bar.
   */
  searchTerm: string = '';
  /**
   * A map of the user's selected consumed drink.
   */
  drinkAmounts: Map<
    string,
    {
      drinkName: string;
      amount: number;
      calories: number;
      alcohol: number;
      time: string;
      date: string;
      category: string;
    }
  > = new Map();
  /**
   * Temporary data for consumed drink.
   */
  tempAmounts: {
    [key: string]: { ml: number; cps: number; time: string; date: string };
  } = {};
  /**
   * The selected date.
   */
  selectedDate: any;

  /**
   *
   * @param afs Angular Firestore.
   * @param dateService Service for proper date usage.
   * @param userService Service for user data.
   * @param notyfService Service for displaying messages.
   */
  constructor(
    private afs: AngularFirestore,
    private dateService: DateService,
    private userService: UserService,
    private notyfService: NotyfService
  ) {}

  /**
   * Gets all the drinks on initialization
   */
  ngOnInit() {
    this.userService.getCurrentUserId();
    this.selectedDate = this.dateService.getSelectedDate();

    this.getDrinks().subscribe((drinks) => {
      this.drinksList = drinks;
      this.filteredDrinks = drinks;
    });
  }

  /**
   * Initializes a temporary value to store drink data later
   * @param drinkName The name of the given drink
   */
  initializeDrinkData(drinkName: string): void {
    if (!this.tempAmounts[drinkName]) {
      this.tempAmounts[drinkName] = { ml: 0, time: '', date: '', cps: 0 };
    }
  }

  /**
   * Gets all the drinks from the database
   * @returns The given drink
   */
  getDrinks(): Observable<Drink[]> {
    return this.afs
      .collection('drink')
      .snapshotChanges()
      .pipe(
        map((actions) =>
          actions.map((a) => {
            const data = a.payload.doc.data() as Drink;
            return data;
          })
        )
      );
  }

  /**
   * Sets the selected drink
   * @param drink The selected drink
   */
  selectDrink(drink: Drink): void {
    this.initializeDrinkData(drink.name);
    this.selectedDrink = this.selectedDrink === drink ? null : drink;
  }

  /**
   * Filters the drink list based on the search term
   */
  filterDrinks(): void {
    const terms = this.searchTerm.trim().toLowerCase().split(' ');
    this.filteredDrinks = this.drinksList.filter((drink) =>
      terms.every((term) => drink.name.toLowerCase().includes(term))
    );
  }

  /**
   * Stores the newly tracked drink in Firestore
   * @param drink The drink tracking to be uploaded
   */
  async addDrinkAmount(drink: Drink): Promise<void> {
    const drinkData = this.tempAmounts[drink.name];
    const formattedDate = `${this.selectedDate.getFullYear()}-${(
      this.selectedDate.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}-${this.selectedDate
      .getDate()
      .toString()
      .padStart(2, '0')}`;

    if (drinkData && drinkData.ml > 0 && drinkData.time && this.selectedDate) {
      const formattedTime = new Date(
        `1970-01-01T${drinkData.time}:00`
      ).toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      });

      const userEmail = await this.userService.getCurrentUserEmailString();
      const userID = await this.userService.getCurrentUserId();

      const docId = `${userID}-${formattedDate}`;
      const docRef = this.afs.collection('drankDrinks').doc(docId);
      const docSnapshot = await docRef.get().toPromise();

      let updatedDrinkAmounts: DrinkAmountsMap = {};

      if (docSnapshot && docSnapshot.exists) {
        const existingData = docSnapshot.data() as FirestoreDocumentData;
        updatedDrinkAmounts = existingData ? existingData.drinkAmounts : {};
      }

      const calories = drink.caloriesPerServing * (drinkData.ml / 100);
      const alcohol = (drink.abv / 100) * drinkData.ml * 0.789;

      // Generates a unique entryId for the drink
      const entryId = `${new Date().getTime()}-${Math.random()}`;

      if (updatedDrinkAmounts[drink.name]) {
        updatedDrinkAmounts[drink.name].push({
          id: entryId,
          amount: drinkData.ml,
          calories: calories,
          alcohol: alcohol,
          time: formattedTime,
          category: drink.category,
        });
      } else {
        updatedDrinkAmounts[drink.name] = [
          {
            id: entryId,
            amount: drinkData.ml,
            calories: calories,
            alcohol: alcohol,
            time: formattedTime,
            category: drink.category,
          },
        ];
      }

      const drinkAmountData = {
        email: userEmail,
        date: formattedDate,
        drinkAmounts: updatedDrinkAmounts,
      };

      try {
        // Stores the updated data to Firestore, merging with existing document.
        await docRef.set(drinkAmountData, { merge: true });
        this.notyfService.success('Drink added');

        // Clears the temporary data.
        this.tempAmounts[drink.name] = { ml: 0, time: '', date: '', cps: 0 };
      } catch (error) {
        this.notyfService.error('Something went wrong');
        console.error('Error adding drink to Firestore: ', error);
      }
    } else {
      console.error('Invalid data');
    }
  }
}

import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map, Observable } from 'rxjs';
import { DateService } from 'src/app/core/services/date.service';
import { UserService } from 'src/app/core/services/user/user.service';
import { NotyfService } from 'src/app/core/services/notyf/notyf.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';

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
   * The from group for the drink.
   */
  drankForm = new FormGroup({
    amount: new FormControl(null, [Validators.required, Validators.min(1)]),
    hour: new FormControl(null, [
      Validators.required,
      Validators.min(0),
      Validators.max(23),
    ]),
    minute: new FormControl(null, [
      Validators.required,
      Validators.min(0),
      Validators.max(59),
    ]),
  });

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

  get amount() {
    return this.drankForm.get('amount');
  }

  get hour() {
    return this.drankForm.get('hour');
  }

  get minute() {
    return this.drankForm.get('minute');
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
   * Stops mouse events on the drink when overlay is open.
   * @param event The event for clicling on a drink.
   * @param drink The clicked drink.
   * @returns When a drink is selected
   */
  onDrinkClick(event: MouseEvent, drink: Drink): void {
    if (this.selectedDrink === drink) {
      event.stopPropagation();
      return;
    }

    this.selectDrink(drink);
  }

  /**
   * Adds back the ability to click on the X.
   * @param event The event for clicking the X.
   */
  onCloseClick(event: MouseEvent): void {
    event.stopPropagation();
    this.selectedDrink = null;
  }

  /**
   * Sets the selected drink
   * @param drink The selected drink
   */
  selectDrink(drink: Drink): void {
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
   * @param drink The currently selected drink.
   * @returns If the data submitted is not valid.
   */
  async addDrinkAmount(drink: Drink): Promise<void> {
    if (!this.drankForm.valid) {
      this.notyfService.error('Please provde valid data');
      return;
    }

    // This is needed so the form can be empty with strings then converted into numbers for checks.
    const drinkData = {
      amount:
        this.drankForm.value.amount == null ? 0 : this.drankForm.value.amount,
      hour: this.drankForm.value.hour == null ? 0 : this.drankForm.value.hour,
      minute:
        this.drankForm.value.minute == null ? 0 : this.drankForm.value.minute,
    };

    const formattedDate = `${this.selectedDate.getFullYear()}-${(
      this.selectedDate.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}-${this.selectedDate
      .getDate()
      .toString()
      .padStart(2, '0')}`;

    console.log(drinkData.hour);
    console.log(this.selectedDate);

    console.log(Boolean(drinkData.hour));

    if (
      drinkData &&
      drinkData.amount > 0 &&
      drinkData.hour >= 0 &&
      drinkData.minute >= 0 &&
      this.selectedDate
    ) {
      // After the checks we turn the numbers into properly formatted time strings.
      const preparedHour =
        drinkData.hour < 10
          ? '0' + drinkData.hour.toString()
          : drinkData.hour.toString();
      const preparedMinute =
        drinkData.minute < 10
          ? '0' + drinkData.minute.toString()
          : drinkData.minute.toString();

      const formattedTime = new Date(
        `1970-01-01T${preparedHour}:${preparedMinute}:00`
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

      const calories = drink.caloriesPerServing * (drinkData.amount / 100);
      const alcohol = (drink.abv / 100) * drinkData.amount * 0.789;

      // Generates a unique entryId for the drink
      const entryId = `${new Date().getTime()}-${Math.random()}`;

      if (updatedDrinkAmounts[drink.name]) {
        updatedDrinkAmounts[drink.name].push({
          id: entryId,
          amount: drinkData.amount,
          calories: calories,
          alcohol: alcohol,
          time: formattedTime,
          category: drink.category,
        });
      } else {
        updatedDrinkAmounts[drink.name] = [
          {
            id: entryId,
            amount: drinkData.amount,
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
      } catch (error) {
        this.notyfService.error('Something went wrong');
        console.error('Error adding drink to Firestore: ', error);
      }
    } else {
      this.notyfService.error('Please provide valid data');
      console.error('Invalid data');
    }
  }
}

import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { DateService } from 'src/app/core/services/date.service';
import { UserService } from 'src/app/core/services/user/user.service';
import { NotyfService } from 'src/app/core/services/notyf/notyf.service';

/**
 * Interface for the consumed drink data.
 */
interface DrinkData {
  drinkAmounts: {
    [key: string]: {
      id: string;
      amount: number;
      calories: number;
      alcohol: number;
      time: string;
    }[];
  };
}

/**
 * Interface for the user's personal data.
 */
interface UserData {
  weight: number;
  gender: string;
}

/**
 * Displays the drink tracking page and the overall data.
 */
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  /**
   * The selected date.
   */
  selectedDate: Date;
  /**
   * Drinks for the selected day.
   */
  drinksForTheDay: any[] = [];
  /**
   * Total calories for the day.
   */
  totalCalories: number = 0;
  /**
   * Total amount of drinks for the day.
   */
  totalDrinks: number = 0;
  /**
   * Blood alcohol content for the day.
   */
  bac: number = 0;
  /**
   * The time by the user will be sober approximately.
   */
  soberTime: Date | null = null;
  /**
   * The user's personal data.
   */
  userData: UserData;

  /**
   *
   * @param afs Angular Firestore.
   * @param userService Service for user data.
   * @param dateService Service for proper date usage.
   * @param router Router for routing.
   * @param notyfService Service for displaying messages.
   */
  constructor(
    private afs: AngularFirestore,
    private userService: UserService,
    private dateService: DateService,
    private router: Router,
    private notyfService: NotyfService
  ) {}

  /**
   * Reference to the `dateInput` element.
   */
  @ViewChild('dateInput') dateInput!: ElementRef<HTMLInputElement>;

  /**
   * Initializes the page.
   */
  async ngOnInit(): Promise<void> {
    /**
     * Initializes selected date from DateService or today's date.
     */
    this.selectedDate = this.dateService.getSelectedDate() || new Date();
    await this.fetchUserData();

    /**
     * Fetches drinks data for the selected date.
     */
    this.fetchDrinksForTheDay();

    /**
     * Watches for date changes and loads drinks.
     */
    await this.dateService.selectedDate$.subscribe((date) => {
      this.selectedDate = date;
      this.fetchDrinksForTheDay();
    });
  }

  /**
   * Fetches user data.
   */
  async fetchUserData(): Promise<void> {
    const currentUserID = await this.userService.getCurrentUserId();
    if (currentUserID) {
      const userDoc = await this.afs
        .collection('user')
        .doc(currentUserID)
        .get()
        .toPromise();
      if (userDoc && userDoc.exists) {
        this.userData = userDoc.data() as UserData;
      }
    }
  }

  /**
   * Fetches the user's consumed drinks for the day.
   */
  async fetchDrinksForTheDay(): Promise<void> {
    // Clears previous data
    this.drinksForTheDay = [];
    const currentUserID = await this.userService.getCurrentUserId();

    if (currentUserID && this.selectedDate) {
      const formattedDate = `${this.selectedDate.getFullYear()}-${(
        this.selectedDate.getMonth() + 1
      )
        .toString()
        .padStart(2, '0')}-${this.selectedDate
        .getDate()
        .toString()
        .padStart(2, '0')}`;
      const docId = `${currentUserID}-${formattedDate}`; // Create document ID based on user and date

      const docRef = this.afs.collection('drankDrinks').doc(docId);
      const docSnapshot = await docRef.get().toPromise();

      if (docSnapshot && docSnapshot.exists) {
        const drinkData = docSnapshot.data() as {
          drinkAmounts?: Record<
            string,
            {
              id: string;
              amount: number;
              time: string;
              calories: number;
              alcohol: number;
            }[]
          >;
        };

        this.drinksForTheDay = drinkData?.drinkAmounts
          ? Object.entries(drinkData.drinkAmounts)
              .map(([name, detailsArray]) => {
                return detailsArray.map((detail) => ({
                  name,
                  id: detail.id,
                  amount: detail.amount,
                  calories: detail.calories,
                  alcohol: detail.alcohol,
                  time: detail.time,
                }));
              })
              .flat()
          : [];

        this.calculateTotals();
        this.calculateBAC();
      }
    }
  }

  /**
   * Calculates approximate blood alcohol content for given day.
   * @returns If user data is not present then returns.
   */
  calculateBAC(): void {
    if (!this.userData) {
      console.error('User data not available for BAC calculation');
      this.bac = 0;
      return;
    }

    console.log('UDATA: ', this.userData);

    const { weight, gender } = this.userData;
    const bodyWaterConstant = gender === 'male' ? 0.58 : 0.49;
    const metabolismRate = 0.015; // Average alcohol elimination rate per hour
    const weightInGrams = weight * 1000;
    const currentTime = new Date();
    // Construct full date objects for drink times
    const drinkTimes = this.drinksForTheDay.map((drink) => {
      const [hours, minutes] = drink.time.split(':').map(Number);
      const drinkDate = new Date(this.selectedDate);
      drinkDate.setHours(hours, minutes, 0, 0); // Set hours and minutes to the drink's time
      return { ...drink, drinkDate };
    });
    console.log('Drink times:', drinkTimes);

    // Separate past and future drinks
    const pastDrinks = drinkTimes.filter(
      (drink) => drink.drinkDate <= currentTime
    );
    const futureDrinks = drinkTimes.filter(
      (drink) => drink.drinkDate > currentTime
    );
    console.log('Past Drinks:', pastDrinks);
    console.log('Future Drinks:', futureDrinks);

    // Calculate BAC based on past drinks
    const totalPastAlcoholGrams = pastDrinks.reduce(
      (sum, drink) => sum + (drink.alcohol || 0),
      0
    );
    if (pastDrinks.length > 0) {
      const lastDrinkTime = new Date(
        Math.max(...pastDrinks.map((drink) => drink.drinkDate.getTime()))
      );
      const timeElapsedHours = Math.max(
        0,
        (currentTime.getTime() - lastDrinkTime.getTime()) / (1000 * 60 * 60)
      );

      console.log('Last past drink time:', lastDrinkTime);
      console.log('Time elapsed since last drink (hours):', timeElapsedHours);

      this.bac =
        (totalPastAlcoholGrams / (weightInGrams * bodyWaterConstant)) * 100 -
        metabolismRate * timeElapsedHours;
      this.bac = Math.max(this.bac, 0); // Ensure BAC does not go negative
      console.log('Current BAC:', this.bac);
    } else {
      this.bac = 0; // No past drinks, no BAC
    }

    // Calculate sober time (including future drinks)
    const allAlcoholGrams = drinkTimes.reduce(
      (sum, drink) => sum + (drink.alcohol || 0),
      0
    );
    const soberHours =
      allAlcoholGrams / (metabolismRate * weightInGrams * bodyWaterConstant);

    console.log('Total alcohol grams (past + future):', allAlcoholGrams);
    console.log('Estimated hours to sober:', soberHours * 100);

    const earliestAllDrinkTime = new Date(
      Math.min(...drinkTimes.map((drink) => drink.drinkDate.getTime()))
    );
    const estimatedSoberTime = new Date(
      Math.max(earliestAllDrinkTime.getTime()) +
        soberHours * 100 * 60 * 60 * 1000
    );

    this.soberTime = estimatedSoberTime;
    console.log('Estimated time to be sober:', this.soberTime);
  }

  /**
   * Calculates total calories and drinks for the day.
   */
  calculateTotals(): void {
    this.totalCalories = this.drinksForTheDay.reduce(
      (sum, drink) => sum + (drink.calories || 0),
      0
    );
    this.totalDrinks = this.drinksForTheDay.length;
  }

  /**
   * Sets proper data on date change.
   * @param event The event that triggers this method.
   */
  onDateChange(event: any) {
    this.selectedDate = new Date(event.target.value);
    this.dateService.setSelectedDate(this.selectedDate);
    this.fetchDrinksForTheDay();
  }

  /**
   * Formats the given date.
   * @param date The given date.
   * @returns The given date but properly formatted.
   */
  getFormattedDate(date: Date): string {
    return date.toISOString().split('T')[0]; // Formats date as YYYY-MM-DD for the input field
  }

  /**
   * Opens the date picker.
   */
  openDatePicker() {
    this.dateInput.nativeElement.showPicker(); // Opens the native date picker
  }

  /**
   * Redirects to drink list page.
   */
  redirectToDrinks() {
    this.router.navigate(['/tracking/drinklist']);
  }

  /**
   * Shows alert for drink deletion.
   * @param drink The currently clicked drink.
   */
  onDrinkClick(drink: any): void {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the drink ${drink.name}?`
    );
    if (confirmDelete) {
      this.deleteDrinkFromFirestore(drink);
    }
  }

  /**
   * Removes the selected drink from the user's consumed drinks.
   * @param drink The drink to be deleted.
   */
  async deleteDrinkFromFirestore(drink: any): Promise<void> {
    const userId = await this.userService.getCurrentUserId();
    const formattedDate = `${this.selectedDate.getFullYear()}-${(
      this.selectedDate.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}-${this.selectedDate
      .getDate()
      .toString()
      .padStart(2, '0')}`;
    const docId = `${userId}-${formattedDate}`;
    console.log('UID: ', userId);
    console.log('DATE: ', formattedDate);

    const docRef = this.afs.collection('drankDrinks').doc(docId);

    try {
      const docSnapshot = await docRef.get().toPromise();
      if (docSnapshot && docSnapshot.exists) {
        const drinkData = docSnapshot.data() as DrinkData;
        console.log('drinkData: ', drinkData);
        if (drinkData && drinkData.drinkAmounts) {
          const drinkAmounts = drinkData.drinkAmounts;

          // Iterate through the drink amounts and find the drink to delete by name and id
          for (const drinkName in drinkAmounts) {
            const entries = drinkAmounts[drinkName];

            // Find the specific entry by name and id
            const entryIndex = entries.findIndex(
              (entry: any) => entry.id === drink.id
            );

            if (entryIndex !== -1) {
              // Delete the specific entry by its id
              entries.splice(entryIndex, 1);
              break; // Exit loop once the drink is deleted
            }
          }

          // Update the document with the remaining drink amounts
          await docRef.set({ ...drinkData, drinkAmounts }, { merge: true });
          this.notyfService.success('Drink deleted');
          console.log(
            `Deleted drink ${drink.name} at ${drink.time} from Firestore`
          );

          // Reload the drinks for the day after deletion
          this.fetchDrinksForTheDay();
        }
      } else {
        this.notyfService.error('No document found');
        console.log('No document found to delete');
      }
    } catch (error) {
      this.notyfService.error('Something went wrong');
      console.error('Error fetching or deleting document: ', error);
    }
  }
}

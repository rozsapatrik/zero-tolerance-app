import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { animate, style, transition, trigger } from '@angular/animations';
import { DateService } from 'src/app/core/services/date.service';
import { UserService } from 'src/app/core/services/user/user.service';
import { NotyfService } from 'src/app/core/services/notyf/notyf.service';
import { NavigationService } from 'src/app/core/services/navigation.service';
import { NgxSpinnerService } from 'ngx-spinner';

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
  animations: [
    trigger('scale', [
      transition(':enter', [
        style({ transform: 'scale(0.8)', opacity: 0 }),
        animate('200ms ease-out', style({ transform: 'scale(1)', opacity: 1 })),
      ]),
      transition(':leave', [
        animate(
          '200ms ease-in',
          style({ transform: 'scale(0.8)', opacity: 0 })
        ),
      ]),
    ]),
    trigger('slide', [
      transition(':enter', [
        style({ transform: 'translateY(-20px)', opacity: 0 }),
        animate(
          '300ms ease-out',
          style({ transform: 'translateY(0)', opacity: 1 })
        ),
      ]),
      transition(':leave', [
        animate(
          '300ms ease-in',
          style({ transform: 'translateY(-20px)', opacity: 0 })
        ),
      ]),
    ]),
    trigger('fadeDate', [
      transition('* => *', [
        style({ opacity: 0, transform: 'scale(0.9)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
    ]),
    trigger('slideGrow', [
      transition(':enter', [
        style({
          opacity: 0,
          transform: 'translateY(-10px)',
          maxHeight: '0',
          overflow: 'hidden',
        }),
        animate(
          '300ms ease-out',
          style({
            opacity: 1,
            transform: 'translateY(0)',
            maxHeight: '1000px',
          })
        ),
      ]),
      transition(':leave', [
        animate(
          '200ms ease-in',
          style({
            opacity: 0,
            transform: 'translateY(-10px)',
            maxHeight: '0',
            overflow: 'hidden',
          })
        ),
      ]),
    ]),
  ],
})
export class HomeComponent implements OnInit {
  /**
   * Boolean for showing totals.
   */
  isTotalsShown: Boolean = false;
  /**
   * Variable to help date change animation.
   */
  dateAnimationKey = 0;
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
   * @param navigationService Service for spinner loading navigation.
   * @param spinnerService Service for spinner loading.
   */
  constructor(
    private afs: AngularFirestore,
    private userService: UserService,
    private dateService: DateService,
    private notyfService: NotyfService,
    private navigationService: NavigationService,
    private spinnerService: NgxSpinnerService
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
   * Shows the totals panel.
   */
  showTotals() {
    this.isTotalsShown = true;
  }

  /**
   * Hides the totals panel.
   */
  hideTotals() {
    this.isTotalsShown = false;
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
  // calculateBAC(): void {
  //   if (!this.userData) {
  //     console.error('User data not available for BAC calculation');
  //     this.bac = 0;
  //     return;
  //   }

  //   const { weight, gender } = this.userData;
  //   const bodyWaterConstant = gender === 'male' ? 0.58 : 0.49;
  //   const metabolismRate = 0.015;
  //   const weightInGrams = weight * 1000;
  //   const currentTime = new Date();
  //   // Construct full date objects for drink times
  //   const drinkTimes = this.drinksForTheDay.map((drink) => {
  //     const [hours, minutes] = drink.time.split(':').map(Number);
  //     const drinkDate = new Date(this.selectedDate);
  //     drinkDate.setHours(hours, minutes, 0, 0);
  //     return { ...drink, drinkDate };
  //   });

  //   const pastDrinks = drinkTimes.filter(
  //     (drink) => drink.drinkDate <= currentTime
  //   );
  //   const futureDrinks = drinkTimes.filter(
  //     (drink) => drink.drinkDate > currentTime
  //   );

  //   const totalPastAlcoholGrams = pastDrinks.reduce(
  //     (sum, drink) => sum + (drink.alcohol || 0),
  //     0
  //   );

  //   if (pastDrinks.length > 0) {
  //     const lastDrinkTime = new Date(
  //       Math.max(...pastDrinks.map((drink) => drink.drinkDate.getTime()))
  //     );
  //     const timeElapsedHours = Math.max(
  //       0,
  //       (currentTime.getTime() - lastDrinkTime.getTime()) / (1000 * 60 * 60)
  //     );

  //     this.bac =
  //       (totalPastAlcoholGrams / (weightInGrams * bodyWaterConstant)) * 100 -
  //       metabolismRate * timeElapsedHours;
  //     this.bac = Math.max(this.bac, 0); // Ensure BAC does not go negative
  //   } else {
  //     this.bac = 0;
  //   }

  //   // Calculate sober time (including future drinks)
  //   const allAlcoholGrams = drinkTimes.reduce(
  //     (sum, drink) => sum + (drink.alcohol || 0),
  //     0
  //   );
  //   const soberHours =
  //     allAlcoholGrams / (metabolismRate * weightInGrams * bodyWaterConstant);

  //   const earliestAllDrinkTime = new Date(
  //     Math.min(...drinkTimes.map((drink) => drink.drinkDate.getTime()))
  //   );
  //   const estimatedSoberTime = new Date(
  //     Math.max(earliestAllDrinkTime.getTime()) +
  //       soberHours * 100 * 60 * 60 * 1000
  //   );

  //   this.soberTime = estimatedSoberTime;
  // }
  calculateBAC(): void {
    if (
      !this.userData ||
      typeof this.userData.weight !== 'number' ||
      !this.userData.gender
    ) {
      console.error('User data not available or invalid for BAC calculation.');
      this.bac = 0;
      this.soberTime = null;
      return;
    }

    const { weight, gender } = this.userData;
    const bodyWaterConstant = gender === 'male' ? 0.58 : 0.49;
    const metabolismRate = 0.015;
    const weightInGrams = weight * 1000;
    const currentTime = new Date();

    // Ensure selectedDate is a valid Date object
    let selectedDateObj: Date;
    if (
      this.selectedDate instanceof Date &&
      !isNaN(this.selectedDate.getTime())
    ) {
      selectedDateObj = this.selectedDate;
    } else if (
      typeof this.selectedDate === 'string' ||
      typeof this.selectedDate === 'number'
    ) {
      selectedDateObj = new Date(this.selectedDate);
      if (isNaN(selectedDateObj.getTime())) {
        console.error('Invalid selectedDate for BAC calculation.');
        this.bac = 0;
        this.soberTime = null;
        return;
      }
    } else {
      console.error('selectedDate is not a valid type for BAC calculation.');
      this.bac = 0;
      this.soberTime = null;
      return;
    }

    const allDrinksToday = (this.drinksForTheDay || []) // Handle if drinksForTheDay is null/undefined
      .map((drink) => {
        if (
          !drink ||
          typeof drink.time !== 'string' ||
          !drink.time.includes(':')
        ) {
          console.warn(
            'Skipping drink due to invalid format or missing time:',
            drink
          );
          return null;
        }
        const [hours, minutes] = drink.time.split(':').map(Number);
        if (isNaN(hours) || isNaN(minutes)) {
          console.warn(
            'Skipping drink due to invalid time parsing:',
            drink.time
          );
          return null;
        }
        const drinkDate = new Date(selectedDateObj);
        drinkDate.setHours(hours, minutes, 0, 0);
        return { ...drink, drinkDate, alcohol: Number(drink.alcohol) || 0 };
      })
      .filter((drink) => drink !== null) as {
      alcohol: number;
      drinkDate: Date;
      [key: string]: any;
    }[]; // Type assertion after filter

    allDrinksToday.sort(
      (a, b) => a.drinkDate.getTime() - b.drinkDate.getTime()
    );

    // --- Calculate Current BAC ---
    let currentBacInternal = 0;
    let lastProcessedDrinkTimeForBac: Date | null = null;

    const pastAndCurrentDrinks = allDrinksToday.filter(
      (drink) => drink.drinkDate <= currentTime
    );

    if (pastAndCurrentDrinks.length > 0) {
      // Initialize with the time of the first relevant drink
      lastProcessedDrinkTimeForBac = new Date(
        pastAndCurrentDrinks[0].drinkDate.getTime()
      );

      for (const drink of pastAndCurrentDrinks) {
        // 1. Metabolize BAC from lastProcessedDrinkTimeForBac up to current drink's time
        if (
          currentBacInternal > 0 &&
          drink.drinkDate > lastProcessedDrinkTimeForBac
        ) {
          const hoursElapsed =
            (drink.drinkDate.getTime() -
              lastProcessedDrinkTimeForBac.getTime()) /
            (1000 * 60 * 60);
          currentBacInternal -= metabolismRate * hoursElapsed;
          currentBacInternal = Math.max(0, currentBacInternal);
        }

        // Update lastProcessedDrinkTimeForBac to current drink's time
        lastProcessedDrinkTimeForBac = new Date(drink.drinkDate.getTime());

        // 2. Add BAC from the current drink
        // Widmark formula: BAC (g/100mL or %) = (Alcohol in grams / (Body weight in grams * r)) * 100
        currentBacInternal +=
          (drink.alcohol / (weightInGrams * bodyWaterConstant)) * 100;
      }

      // 3. After processing all past drinks, metabolize from the time of the *last consumed past drink* up to current time
      if (
        currentBacInternal > 0 &&
        lastProcessedDrinkTimeForBac &&
        currentTime > lastProcessedDrinkTimeForBac
      ) {
        const hoursElapsedSinceLastDrink =
          (currentTime.getTime() - lastProcessedDrinkTimeForBac.getTime()) /
          (1000 * 60 * 60);
        currentBacInternal -= metabolismRate * hoursElapsedSinceLastDrink;
      }
    }
    this.bac = Math.max(0, currentBacInternal); // Ensure BAC is not negative

    // --- Estimate Sober Time (using all drinks for the day) ---
    let simulatedBac = 0;
    let currentSimTime: Date | null = null;

    if (allDrinksToday.length === 0) {
      this.soberTime = null; // No drinks, no sober time to project based on them.
    } else {
      // Start simulation from the time of the first drink
      currentSimTime = new Date(allDrinksToday[0].drinkDate.getTime());
      // simulatedBac is already 0

      for (const drink of allDrinksToday) {
        // 1. Metabolize existing BAC from currentSimTime up to this drink's time
        if (simulatedBac > 0 && drink.drinkDate > currentSimTime) {
          const hoursToDrink =
            (drink.drinkDate.getTime() - currentSimTime.getTime()) /
            (1000 * 60 * 60);
          simulatedBac -= metabolismRate * hoursToDrink;
          simulatedBac = Math.max(0, simulatedBac);
        }

        // 2. Advance simulation time to the current drink's time (handles drinks at same time correctly)
        currentSimTime = new Date(
          Math.max(currentSimTime.getTime(), drink.drinkDate.getTime())
        );

        // 3. Add BAC from this drink
        simulatedBac +=
          (drink.alcohol / (weightInGrams * bodyWaterConstant)) * 100;
      }

      // 4. After all drinks, if BAC > 0, calculate time to zero from currentSimTime (time of last drink's effect)
      if (simulatedBac > 0 && currentSimTime) {
        const hoursToSober = simulatedBac / metabolismRate;
        this.soberTime = new Date(
          currentSimTime.getTime() + hoursToSober * 60 * 60 * 1000
        );
      } else if (currentSimTime) {
        // Already sober by the time of (or after processing) the last drink
        this.soberTime = new Date(currentSimTime.getTime());
      } else {
        // Should not happen if allDrinksToday has items, but as a fallback:
        this.soberTime = null;
      }
    }
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
  onDateChange(direction: string) {
    const originalDate = new Date(document.getElementById('date')!.innerHTML);

    if (direction === 'back') {
      const prevDay = originalDate;
      prevDay.setDate(originalDate.getDate() - 1);
      this.dateService.setSelectedDate(prevDay);
    } else if (direction === 'forward') {
      const nextDay = originalDate;
      nextDay.setDate(originalDate.getDate() + 1);
      this.dateService.setSelectedDate(nextDay);
    }
    // Since angular animations only trigger when the bound element's state changes
    // we need this key to always change
    this.dateAnimationKey++;
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
    this.navigationService.navigate('/tracking/drinklist');
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

    const docRef = this.afs.collection('drankDrinks').doc(docId);

    try {
      const docSnapshot = await docRef.get().toPromise();
      if (docSnapshot && docSnapshot.exists) {
        const drinkData = docSnapshot.data() as DrinkData;
        if (drinkData && drinkData.drinkAmounts) {
          const drinkAmounts = drinkData.drinkAmounts;

          for (const drinkName in drinkAmounts) {
            const entries = drinkAmounts[drinkName];

            // Find the specific entry by name and id
            const entryIndex = entries.findIndex(
              (entry: any) => entry.id === drink.id
            );

            if (entryIndex !== -1) {
              // Delete the specific entry by its id
              entries.splice(entryIndex, 1);
              break;
            }
          }

          await docRef.set({ ...drinkData, drinkAmounts }, { merge: true });
          this.notyfService.success('Drink deleted');

          this.fetchDrinksForTheDay();
        }
      } else {
        this.notyfService.error('No document found');
      }
    } catch (error) {
      this.notyfService.error('Something went wrong');
      console.error('Error fetching or deleting document: ', error);
    }
  }
}

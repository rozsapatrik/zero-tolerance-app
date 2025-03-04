import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { DateService } from 'src/app/services/date.service';
import { UserService } from 'src/app/services/user/user.service';
import { NotyfService } from '../../services/notyf/notyf.service';

interface DrinkData {
  drinkAmounts: { [key: string]: { id: string, amount: number; calories: number, alcohol: number, time: string }[] };
}

interface UserData {
  weight: number;
  gender: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit{
  
  selectedDate: Date;
  drinksForTheDay: any[] = [];
  totalCalories: number = 0;
  totalDrinks: number = 0;
  bac: number = 0;
  soberTime: Date | null = null;
  userData: UserData;
  
  constructor(
    private afs: AngularFirestore,
    private authService: AuthenticationService,
    private route: ActivatedRoute,
    private auth: AngularFireAuth,
    private userService: UserService,
    private dateService: DateService,
    private router: Router,
    private notyfService: NotyfService
  ){}

  @ViewChild('dateInput') dateInput!: ElementRef<HTMLInputElement>;

  async ngOnInit(): Promise<void> {
    // Initialize selected date from DateService or today's date
    this.selectedDate = this.dateService.getSelectedDate() || new Date();
    await this.fetchUserData();

    // Fetch drinks data for the selected date
    this.fetchDrinksForTheDay();
    
    // Watch for date changes and load drinks
    await this.dateService.selectedDate$.subscribe(date => {
      this.selectedDate = date;
      this.fetchDrinksForTheDay();
    });

    // Initial load of drinks for the selected date
    //await this.loadDrinksForSeletectedDate();
  }

  async fetchUserData(): Promise<void> {
    const currentUserID = await this.userService.getCurrentUserId();
    if (currentUserID) {
      const userDoc = await this.afs.collection('user').doc(currentUserID).get().toPromise();
      if (userDoc && userDoc.exists) {
        this.userData = userDoc.data() as UserData;
      }
    }
  }

  async fetchDrinksForTheDay(): Promise<void> {
    this.drinksForTheDay = [];  // Clear previous data
    const currentUserID = await this.userService.getCurrentUserId();
    
    if (currentUserID && this.selectedDate) {
      const formattedDate = `${this.selectedDate.getFullYear()}-${(this.selectedDate.getMonth() + 1).toString().padStart(2, '0')}-${this.selectedDate.getDate().toString().padStart(2, '0')}`;
      const docId = `${currentUserID}-${formattedDate}`; // Create document ID based on user and date

      const docRef = this.afs.collection('drankDrinks').doc(docId);
      const docSnapshot = await docRef.get().toPromise();

      if (docSnapshot && docSnapshot.exists) {
        const drinkData = docSnapshot.data() as { drinkAmounts?: Record<string, {id: string, amount: number, time: string, calories: number, alcohol: number }[]> };

        this.drinksForTheDay = drinkData?.drinkAmounts
          ? Object.entries(drinkData.drinkAmounts).map(([name, detailsArray]) => {
            return detailsArray.map(detail => ({
              name,
              id: detail.id,
              amount: detail.amount,
              calories: detail.calories,
              alcohol: detail.alcohol,
              time: detail.time
          }));
        }).flat() : [];

        this.calculateTotals();
        this.calculateBAC();
      }
    }
  }
  
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
      const pastDrinks = drinkTimes.filter((drink) => drink.drinkDate <= currentTime);
      const futureDrinks = drinkTimes.filter((drink) => drink.drinkDate > currentTime);
      console.log('Past Drinks:', pastDrinks);
      console.log('Future Drinks:', futureDrinks);

    // Calculate BAC based on past drinks
      const totalPastAlcoholGrams = pastDrinks.reduce((sum, drink) => sum + (drink.alcohol || 0), 0);
      if (pastDrinks.length > 0) {
        const lastDrinkTime = new Date(Math.max(...pastDrinks.map((drink) => drink.drinkDate.getTime())));
        const timeElapsedHours = Math.max(0, (currentTime.getTime() - lastDrinkTime.getTime()) / (1000 * 60 * 60));

        console.log('Last past drink time:', lastDrinkTime);
        console.log('Time elapsed since last drink (hours):', timeElapsedHours);

        this.bac =
            ((totalPastAlcoholGrams) / (weightInGrams * bodyWaterConstant)) * 100 - metabolismRate * timeElapsedHours;
        this.bac = Math.max(this.bac, 0); // Ensure BAC does not go negative
        console.log('Current BAC:', this.bac);
      } else {
        this.bac = 0; // No past drinks, no BAC
      }
      
      // Calculate sober time (including future drinks)
      const allAlcoholGrams = drinkTimes.reduce((sum, drink) => sum + (drink.alcohol || 0), 0);
      const soberHours = allAlcoholGrams / (metabolismRate * weightInGrams * bodyWaterConstant);

      console.log('Total alcohol grams (past + future):', allAlcoholGrams);
      console.log('Estimated hours to sober:', soberHours*100);

      const earliestAllDrinkTime = new Date(Math.min(...drinkTimes.map((drink) => drink.drinkDate.getTime())));
      const estimatedSoberTime = new Date(Math.max(earliestAllDrinkTime.getTime()) + (soberHours*100) * 60 * 60 * 1000);

      this.soberTime = estimatedSoberTime;
      console.log('Estimated time to be sober:', this.soberTime);  
  }

  calculateTotals(): void {
    this.totalCalories = this.drinksForTheDay.reduce((sum, drink) => sum + (drink.calories || 0), 0);
    this.totalDrinks = this.drinksForTheDay.length;
  }

  onDateChange(event: any) {
    this.selectedDate = new Date(event.target.value);
    this.dateService.setSelectedDate(this.selectedDate);
    this.fetchDrinksForTheDay();
  }

  getFormattedDate(date: Date): string {
    return date.toISOString().split('T')[0]; // Formats date as YYYY-MM-DD for the input field
  }

  openDatePicker() {
    this.dateInput.nativeElement.showPicker(); // Opens the native date picker
  }

  redirectToDrinks(){ this.router.navigate(['/drinklist']); }

  onDrinkClick(drink: any): void {
    const confirmDelete = window.confirm(`Are you sure you want to delete the drink ${drink.name}?`);
    if (confirmDelete) {
      this.deleteDrinkFromFirestore(drink);
    }
  }

  async deleteDrinkFromFirestore(drink: any): Promise<void> {
    const userId = await this.userService.getCurrentUserId();
    const formattedDate = `${this.selectedDate.getFullYear()}-${(this.selectedDate.getMonth() + 1).toString().padStart(2, '0')}-${this.selectedDate.getDate().toString().padStart(2, '0')}`;
    const docId = `${userId}-${formattedDate}`;
    console.log('UID: ', userId);
    console.log('DATE: ', formattedDate);

    const docRef = this.afs.collection('drankDrinks').doc(docId);
    
    try {
      const docSnapshot = await docRef.get().toPromise();
      if (docSnapshot && docSnapshot.exists) {
        const drinkData = docSnapshot.data() as DrinkData;
        console.log("drinkData: ", drinkData);
        if (drinkData && drinkData.drinkAmounts) {
          const drinkAmounts = drinkData.drinkAmounts;
  
          // Iterate through the drink amounts and find the drink to delete by name and id
          for (const drinkName in drinkAmounts) {
            const entries = drinkAmounts[drinkName];
            
            // Find the specific entry by name and id
            const entryIndex = entries.findIndex((entry: any) => entry.id === drink.id);
  
            if (entryIndex !== -1) {
              // Delete the specific entry by its id
              entries.splice(entryIndex, 1);
              break; // Exit loop once the drink is deleted
            }
          }
  
          // Update the document with the remaining drink amounts
          await docRef.set({ ...drinkData, drinkAmounts }, { merge: true });
          this.notyfService.success('Drink deleted');
          console.log(`Deleted drink ${drink.name} at ${drink.time} from Firestore`);
  
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

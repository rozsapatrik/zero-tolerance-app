import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map, Observable } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { DateService } from 'src/app/services/date.service';
import { UserService } from 'src/app/services/user/user.service';
import { NotyfService } from '../../services/notyf/notyf.service';

export interface Drink{
  name: string;
  abv: number;
  caloriesPerServing: number;
  category: string;
  ml: number;
}

interface DrinkAmount {
  id: string;
  amount: number;
  time: string;
  calories: number;
  alcohol: number;
  category: string;
}

interface DrinkAmountsMap {
  [key: string]: DrinkAmount[];
}

interface FirestoreDocumentData {
  drinkAmounts: DrinkAmountsMap;
}

@Component({
  selector: 'app-drink-list',
  templateUrl: './drink-list.component.html',
  styleUrls: ['./drink-list.component.scss']
})

export class DrinkListComponent {

  drinksList: Drink[] = [];
  selectedDrink: Drink | null = null;
  filteredDrinks: Drink[] = [];
  searchTerm: string = '';
  //drinkAmounts: { drinkName: string, amount: number, time:string, date: string }[] = [];
  drinkAmounts: Map<string, { drinkName: string, amount: number, calories: number, alcohol: number, time: string, date: string, category: string }> = new Map();
  tempAmounts: { [key: string]: {ml: number, cps: number, time: string, date: string} } = {};
  selectedDate: any;
  
  constructor(private afs: AngularFirestore,
    private dateService: DateService,
    private authService: AuthenticationService,
    private userService: UserService,
    private notyfService: NotyfService
  ){}

  ngOnInit(){
    this.userService.getCurrentUserId();
    this.selectedDate = this.dateService.getSelectedDate();

    this.getDrinks().subscribe(drinks => {
      this.drinksList = drinks;
      this.filteredDrinks = drinks;
    });
  }

  initializeDrinkData(drinkName: string): void {
    if (!this.tempAmounts[drinkName]) {
      this.tempAmounts[drinkName] = { ml: 0, time: '', date: '', cps: 0 };
    }
  }
  
  
  getDrinks(): Observable<Drink[]>{
    return this.afs.collection('drink').snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Drink;
        return data;
      }))
    );
  }

  selectDrink(drink: Drink): void {
    this.initializeDrinkData(drink.name);
    this.selectedDrink = this.selectedDrink === drink ? null : drink;
  }

  filterDrinks(): void {
    const terms = this.searchTerm.trim().toLowerCase().split(' ');
    this.filteredDrinks = this.drinksList.filter(drink => terms.every(term =>
      drink.name.toLowerCase().includes(term))
    );
  }
  
  async addDrinkAmount(drink: Drink): Promise<void> {
    const drinkData = this.tempAmounts[drink.name];
    const formattedDate = `${this.selectedDate.getFullYear()}-${(this.selectedDate.getMonth() + 1).toString().padStart(2, '0')}-${this.selectedDate.getDate().toString().padStart(2, '0')}`;
      
    // Make sure the data is valid
    if (drinkData && drinkData.ml > 0 && drinkData.time && this.selectedDate) {
      const formattedTime = new Date(`1970-01-01T${drinkData.time}:00`).toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit'
      });

      console.log('Getting current user email');
      const userEmail = await this.userService.getCurrentUserEmailString();
      const userID = await this.userService.getCurrentUserId();
      console.log('Fetched user email:', userEmail);
    
      // Create a unique document ID based on the user and date
      const docId = `${userID}-${formattedDate}`;

      // Get the existing drink data from Firestore (if any)
      const docRef = this.afs.collection('drankDrinks').doc(docId);
      const docSnapshot = await docRef.get().toPromise();

      // Check if the document exists and initialize the drinkAmounts
      let updatedDrinkAmounts: DrinkAmountsMap = {};
    
      if (docSnapshot && docSnapshot.exists) {
        // Document exists, get the existing drink amounts
        const existingData = docSnapshot.data() as FirestoreDocumentData;
        updatedDrinkAmounts = existingData ? existingData.drinkAmounts : {};
      }

      const calories = drink.caloriesPerServing * (drinkData.ml / 100);
      const alcohol = ((drink.abv/100) * drinkData.ml) * 0.789;

      console.log("ml log: ", drinkData.ml)
      console.log("cps log: ", calories)
      console.log("ml ethanol log", alcohol);

      // Generate a unique entryId for the drink
      const entryId = `${new Date().getTime()}-${Math.random()}`;

      // Check if the drink already exists in the map for that day
      if (updatedDrinkAmounts[drink.name]) {
        // If it exists, append the new entry to the array for that drink
        updatedDrinkAmounts[drink.name].push({
          id: entryId,
          amount: drinkData.ml,
          calories: calories,
          alcohol: alcohol,
          time: formattedTime,
          category: drink.category
        });
      } else {
        // If it doesn't exist, create a new array and add the first entry
        updatedDrinkAmounts[drink.name] = [{
          id: entryId,
          amount: drinkData.ml,
          calories: calories,
          alcohol: alcohol,
          time: formattedTime,
          category: drink.category
        }];
      }
    
      // Store the drink data in Firestore
      const drinkAmountData = {
        email: userEmail,
        //date: this.selectedDate.toISOString().split('T')[0],  // Store as YYYY-MM-DD
        date: formattedDate,
        drinkAmounts: updatedDrinkAmounts
      };
    
      try {
        // Store the updated data to Firestore, merging with existing document
        await docRef.set(drinkAmountData, { merge: true });
        this.notyfService.success('Drink added');
        console.log('Drink added to Firestore');
          
        // Clear the temporary data
        this.tempAmounts[drink.name] = { ml: 0, time: '', date: '', cps: 0 };
      } catch (error) {
        this.notyfService.error('Something went wrong');
        console.error('Error adding drink to Firestore: ', error);
      }
    } else {
      console.log('BAD');
    }
  }

}

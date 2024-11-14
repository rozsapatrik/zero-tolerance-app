import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { DateService } from 'src/app/services/date.service';
import { UserService } from 'src/app/services/user/user.service';

interface DrinkData {
  drinkAmounts: { [key: string]: { amount: number; calories: number, alcohol: number, time: string }[] };
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit{
  
  selectedDate: Date;
  drinksForTheDay: any[] = [];
  
  constructor(
    private afs: AngularFirestore,
    private authService: AuthenticationService,
    private route: ActivatedRoute,
    private auth: AngularFireAuth,
    private userService: UserService,
    private dateService: DateService,
    private router: Router
  ){}

  async ngOnInit(): Promise<void> {
    // Initialize selected date from DateService or today's date
    this.selectedDate = this.dateService.getSelectedDate() || new Date();

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

  async fetchDrinksForTheDay(): Promise<void> {
    this.drinksForTheDay = [];  // Clear previous data
    const currentUserID = await this.userService.getCurrentUserId();
    
    if (currentUserID && this.selectedDate) {
      const formattedDate = `${this.selectedDate.getFullYear()}-${(this.selectedDate.getMonth() + 1).toString().padStart(2, '0')}-${this.selectedDate.getDate().toString().padStart(2, '0')}`;
      const docId = `${currentUserID}-${formattedDate}`; // Create document ID based on user and date

      const docRef = this.afs.collection('drankDrinks').doc(docId);
      const docSnapshot = await docRef.get().toPromise();

      if (docSnapshot && docSnapshot.exists) {
        const drinkData = docSnapshot.data() as { drinkAmounts?: Record<string, {amount: number, time: string, calories: number, alcohol: number }[]> };

        this.drinksForTheDay = drinkData?.drinkAmounts
          ? Object.entries(drinkData.drinkAmounts).map(([name, detailsArray]) => {
            return detailsArray.map(detail => ({
              name,
              amount: detail.amount,
              calories: detail.calories,
              alcohol: detail.alcohol,
              time: detail.time
          }));
        }).flat() : [];
      }
    }
  }

  onDateChange(event: any) {
    this.selectedDate = new Date(event.target.value);
    this.dateService.setSelectedDate(this.selectedDate);
    this.fetchDrinksForTheDay();
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


    // Get the document reference
    const docRef = this.afs.collection('drankDrinks').doc(docId);

    docRef.get().toPromise().then((docSnapshot) => {
      console.log(1)
      if (docSnapshot && docSnapshot.exists) {
        console.log(2)
        const drinkData = docSnapshot?.data() as DrinkData;
        console.log("drinkData: ", drinkData);
        if (drinkData && drinkData.drinkAmounts) {
          console.log(3)
          const drinkAmounts = drinkData.drinkAmounts;

          // Delete the drink by its name
          delete drinkAmounts[drink.name];

          // Update the document without the deleted drink
          docRef.set({ ...drinkData, drinkAmounts }, { merge: true }).then(() => {
            console.log(`Deleted drink ${drink.name} from Firestore`);
            // Reload the drinks for the day after deletion
            this.fetchDrinksForTheDay();
          }).catch(error => {
            console.error('Error deleting drink from Firestore: ', error);
          });
        }
      }
    }).catch(error => {
      console.error('Error fetching document snapshot for deletion: ', error);
    });
  }  
}

import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map, Observable } from 'rxjs';

export interface Drink{
  name: string;
  abv: number;
  caloriesPerServing: number;
  category: string;
  ml: number;
}

@Component({
  selector: 'app-drink-list',
  templateUrl: './drink-list.component.html',
  styleUrls: ['./drink-list.component.css']
})

export class DrinkListComponent {

  drinksList: Drink[] = [];
  selectedDrink: Drink | null = null;
  filteredDrinks: Drink[] = [];
  searchTerm: string = '';
  drinkAmounts: { drinkName: string, amount: number, time:string }[] = [];
  tempAmounts: { [key: string]: {ml: number, time: string} } = {};
  
  constructor(private afs: AngularFirestore){}

  ngOnInit(){
    this.getDrinks().subscribe(drinks => {
      this.drinksList = drinks;
      this.filteredDrinks = drinks;
    });
  }

  initializeDrinkData(drinkName: string): void {
    if (!this.tempAmounts[drinkName]) {
      this.tempAmounts[drinkName] = { ml: 0, time: '' };
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

  addDrinkAmount(drink: Drink): void {
    const drinkData = this.tempAmounts[drink.name];
    if (drinkData && drinkData.ml > 0 && drinkData.time) {
      const formattedTime = new Date(`1970-01-01T${drinkData.time}:00`).toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit'
      });
      this.drinkAmounts.push({
        drinkName: drink.name,
        amount: drinkData.ml,
        time: formattedTime
      });
      this.tempAmounts[drink.name] = { ml: 0, time: '' };
      this.drinkAmounts.forEach(console.log);
    }
  }

}

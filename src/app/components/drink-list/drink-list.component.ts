import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map, Observable } from 'rxjs';

export interface Drink{
  brand: string;
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
  drinkAmounts: { drinkName: string, amount: number }[] = [];
  tempAmounts: { [key: string]: number } = {};
  
  constructor(private afs: AngularFirestore){}

  ngOnInit(){
    this.getDrinks().subscribe(drinks => {
      this.drinksList = drinks;
      this.filteredDrinks = drinks;
    });
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
    if(this.selectedDrink === drink){
      this.selectedDrink = null;
    } else {
      this.selectedDrink = drink;
    }
  }

  filterDrinks(): void {
    const terms = this.searchTerm.trim().toLowerCase().split(' ');
    this.filteredDrinks = this.drinksList.filter(drink => terms.every(term =>
      drink.brand.toLowerCase().includes(term) ||
      drink.name.toLowerCase().includes(term))
    );
  }

  addDrinkAmount(drink: Drink): void {
    const amountDrank = this.tempAmounts[drink.name];
    if (amountDrank > 0) {
      // Add a new entry for this drink in drinkAmounts
      this.drinkAmounts.push({ drinkName: drink.name, amount: amountDrank });
      console.log(`Added ${amountDrank} ml of ${drink.name}`);
      // Reset the temporary input for this drink after adding
      this.tempAmounts[drink.name] = 0;
      this.drinkAmounts.forEach(console.log);
    } else {
      console.log('Please enter a valid amount');
    }
  }

}

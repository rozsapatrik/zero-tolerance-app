import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map, Observable } from 'rxjs';
import { DateService } from 'src/app/services/date.service';

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
  //drinkAmounts: { drinkName: string, amount: number, time:string, date: string }[] = [];
  drinkAmounts: Map<string, { drinkName: string, amount: number, time: string, date: string }> = new Map();
  tempAmounts: { [key: string]: {ml: number, time: string, date: string} } = {};
  
  constructor(private afs: AngularFirestore, private dateService: DateService){}

  ngOnInit(){
    this.getDrinks().subscribe(drinks => {
      this.drinksList = drinks;
      this.filteredDrinks = drinks;
    });
  }

  initializeDrinkData(drinkName: string): void {
    if (!this.tempAmounts[drinkName]) {
      this.tempAmounts[drinkName] = { ml: 0, time: '', date: '' };
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
      const selectedDate = this.dateService.getSelectedDate();
      if (selectedDate) {
        const formattedDate = selectedDate.toLocaleDateString()
        this.drinkAmounts.set(drink.name, {
          drinkName: drink.name,
          amount: drinkData.ml,
          time: drinkData.time,
          date: formattedDate
        });
        this.tempAmounts[drink.name] = { ml: 0, time: '', date: '' };
        this.drinkAmounts.forEach(console.log);
        console.log(this.drinkAmounts.get(drink.name)?.amount);
      }
    }
  }

  getDrinkDataByName(name: string) {
    return this.drinkAmounts.get(name);
    console.log()
  }

}

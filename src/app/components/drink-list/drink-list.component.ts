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
  
  constructor(private afs: AngularFirestore){}

  ngOnInit(){
    this.getDrinks().subscribe(drinks => {this.drinksList = drinks});
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

}

import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss']
})
export class StatsComponent implements OnInit {
  graphData: { name: string; value: number }[] = [];
  pieChartData: { name: string; value: number }[] = [];

  constructor(private afs: AngularFirestore, private userService: UserService) {}

  async ngOnInit(): Promise<void> {
    const currentUserID = await this.userService.getCurrentUserId();
    if (!currentUserID) return;

    await this.loadBarChartData(currentUserID);
    await this.loadPieChartData(currentUserID);
  }

  private async loadBarChartData(currentUserID: string): Promise<void> {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
      return { date, formattedDate };
    }).reverse(); // Reverse to show oldest first

    const promises = last7Days.map(async (day) => {
      const docId = `${currentUserID}-${day.formattedDate}`;
      const docRef = this.afs.collection('drankDrinks').doc(docId);
      const docSnapshot = await docRef.get().toPromise();

      const drinkData = docSnapshot?.data() as {drinkAmounts?: Record<string, any[]>};
      const drinksForTheDay = drinkData?.drinkAmounts ?? {};
      const drinkCount = Object.values(drinksForTheDay).flat().length;

      return { name: `${day.date.getMonth() + 1}.${day.date.getDate()}`, value: drinkCount };
    });

    this.graphData = await Promise.all(promises);
  }

  private async loadPieChartData(currentUserID: string): Promise<void> {
    const drankDrinksRef = this.afs.collection('drankDrinks').ref;
    const querySnapshot = await drankDrinksRef
      .where('__name__', '>=', `${currentUserID}-`)
      .where('__name__', '<=', `${currentUserID}~`)
      .get();
  
    const categoryCounts: { [key: string]: number } = {};
  
    querySnapshot.forEach((doc) => {
      const docData = doc.data() as { drinkAmounts?: Record<string, { category?: string }> };
      const drinkAmounts = docData?.drinkAmounts || {};
      Object.values(drinkAmounts).forEach((drinkEntries: any) => {
        // Check if drinkEntries is an array or an object
        if (Array.isArray(drinkEntries)) {
          drinkEntries.forEach((drink: any) => {
            const category = drink.category || 'Unknown';
            categoryCounts[category] = (categoryCounts[category] || 0) + 1;
          });
        }
      });
    });
  
    //const totalDrinks = Object.values(categoryCounts).reduce((sum, count) => sum + count, 0);
    this.pieChartData = Object.entries(categoryCounts).map(([category, count]) => ({
      name: category,
      value: count,
    }));
  }
}

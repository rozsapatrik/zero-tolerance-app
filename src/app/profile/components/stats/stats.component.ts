import { Component, HostListener, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { LegendPosition } from '@swimlane/ngx-charts';
import { UserService } from 'src/app/core/services/user/user.service';

/**
 * Displaying user's personal statistics.
 */
@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss']
})
export class StatsComponent implements OnInit {
  /**
   * Default for bar chart.
   */
  barChartView: [number, number] = [700, 400];
  /**
   * Default for pie chart.
   */
  pieChartView: [number, number] = [400, 400];
  /**
   * Position of the legend for graph.
   */
  legendPosPie: LegendPosition = LegendPosition.Below;
  
  /**
   * Data of the bar graph.
   */
  graphData: { name: string; value: number }[] = [];
  /**
   * Data of the pie graph.
   */
  pieChartData: { name: string; value: number }[] = [];

  /**
   * 
   * @param afs Angular Firestore.
   * @param userService Service for user data.
   */
  constructor(private afs: AngularFirestore, private userService: UserService) {}

  /**
   * Listens for event to re-arrange charts if needed.
   */
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.adjustChartSizes();
  }

  /**
   * Initializes the two charts.
   * @returns If the current userID is invalid returns.
   */
  async ngOnInit(): Promise<void> {
    const currentUserID = await this.userService.getCurrentUserId();
    if (!currentUserID) return;

    this.adjustChartSizes();

    await this.loadBarChartData(currentUserID);
    await this.loadPieChartData(currentUserID);
  }

  /**
   * Sets the size of the charts.
   */
  private adjustChartSizes(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const barChartWidth = Math.max(Math.min(width * 0.8, 700), 300);
    const barChartHeight = Math.max(Math.min(height * 0.4, 400), 200);

    const pieChartWidth = Math.max(Math.min(width * 0.5, 400), 300);
    const pieChartHeight = Math.max(Math.min(height * 0.5, 400), 300);

    this.barChartView = [barChartWidth, barChartHeight];
    this.pieChartView = [pieChartWidth, pieChartHeight];
  }

  /**
   * Loads the data for the bar chart.
   * @param currentUserID The currently logged in user's ID.
   */
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

  /**
   * Loads the data for the pie chart.
   * @param currentUserID The currently logged in user's ID.
   */
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
    this.pieChartData = Object.entries(categoryCounts).map(([category, count]) => ({
      name: category,
      value: count,
    }));
  }
}

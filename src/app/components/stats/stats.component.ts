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

  constructor(private afs: AngularFirestore, private userService: UserService) {}

  async ngOnInit(): Promise<void> {
    const currentUserID = await this.userService.getCurrentUserId();
    if (!currentUserID) return;

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
}

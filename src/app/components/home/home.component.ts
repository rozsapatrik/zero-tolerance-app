import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { DateService } from 'src/app/services/date.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit{
  
  selectedDate: Date;
  
  constructor(
    private afs: AngularFirestore,
    private authService: AuthenticationService,
    private route: ActivatedRoute,
    private auth: AngularFireAuth,
    private userService: UserService,
    private dateService: DateService,
    private router: Router
  ){}

  ngOnInit(): void {
    //this.selectedDate = new Date();
    //this.dateService.setSelectedDate(this.selectedDate);
    this.dateService.selectedDate$.subscribe(date => {
      this.selectedDate = date || new Date(); // Default to today if date is null
    });
  }
  onDateChange(event: any) {
    this.selectedDate = new Date(event.target.value);
    this.dateService.setSelectedDate(this.selectedDate);
  }
  redirectToDrinks(){ this.router.navigate(['/drinklist']); }
  
}

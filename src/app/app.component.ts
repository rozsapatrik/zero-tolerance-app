import { Component, OnInit, ChangeDetectorRef  } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, NavigationError } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'zero-tolerance-app';

  loading = true;

  constructor(private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    setTimeout(() => {
      this.loading = false;
    }, 1000);
  }
}

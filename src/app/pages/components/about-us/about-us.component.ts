import { Component } from '@angular/core';
import { UserService } from 'src/app/core/services/user/user.service';

/**
 * Displays the about us page.
 */
@Component({
  selector: 'app-about-us',
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.scss']
})
export class AboutUsComponent {
  constructor(
    private userService: UserService
  ){}

  ngOnInit(){
    this.userService.getCurrentUserId();
  }
}

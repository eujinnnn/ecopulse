import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent {
  name: string = 'Adam';
  email: string = 'adam@gmail.com';
  contact: string = '0123456789';
  community: string = 'Seksyen 14';
  address: string = 'Jalan 14/4, Seksyen 14, 46100 Petaling Jaya, Selangor, Malaysia';
  
  constructor(private router: Router) {}

  navigateToEditProfile() {
    this.router.navigate(['/user/editprofile']);
  }

  navigateToNotification() {
    this.router.navigate(['/user/notification']);
  }

  navigateToHistory() {
    this.router.navigate(['/pickup']);
  }
}

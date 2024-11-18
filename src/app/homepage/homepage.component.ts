import { Component, OnInit } from '@angular/core';
import { AuthService } from '../service/auth.service';
import { Router } from '@angular/router'; // Import Router for navigation

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
})
export class HomeComponent implements OnInit {
  isLoggedIn: boolean = false;
  userName: string | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Check if the user is logged in
    this.isLoggedIn = this.authService.isLoggedIn();

    // If logged in, fetch the user's name (or any other user-specific data)
    if (this.isLoggedIn) {
      this.userName = this.authService.getUserId(); // You can change this to any other user data, such as getRole()
    }
  }

  // Logout function
  logout(): void {
    this.authService.logout();
    this.isLoggedIn = false;  // Update the login status
    this.router.navigate(['/']); // Redirect to home or sign-in page after logout
  }
}

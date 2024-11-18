import { Component } from '@angular/core';
import { AuthService } from '../../service/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})

export class NavbarComponent {
  isDropdownVisible: boolean = false;

  constructor(private router: Router, private authService: AuthService) {} // Inject the AuthService

  showDropdown() {
    this.isDropdownVisible = true;
  }

  hideDropdown() {
    this.isDropdownVisible = false;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  // Get current user details from AuthService
  getCurrentUser() {
    return this.authService.getCurrentUser();
  }
}

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../service/auth.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent {
  isSignUpVisible: boolean = false;

  loginUsername: string = '';
  loginPassword: string = '';
  signupEmail: string = '';
  signupUsername: string = '';

  constructor(private router: Router, private authService: AuthService) {}

  toggleSign() {
    this.isSignUpVisible = false; // Hide signup form
  }

  toggleLog() {
    this.isSignUpVisible = true; // Show signup form
  }

  login() {
    if (this.loginUsername && this.loginPassword) {
      this.authService.login(this.loginUsername, this.loginPassword).subscribe(
        (response: any) => {
          if (response.success) {
            this.handleLoginSuccess(response);
          } else {
            alert('Invalid username or password');
          }
        },
        (error) => {
          console.error('Error:', error);
          alert('Login failed. Please try again.');
        }
      );
    } else {
      alert('Please enter username and password');
    }
  }

  signup() {
    if (this.signupEmail && this.signupUsername) {
      this.authService.signup(this.signupEmail, this.signupUsername).subscribe(
        (response: any) => {
          if (response.message === 'Signup successful') {
            alert('Signup successful. Check your email for the login details.');
            window.location.reload();
          } else {
            alert(response.message);
          }
        },
        (error) => {
          console.error(error);
          alert('Email or username already exists.');
        }
      );
    } else {
      alert('Please fill in all fields');
    }
  }

  private handleLoginSuccess(response: any) {
    // Store user data in localStorage
    localStorage.setItem('token', response.token);
    localStorage.setItem('role', response.role);
    localStorage.setItem('userId', response.userId);

    const community = response.role === 'Super Admin' ? 'default' : response.community;
    localStorage.setItem('community', community);

    // Redirect based on user role
    if (response.role === 'Admin' || response.role === 'Super Admin') {
      this.router.navigate([`/admin/${community}`]);
    } else if (response.role === 'Member') {
      this.router.navigate([`/user/${response.userId}`]);
    }
  }
}

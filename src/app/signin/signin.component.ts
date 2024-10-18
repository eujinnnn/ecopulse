import { Component } from '@angular/core';
import { Router } from '@angular/router';

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
  signupPassword: string = '';

  constructor(private router: Router) {}

  toggleSign() {
    this.isSignUpVisible = false;
  }

  toggleLog() {
    this.isSignUpVisible = true;
  }

  login() {
    if (this.loginUsername && this.loginPassword) {
      this.router.navigate(['/user']);
    } else {
      alert('Please fill in all fields');
    }
  }

  signup() {
    if (this.signupEmail && this.signupUsername && this.signupPassword) {
      console.log('Signup successful');
    } else {
      alert('Please fill in all fields');
    }
  }
}

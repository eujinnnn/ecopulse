import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost/ecopulse/auth.php'; // Replace with your actual API URL

  constructor(private http: HttpClient) {}

  // Login method
  login(username: string, password: string): Observable<any> {
    const loginData = {
      action: 'login',
      loginUsername: username,
      loginPassword: password
    };

    return this.http.post<any>(this.apiUrl, loginData);
  }

  // Signup method
  signup(email: string, username: string): Observable<any> {
    const signupData = {
      action: 'signup',
      signupEmail: email,
      signupUsername: username,
    };

    return this.http.post<any>(this.apiUrl, signupData);
  }

  // Check if user is logged in by checking token in localStorage
  isLoggedIn(): boolean {
    return localStorage.getItem('token') !== null;
  }

  // Get the user's role from localStorage
  getRole(): string | null {
    return localStorage.getItem('role');
  }

  // Get the community from localStorage
  getCommunity(): string | null {
    return localStorage.getItem('community');
  }

  // Get the user ID from localStorage
  getUserId(): string | null {
    return localStorage.getItem('userId');
  }

  // Get full user info (ID, role, etc.)
  getCurrentUser() {
    if (this.isLoggedIn()) {
      return {
        id: this.getUserId(),
        role: this.getRole(),
        community: this.getCommunity()
      };
    }
    return null; // Return null if not logged in
  }

  // Logout function to clear localStorage and redirect user
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('community');
    localStorage.removeItem('userId');
  }
}

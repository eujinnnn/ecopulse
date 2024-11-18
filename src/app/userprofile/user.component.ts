import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  name: string = '';
  email: string = '';
  contact: string = '';
  community: string = '';
  address: string = '';
  userId: string = '';
  loading: boolean = true; // To show loading state
  errorMessage: string = ''; // To show error messages

  constructor(private router: Router, private http: HttpClient, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.userId = params['id']; // Retrieve the 'id' parameter from the route
      this.getUserDetails(this.userId); // Pass the userId to getUserDetails
    });
  }

  getUserDetails(id: string): void {
    this.loading = true; // Start loading
    this.errorMessage = ''; // Reset any previous errors
    this.http.get<any>(`http://localhost/ecopulse/get_user.php?id=${id}`).pipe(
      catchError(error => {
        this.loading = false; // Stop loading on error
        if (error.status === 404) {
          this.errorMessage = 'User not found.';
        } else if (error.status === 500) {
          this.errorMessage = 'Server error. Please try again later.';
        } else {
          this.errorMessage = 'An unexpected error occurred.';
        }
        return of(null); // Return an empty observable
      })
    ).subscribe(
      (data) => {
        this.loading = false; // Stop loading
        if (data) {
          this.name = data.username;
          this.email = data.email;
          this.contact = data.contactNumber;
          this.community = data.community_name;
          this.address = data.address;
        }
      }
    );
  }  

  navigateToEditProfile() {
    this.router.navigate(['user/editprofile', this.userId]);
  }

  navigateToNotification() {
    this.router.navigate(['/user/notification', this.userId]);
  }

  navigateToHistory() {
    this.router.navigate(['/pickup', this.userId]);
  }
}

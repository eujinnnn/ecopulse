import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-editprofile',
  templateUrl: './editprofile.component.html',
  styleUrls: ['./editprofile.component.css']
})
export class editprofileComponent implements OnInit { 
  name: string = '';
  email: string = '';
  contactNumber: string = '';
  community: string = '';
  address: string = '';

  communities: any[] = []; // Store communities fetched from the database
  userId: string | null = null; // Variable to hold user ID

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    this.fetchCommunities(); // Fetch communities on component initialization
    this.userId = this.route.snapshot.paramMap.get('id'); // Get user ID from route parameters

    if (this.userId) {
      this.getUserDetails(this.userId); // Fetch user details if user ID is available
    }
  }

  fetchCommunities() {
    this.http.get('http://localhost/ecopulse/get_communities.php')
      .subscribe({
        next: (response: any) => {
          if (response.status === 'success') {
            // Extracting the community names from the response
            this.communities = response.data.map((community: any) => community.name);
            console.log('Communities fetched successfully:', this.communities);
          } else {
            console.error('Error: Status not success', response);
          }
        },
        error: (error) => {
          console.error('Error fetching communities:', error);
          alert('There was an error fetching communities.');
        }
      });
  }  

  getUserDetails(userId: string) {
    this.http.get(`http://localhost/ecopulse/get_user.php?id=${userId}`) // Adjust the endpoint to get user details
      .subscribe({
        next: (response: any) => {
          this.name = response.username;
          this.email = response.email;
          this.contactNumber = response.contactNumber;
          this.community = response.community;
          this.address = response.address;
        },
        error: (error) => {
          console.error('Error fetching user details:', error);
          alert('There was an error fetching user details.');
        }
      });
  }

  updateProfile() {
    // Check if all fields are filled
    if (!this.name || !this.email || !this.contactNumber || !this.address || !this.community) {
      alert('All fields are required.');
      return;
    }
  
    const profileData = {
      id: this.userId,
      name: this.name,
      email: this.email,
      contactNumber: this.contactNumber,
      community: this.community,
      address: this.address
    };
  
    this.http.post<any>('http://localhost/ecopulse/update_profile.php', profileData).subscribe(
      (response) => {
        if (response.success) {
          console.log('Profile updated successfully:', response.message);
          this.router.navigate(['user', this.userId]);
        } else {
          console.error('Error updating profile:', response.message);
        }
      },
      (error) => {
        console.error('Error updating profile:', error);
      }
    );
  }  

  onCommunityChange(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.community = selectedValue;
  }
}

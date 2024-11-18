import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

interface PickupSchedule {
  days: string[];  // Rename 'pickup_day' to 'days'
  times: string[]; // Rename 'pickup_time' to 'times'
}

interface Community {
  name: string;
  pickupSchedule: PickupSchedule[];
}

export interface ApiResponse {
  status: string;
  message: string;
  data: Community[];
}

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  notification: string = '';
  communityName: string = '';
  selectedDays: Set<string> = new Set(); // Use Set for unique days
  selectedTimes: Set<string> = new Set(); // Use Set for unique times
  availableDays = [
    { name: 'Monday', selected: false },
    { name: 'Tuesday', selected: false },
    { name: 'Wednesday', selected: false },
    { name: 'Thursday', selected: false },
    { name: 'Friday', selected: false },
    { name: 'Saturday', selected: false },
    { name: 'Sunday', selected: false }
  ];
  availableTimes: string[] = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'];
  isModalVisible: boolean = false;
  communities: Community[] = [];
  isLoading: boolean = false; // Loading state

  constructor(private http: HttpClient, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.communityName = params.get('community') || ''; 
      console.log('Community:', this.communityName); 
    });
  
    this.getCommunities(); // Fetch communities on initialization
  }
  

  getCommunities(): void {
    this.isLoading = true;
    const apiUrl = 'http://localhost/ecopulse/get_communities.php';
  
    this.http.get<ApiResponse> (apiUrl).subscribe({
      next: (response) => {
        console.log('Communities fetched:', response.data);  // Check if the data is available
        this.communities = response.data;
      },
      error: (error) => {
        console.error('Error fetching communities:', error);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }  

  // Show community modal
  showCommunityModal() {
    this.isModalVisible = true;
  }

  // Close community modal
  closeCommunityModal() {
    this.isModalVisible = false;
    this.resetForm(); // Reset form when closing the modal
  }

  // Add new community
  addCommunity() {
    if (!this.communityName || this.selectedDays.size === 0 || this.selectedTimes.size === 0) {
      alert('Please fill in all fields: community name, at least one pickup day, and at least one pickup time.');
      return;
    }

    const newCommunity: Community = {
      name: this.communityName,
      pickupSchedule: [{
        days: Array.from(this.selectedDays), // Convert Set to Array
        times: Array.from(this.selectedTimes)  // Convert Set to Array
      }]
    };

    this.isLoading = true; // Set loading state to true
    this.http.post<ApiResponse>('http://localhost/ecopulse/add_community.php', newCommunity)
      .subscribe({
        next: (response) => {
          if (response.status === 'success') {
            alert(response.message);
            this.closeCommunityModal(); // Close the modal after adding
          } else {
            alert('Error adding community: ' + response.message);
          }
          this.resetForm();
          this.getCommunities(); // Refresh the community list
        },
        error: (error) => {
          console.error('Error adding community:', error);
          alert('There was an error adding the community.');
        },
        complete: () => {
          this.isLoading = false; // Set loading state to false after request completes
        }
      });
  }

  // Reset form data
  resetForm() {
    this.communityName = '';
    this.selectedDays.clear(); // Clear selected days
    this.selectedTimes.clear(); // Clear selected times
    this.availableDays.forEach(day => day.selected = false); // Reset day selections
  }

  // Handle day selection
  onDayChange(day: any) {
    if (day.selected) {
      this.selectedDays.add(day.name);
    } else {
      this.selectedDays.delete(day.name);
    }
  }

  // Handle time selection
  onTimeChange(time: string) {
    if (this.selectedTimes.has(time)) {
      this.selectedTimes.delete(time);
    } else {
      this.selectedTimes.add(time);
    }
  }

  broadcastNotification() {
    if (!this.notification) {
      alert('Please enter a notification message');
      return;
    }
  
    const payload = {
      community: this.communityName,
      message: this.notification
    };
  
    console.log('Sending notification:', payload); // Check the entire payload
    
    this.http.post('http://localhost/ecopulse/send_notification.php', payload)
      .subscribe({
        next: (response: any) => {
          if (response.status === 'success') {
            alert('Notification sent successfully!');
          } else {
            alert('Error: ' + response.message);
          }
        },
        error: (error) => {
          console.error('Error sending notification:', error);
          alert('There was an error sending the notification.');
        }
      });
  }      
}

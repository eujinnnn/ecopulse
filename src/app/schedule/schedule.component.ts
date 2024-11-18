import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

interface ScheduleData {
  pickup_schedule: { [key: string]: string[] }; // Key: pickup_day (e.g., Monday), Value: Array of pickup_times
}

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css']
})
export class ScheduleComponent implements OnInit {
  selectedTime: string = '';
  selectedWaste: string = '';
  selectedRecyclables: string[] = [];
  selectedDay: string = '';  // Track the selected pickup day
  address: string = ''; 
  community: string = ''; 
  userId: string = '';
  userCommunity: string = '';
  
  dayOptions: string[] = [];  // Available pickup days like Monday, Wednesday
  timeOptions: string[] = [];

  wasteOptions: string[] = [
    'household waste',
    'recyclable waste',
    'hazardous waste'
  ];

  recyclableOptions: string[] = [
    'paper',
    'plastic',
    'aluminium'
  ];

  pickup_schedule: { [key: string]: string[] } = {}; // Pickup schedule from the server

  constructor(private http: HttpClient, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.userId = params.get('id') || ''; 
      console.log('User ID:', this.userId); 
    });

    this.fetchUserData();
    this.userCommunity = localStorage.getItem('community') || ''; // Fetch from localStorage or default to an empty string
    console.log('User Community:', this.userCommunity);    
  }

  fetchUserData(): void {
    if (!this.userId) {
      console.error('User ID is not available');
      return;
    }
  
    this.http.get<any>(`http://localhost/ecopulse/get_user.php?id=${this.userId}`)
      .subscribe({
        next: (response) => {
          if (response && response.community_id && response.address) {
            this.community = response.community_id;
            this.address = response.address;
            console.log('User community ID:', response.community_id);
            this.fetchScheduleForCommunity();
          } else {
            console.error('Community ID or Address not found for the user');
            alert('Could not find your community ID or address. Please try again later.');
          }
        },
        error: (error) => {
          console.error('Error fetching community ID and address:', error);
          alert('There was an error fetching your community ID and address.');
        }
      });
  }

  fetchScheduleForCommunity(): void {
    if (!this.community) {
      console.error('No community set. Cannot fetch schedule.');
      return;
    }
  
    this.http.get<ScheduleData>(`http://localhost/ecopulse/get_schedule.php?community=${this.community}`)
      .subscribe({
        next: (response) => {
          if (response && response.pickup_schedule) {
            this.pickup_schedule = response.pickup_schedule;
            this.dayOptions = Object.keys(this.pickup_schedule); // Available days
            this.selectedDay = this.dayOptions[0]; // Set the first day as default
            this.timeOptions = this.pickup_schedule[this.selectedDay] || [];
          } else {
            console.error('No pickup schedule found in response.');
          }
        },
        error: (error) => {
          console.error('Error fetching schedule:', error);
          alert('Could not load the pickup schedule for your community.');
        }
      });
  }

  onDayChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedDay = selectElement.value;
    this.timeOptions = this.pickup_schedule[this.selectedDay] || [];
    this.selectedTime = ''; // Reset time when day changes
    console.log('Selected Day:', this.selectedDay);
  }

  onTimeChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedTime = selectElement.value;
    console.log('Selected Time:', this.selectedTime);
  }

  onWasteChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedWaste = selectElement.value;
    console.log('Selected Waste:', this.selectedWaste);
  }

  onRecyclableChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const selectedRecyclable = selectElement.value;
    if (this.selectedRecyclables.includes(selectedRecyclable)) {
      this.selectedRecyclables = this.selectedRecyclables.filter(r => r !== selectedRecyclable);
    } else {
      this.selectedRecyclables.push(selectedRecyclable);
    }
    console.log('Selected Recyclables:', this.selectedRecyclables);
  }

  schedulePickup(pickupDay: string, pickupTime: string, wasteType: string, recyclables: string[], userId: string, userCommunity: string): void {
    const payload = { 
      pickup_day: pickupDay,
      pickup_time: pickupTime,
      waste_type: wasteType,
      recyclables: recyclables,
      user_id: userId,
      user_community: userCommunity
    };

    console.log('Payload being sent to the server:', payload);
  
    this.http.post('http://localhost/ecopulse/schedule_pickup.php', payload)
      .subscribe({
        next: (response) => {
          this.clearForm();
          alert('Pickup scheduled successfully');
        },
        error: (error) => {
          console.error('Error scheduling pickup:', error);
        }
      });
  }

  clearForm(): void {
    this.selectedDay = '';
    this.selectedTime = '';
    this.selectedWaste = '';
    this.selectedRecyclables = [];
  }
}

import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

interface Pickup {
    date: string;
    day: string;
    time: string;
    type: string;
    details: string;
}

@Component({
    selector: 'app-pick',
    templateUrl: './pick.component.html',
    styleUrls: ['./pick.component.css']
})
export class PickComponent implements OnInit {
    pickups: Pickup[] = [];
    filteredPickups: Pickup[] = [];
    wasteTypes: string[] = ['household waste', 'recyclable waste', 'hazardous waste'];
    startDate: string = '';
    endDate: string = '';
    selectedWasteType: string = '';
    userId: string = ''; 

    constructor(private http: HttpClient, private route: ActivatedRoute) {}

    ngOnInit() {
        // Retrieve the user ID from URL params
        this.route.paramMap.subscribe(params => {
            this.userId = params.get('id') || ''; 
            console.log('User ID:', this.userId); 
            this.getPickups();  // Ensure data is fetched after userId is available
        });
    }

    // Fetch pickup data from the backend, including userId as a query parameter
    getPickups() {
        const apiUrl = `http://localhost/ecopulse/get_pickups.php?userId=${this.userId}`;

        this.http.get<Pickup[]>(apiUrl).subscribe(
            (data: Pickup[]) => {
                this.pickups = data;
                this.filteredPickups = data; // Initialize with all data
            },
            (error) => {
                console.error('Failed to load pickups:', error);
            }
        );
    }

    // Filter the table based on the selected filters
    filterHistory() {
        const start = this.startDate ? new Date(this.startDate).getTime() : 0;
        const end = this.endDate ? new Date(this.endDate).getTime() : new Date().getTime();

        this.filteredPickups = this.pickups.filter(pickup => {
            const pickupDate = new Date(pickup.date).getTime();
            const matchesDate = pickupDate >= start && pickupDate <= end;
            const matchesType = this.selectedWasteType ? pickup.type === this.selectedWasteType : true;

            return matchesDate && matchesType;
        });
    }
}

import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-notification',
    templateUrl: './notification.component.html',
    styleUrls: ['./notification.component.css']
})
export class notificationComponent implements OnInit {
    // Declare the type for notifications
    notifications: { date: string; message: string }[] = [];
    userId: string = '';   

    constructor(private http: HttpClient, private route: ActivatedRoute) {}

    ngOnInit(): void {
        // Get the user ID from route parameters
        this.route.paramMap.subscribe(params => {
            this.userId = params.get('id') || ''; // Retrieve 'id' from route parameters
            console.log('User ID:', this.userId); 
            
            // Fetch notifications after userId is set
            if (this.userId) {
                this.getNotifications();
            } else {
                console.error('User ID not found');
            }
        });
    }

    // Fetch notifications from the backend
    getNotifications() {
        const apiUrl = `http://localhost/ecopulse/get_notifications.php?userId=${this.userId}`;

        this.http.get<any[]>(apiUrl).subscribe(
            (data) => {
                this.notifications = data; // Store the response
            },
            (error) => {
                console.error('Error fetching notifications', error);
            }
        );
    }
}

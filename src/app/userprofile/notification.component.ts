import { Component } from '@angular/core';

@Component({
    selector: 'app-notification',
    templateUrl: './notification.component.html',
    styleUrls: ['./notification.component.css']
})
export class notificationComponent {
    notifications = [
        { date: new Date(), title: 'Upcoming Waste Pickup', details: 'Your waste will be picked up on 2024-10-20 at 10:00 AM.' },
        { date: new Date(), title: 'Community Event', details: 'Join us for a community cleanup on 2024-10-25!' },
    ];
}

import { Component } from '@angular/core';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css']
})
export class ScheduleComponent {
  selectedTime: string = '';
  selectedWaste: string = '';
  selectedRecyclables: string[] = [];
  pickupDate: string = '';
  address: string = 'Jalan 14/4, Seksyen 14, 46100 Petaling Jaya, Selangor, Malaysia';

  timeOptions: string[] = [
    '10:00 a.m. - 11:00 a.m.',
    '11:00 a.m. - 12:00 p.m.',
    '12:00 p.m. - 1:00 p.m.',
    '1:00 p.m. - 2:00 p.m.',
    '2:00 p.m. - 3:00 p.m.',
    '3:00 p.m. - 4:00 p.m.'
  ];

  wasteOptions: string[] = [
    'household waste',
    'recyclable waste',
    'harzadous waste'
  ];

  recyclableOptions: string[] = [
    'paper',
    'plastic',
    'aluminium'
  ];

  onTimeChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedTime = selectElement.value;
    console.log('Selected Time:', this.selectedTime);
  }

  onWasteChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedWaste = selectElement.value;
    this.selectedRecyclables = [];
    console.log('Selected Waste:', this.selectedWaste);
  }

  onRecyclableChange(recyclable: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;

    if (checked) {
      this.selectedRecyclables.push(recyclable);
    } else {
      this.selectedRecyclables = this.selectedRecyclables.filter(item => item !== recyclable);
    }
    console.log('Selected Recyclables:', this.selectedRecyclables);
  }

  clearForm(): void {
    this.selectedTime = '';
    this.selectedWaste = '';
    this.selectedRecyclables = [];
    const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement;
    if (dateInput) {
      dateInput.value = '';
    }
  }

  schedulePickup(): void {
    const dateInput = document.querySelector('.datepicker') as HTMLInputElement;
    this.pickupDate = dateInput.value;

    if (!this.selectedWaste || !this.selectedTime || !this.pickupDate) {
        alert('Please fill in all fields: date, time, and waste type.');
        return;
    }

    const message = `Your pickup is scheduled successfully\n\n` +
                    `Waste Type: ${this.selectedWaste}\n` +
                    `Pickup time: ${this.selectedTime}\n` +
                    `Pickup date: ${this.pickupDate}\n` +
                    `Pickup location: ${this.address}`;

    alert(message);
    this.clearForm();
  }
}

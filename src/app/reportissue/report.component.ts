import { Component } from '@angular/core';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent {
  selectedIssue: string = '';
  issueLocation: string = '';
  issueDescription: string = '';
  additionalComments: string = '';
  uploadedImage: File | null = null;

  issueOptions: string[] = [
    'missed pickup',
    'overflowing bin',
    'illegal dumping'
  ];

  onIssueChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedIssue = selectElement.value;
    console.log('Selected Issue:', this.selectedIssue);
  }

  onLocationChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.issueLocation = inputElement.value;
    console.log('Issue Location:', this.issueLocation);
  }

  onDescriptionChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.issueDescription = inputElement.value;
    console.log('Issue Description:', this.issueDescription);
  }

  onCommentsChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.additionalComments = inputElement.value;
    console.log('Additional Comments:', this.additionalComments);
  }

  onImageUpload(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      this.uploadedImage = fileInput.files[0];
      console.log('Uploaded Image:', this.uploadedImage.name);
    }
  }

  clearForm(): void {
    this.selectedIssue = '';
    this.issueLocation = '';
    this.issueDescription = '';
    this.additionalComments = '';
    this.uploadedImage = null;

    const issuePicker = document.querySelector('.issuepicker') as HTMLSelectElement;
    if (issuePicker) {
      issuePicker.selectedIndex = 0;
    }

    const textInputs = document.querySelectorAll('input[type="text"]') as NodeListOf<HTMLInputElement>;
    textInputs.forEach(input => input.value = '');
  }

  onSubmit(): void {
    console.log('Submitting form...');
    if (!this.selectedIssue || !this.issueLocation || !this.issueDescription) {
      alert('Please fill in all required fields: issue type, location, and description.');
      return;
    }

    const message = `Issue Type: ${this.selectedIssue}\n` +
                    `Location: ${this.issueLocation}\n` +
                    `Description: ${this.issueDescription}\n` +
                    `Additional Comments: ${this.additionalComments || 'None'}\n` +
                    `Uploaded Image: ${this.uploadedImage ? this.uploadedImage.name : 'None'}`;

    alert('Your report has been submitted successfully!\n\n' + message);
    this.clearForm();
  }
}

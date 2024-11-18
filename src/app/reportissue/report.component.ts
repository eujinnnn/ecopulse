import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent implements OnInit {
  // Form fields and options
  selectedIssue: string = '';
  issueLocation: string = '';
  issueDescription: string = '';
  additionalComments: string = '';
  uploadedImage: File | null = null;
  userId: string = '';   
  userCommunity: string = '';

  issueOptions: string[] = ['missed pickup', 'overflowing bin', 'illegal dumping'];

  constructor(private http: HttpClient, private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Retrieve the user ID from URL params
    this.route.paramMap.subscribe(params => {
      this.userId = params.get('id') || ''; 
      console.log('User ID:', this.userId); 
    });

    // Retrieve the user community from localStorage
    this.userCommunity = localStorage.getItem('community') || ''; // Fetch from localStorage or default to an empty string
    console.log('User Community:', this.userCommunity);
  }

  // Handle issue selection from dropdown
  onIssueChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedIssue = selectElement.value;
  }

  // Handle location input change
  onLocationChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.issueLocation = inputElement.value;
  }

  // Handle description input change
  onDescriptionChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.issueDescription = inputElement.value;
  }

  // Handle additional comments input change
  onCommentsChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.additionalComments = inputElement.value;
  }

  // Handle image upload and store the selected file
  onImageUpload(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      this.uploadedImage = fileInput.files[0];
    }
  }

  // Clear the form after submission
  clearForm(): void {
    this.selectedIssue = '';
    this.issueLocation = '';
    this.issueDescription = '';
    this.additionalComments = '';
    this.uploadedImage = null;
  }

  // Submit the form data
  onSubmit(): void {
    // Check that all required fields are filled
    if (!this.selectedIssue || !this.issueLocation || !this.issueDescription || !this.userId) {
      alert('Please fill in all required fields: issue type, location, description, and user ID.');
      return;
    }

    // Create FormData object to send the form data
    const formData = new FormData();
    formData.append('selectedIssue', this.selectedIssue);
    formData.append('issueLocation', this.issueLocation);
    formData.append('issueDescription', this.issueDescription);
    formData.append('additionalComments', this.additionalComments);
    formData.append('userId', this.userId); // Ensure userId is added
    formData.append('userCommunity', this.userCommunity); // Send the community value
  
    if (this.uploadedImage) {
      formData.append('uploadedImage', this.uploadedImage);
    }

    // Send form data to the server
    this.http.post('http://localhost/ecopulse/report_submission.php', formData).subscribe(
      (response: any) => {
        // Handle success response
        if (response.status === 'success') {
          alert(response.message);
          this.clearForm(); // Clear the form after successful submission
        } else {
          alert('Error: ' + response.message);
        }
      },
      (error) => {
        console.error('Error:', error);
        alert('An error occurred while submitting the report.');
      }
    );
  }
}

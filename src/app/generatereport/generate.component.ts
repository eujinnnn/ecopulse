import { Component, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';
import { AuthService } from '../service/auth.service';

Chart.register(...registerables);

@Component({
  selector: 'app-generate',
  templateUrl: './generate.component.html',
  styleUrls: ['./generate.component.css']
})
export class GenerateComponent {
  selectedReport: string = '';
  startDate: string = '';
  endDate: string = '';
  reportMessage: string = '';
  chart: any;

  reportOptions: string[] = [
    'Pickup Statistics',
    'Issues Report',
    'Recycling Rates'
  ];

  @ViewChild('reportChart') reportChart!: ElementRef;

  constructor(private http: HttpClient, private authService: AuthService) {}

  onReportChange(event: Event): void {
    const inputElement = event.target as HTMLSelectElement;
    this.selectedReport = inputElement.value;
  }

  generateReport(): void {
    // Reset reportMessage initially
    this.reportMessage = '';

    // Check if report type is selected
    if (!this.selectedReport) {
      alert('Please select a report type.');
      return;
    }

    // Check if start date and end date are filled
    if (!this.startDate || !this.endDate) {
      alert('Please specify both start and end dates.');
      return;
    }

    // Reset the chart if it exists
    if (this.chart) {
      this.chart.destroy();
    }

    // Call the PHP script to fetch report data
    const formData = new FormData();
    formData.append('reportType', this.selectedReport);
    formData.append('startDate', this.startDate);
    formData.append('endDate', this.endDate);
    formData.append('userId', this.authService.getUserId()!);
    formData.append('userRole', this.authService.getRole()!);
    formData.append('userCommunity', this.authService.getCommunity()!);

    console.log(this.selectedReport, this.startDate, this.endDate, this.authService.getUserId(), this.authService.getRole(), this.authService.getCommunity());

    this.http.post<any>('http://localhost/ecopulse/generate.php', formData)
      .subscribe(response => {
        if (response.status === 'success' && (response.labels.length > 0 || response.values.length > 0)) {
          this.reportMessage = ''; // Clear message upon success
          this.createChart(response.labels, response.values, response.issues, response.recyclables);
        } else {
          alert('No data available for the selected report. Please try again with different dates.');
        }
      }, error => {
        alert('Error fetching report data.');
      });
  }

  private createChart(labels: string[], values: number[], issues?: string[], recyclables?: string[]) {
    const ctx = this.reportChart.nativeElement.getContext('2d');
    
    // Destroy existing chart to avoid multiple charts being drawn
    if (this.chart) {
      this.chart.destroy();
    }

    // Chart configuration
    let datasets: any[] = [];
    if (this.selectedReport === 'Issues Report' && issues) {
      const issueLabels = [...new Set(issues)];  // Get unique issue types
      issueLabels.forEach(issue => {
        const issueValues = values.filter((_, index) => issues[index] === issue);
        datasets.push({
          label: issue,
          data: issueValues,
          backgroundColor: this.getRandomColor(),
          borderColor: '#000',
          borderWidth: 1
        });
      });
    } else if (this.selectedReport === 'Recycling Rates' && recyclables) {
      const recyclableLabels = [...new Set(recyclables)];  // Get unique recyclable types
      recyclableLabels.forEach(material => {
        const materialValues = values.filter((_, index) => recyclables[index] === material);
        datasets.push({
          label: material,
          data: materialValues,
          backgroundColor: this.getRandomColor(),
          borderColor: '#000',
          borderWidth: 1
        });
      });
    } else {
      // Default case for Pickup Statistics
      datasets.push({
        label: 'Total Pickups',
        data: values,
        backgroundColor: '#FF5733',
        borderColor: '#C70039',
        borderWidth: 1
      });
    }

    // Create the chart
    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: datasets
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  // Utility function to generate random colors for the chart
  private getRandomColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
}

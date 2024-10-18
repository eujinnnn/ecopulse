import { Component, ViewChild, ElementRef } from '@angular/core';
import { Chart, registerables } from 'chart.js';

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
    'Issues Reported',
    'Recycling Rates'
  ];

  @ViewChild('reportChart') reportChart!: ElementRef;

  onReportChange(event: Event): void {
    const inputElement = event.target as HTMLSelectElement;
    this.selectedReport = inputElement.value;
  }

  generateReport(): void {
    if (!this.startDate || !this.endDate) {
      this.reportMessage = 'Please specify both start and end dates.';
      return;
    }

    if (!this.selectedReport) {
      this.reportMessage = 'Please select a report type.';
      return;
    }

    if (this.chart) {
      this.chart.destroy();
    }

    this.reportMessage = `Generating ${this.selectedReport} from ${this.startDate} to ${this.endDate}.`;
    const data = this.getReportData(this.selectedReport);

    this.createChart(data.labels, data.values);
  }

  private getReportData(reportType: string) {
    if (reportType === 'Pickup Statistics') {
      return {
        labels: ['Household', 'Recyclable', 'Hazardous'],
        values: [30, 45, 15]
      };
    } else if (reportType === 'Issues Reported') {
      return {
        labels: ['Bulky Waste', 'Missed Pickup', 'Illegal Dumping'],
        values: [5, 10, 3]
      };
    } else if (reportType === 'Recycling Rates') {
      return {
        labels: ['Plastic', 'Paper', 'Metal'],
        values: [50, 30, 20]
      };
    }
    return { labels: [], values: [] };
  }

  private createChart(labels: string[], values: number[]) {
    const ctx = this.reportChart.nativeElement.getContext('2d');
    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: this.selectedReport,
          data: values,
          backgroundColor: '#2ecc71',
        }]
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
}

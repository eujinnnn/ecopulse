import { Component, OnInit } from '@angular/core';
import { Chart } from 'chart.js';

interface Pickup {
    date: string;
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
    pickups: Pickup[] = [
        { date: '2024-10-10', time: '08:00 AM', type: 'Household', details: '-' },
        { date: '2024-10-15', time: '09:30 AM', type: 'Recyclable', details: 'Plastic.' },
        { date: '2024-10-8', time: '11:15 AM', type: 'Recyclable', details: 'Paper.' },
        { date: '2024-10-2', time: '01:00 PM', type: 'Recyclable', details: 'Aluminium.' },
        { date: '2024-10-11', time: '10:45 AM', type: 'Hazardous', details: '-' },
    ];
    
    filteredPickups: Pickup[] = [];
    wasteTypes: string[] = ['Household', 'Recyclable', 'Hazardous'];
    startDate: string = '';
    endDate: string = '';
    selectedWasteType: string = '';

    ngOnInit() {
        this.filteredPickups = this.pickups;
        this.createChart();
    }

    filterHistory() {
        this.filteredPickups = this.pickups.filter(pickup => {
            const date = new Date(pickup.date);
            const start = this.startDate ? new Date(this.startDate) : new Date(0);
            const end = this.endDate ? new Date(this.endDate) : new Date();
            const matchesDate = date >= start && date <= end;
            const matchesType = this.selectedWasteType ? pickup.type === this.selectedWasteType : true;

            return matchesDate && matchesType;
        });

        this.updateChart();
    }

    createChart() {
        const ctx = document.getElementById('pickupChart') as HTMLCanvasElement;
        const data = this.getChartData();

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Pickups by Type',
                    data: data.values,
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

    updateChart() {
        const ctx = document.getElementById('pickupChart') as HTMLCanvasElement;
        const data = this.getChartData();

        const chartInstance = Chart.getChart(ctx);
        if (chartInstance) {
            chartInstance.data.labels = data.labels;
            chartInstance.data.datasets[0].data = data.values;
            chartInstance.update();
        }
    }

    private getChartData() {
        const labels = this.wasteTypes;
        const values = labels.map(type => this.filteredPickups.filter(pickup => pickup.type === type).length);
        return { labels, values };
    }
}

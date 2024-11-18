import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})

export class AboutComponent implements OnInit {
  translateX: number = 0;
  translateY: number = 0;
  maxTranslateX: number;
  maxTranslateY: number;

  monthNames: string[] = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  constructor(private router: Router) {
    this.maxTranslateX = window.innerHeight / 2;
    this.maxTranslateY = window.innerHeight / 2
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollPosition = window.scrollY;
    
    if (scrollPosition * -2.3 > -this.maxTranslateX) {
      this.translateX = scrollPosition * -2.3;
      this.translateY = scrollPosition * 0.7;
    } else {
      this.translateX = -this.maxTranslateX;
    }
  }

  hours: string = '';
  minutes: string = '';
  seconds: string = '';
  day: string = '';
  month: string = '';
  year: string = '';
  
  previousHours: string = '';
  previousMinutes: string = '';
  previousSeconds: string = '';

  ngOnInit(): void {
    this.updateClock();
    setInterval(() => this.updateClock(), 1000);
  }

  updateClock() {
    const now = new Date();

    const hours = this.formatTime(now.getHours());
    const minutes = this.formatTime(now.getMinutes());
    const seconds = this.formatTime(now.getSeconds());

    this.day = this.formatTime(now.getDate());

    this.month = this.monthNames[now.getMonth()];
    
    this.year = now.getFullYear().toString();

    this.previousHours = this.hours;
    this.previousMinutes = this.minutes;
    this.previousSeconds = this.seconds;

    this.hours = hours;
    this.minutes = minutes;
    this.seconds = seconds;
  }

  formatTime(time: number): string {
    return time < 10 ? `0${time}` : time.toString();
  }

  navigateToSchedule() {
    this.router.navigate(['/schedule']);
  }

  navigateToIssue() {
    this.router.navigate(['/report']);
  }

  navigateToGenerate() {
    this.router.navigate(['/generate']);
  }
}

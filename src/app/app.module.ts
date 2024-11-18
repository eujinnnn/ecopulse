import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { NavbarComponent } from './components/navbar/navbar.component';
import { AboutComponent } from './components/about/about.component';
import { AreasComponent } from './components/areas/areas.component';
import { FooterComponent } from './components/footer/footer.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SigninComponent } from './signin/signin.component';
import { HomeComponent } from './homepage/homepage.component';
import { AdminComponent } from './adminprofile/admin.component';
import { UserComponent } from './userprofile/user.component';
import { ScheduleComponent } from './schedule/schedule.component';
import { PickComponent } from './pickuphistory/pick.component';
import { ReportComponent } from './reportissue/report.component';
import { GenerateComponent } from './generatereport/generate.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { notificationComponent } from './userprofile/notification.component';
import { editprofileComponent } from './userprofile/editprofile.component';
import { AuthService } from './service/auth.service';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'sign', component: SigninComponent },
  { path: 'admin/:community', component: AdminComponent },
  { path: 'user/:id', component: UserComponent },
  { path: 'user/editprofile/:id', component: editprofileComponent },
  { path: 'user/notification/:id', component: notificationComponent },
  { path: 'schedule/:id', component: ScheduleComponent },
  { path: 'pickup/:id', component: PickComponent },
  { path: 'generate/:id', component: GenerateComponent },
  { path: 'report/:id', component: ReportComponent },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    SigninComponent,
    AdminComponent,
    UserComponent,
    editprofileComponent,
    notificationComponent,
    ScheduleComponent,
    PickComponent,
    GenerateComponent,
    ReportComponent,
    NavbarComponent,
    AboutComponent,
    AreasComponent,
    FooterComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes),
    AppRoutingModule,
    FormsModule,
    HttpClientModule
  ],
  exports: [
    notificationComponent,
    SigninComponent,
    AdminComponent,
    UserComponent,
    editprofileComponent,
    notificationComponent,
    ScheduleComponent,
    PickComponent,
    GenerateComponent,
    ReportComponent
  ],
  providers: [
    provideAnimationsAsync(),
    AuthService,
    DatePipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

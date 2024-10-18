import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { NavbarComponent } from './components/navbar/navbar.component';
import { AboutComponent } from './components/about/about.component';
import { AreasComponent } from './components/areas/areas.component';
import { FooterComponent } from './components/footer/footer.component';
import { FormsModule } from '@angular/forms';

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

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'sign', component: SigninComponent},
  { path: 'admin', component: AdminComponent },
  { path: 'user', component: UserComponent },
  { path: 'user/editprofile', component: editprofileComponent },
  { path: 'user/notification', component: notificationComponent },
  { path: 'schedule', component: ScheduleComponent },
  { path: 'pickup', component: PickComponent },
  { path: 'generate', component: GenerateComponent },
  { path: 'report', component: ReportComponent }
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
    FormsModule
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
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

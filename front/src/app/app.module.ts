import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { RouterModule } from "@angular/router";

import { AppRoutingModule } from "./app.routing";
import { ComponentsModule } from "./components/components.module";

import { AppComponent } from "./app.component";

import { DashboardComponent } from "./dashboard/dashboard.component";
import { UserProfileComponent } from "./user-profile/user-profile.component";
import { TableListComponent } from "./table-list/table-list.component";
import { TypographyComponent } from "./typography/typography.component";
import { IconsComponent } from "./icons/icons.component";
import { NotificationsComponent } from "./notifications/notifications.component";
import { UpgradeComponent } from "./upgrade/upgrade.component";
import { AgmCoreModule } from "@agm/core";
import { AdminLayoutComponent } from "./layouts/admin-layout/admin-layout.component";
import { CreateAlertComponent } from "./create-alert/create-alert.component";
import { FeedComponent } from "./feed/feed.component";
import {
  HashLocationStrategy,
  LocationStrategy,
  PathLocationStrategy,
} from "@angular/common";
import { AdminLayoutModule } from "./layouts/admin-layout/admin-layout.module";
import { DeleteDialogComponent } from "./delete-dialog/delete-dialog.component";
import { JobsComponent } from "./jobs/jobs.component";
import { SiteDeReferenceComponent } from "./site-de-reference/site-de-reference.component";
import { ToastComponent } from "./toast/toast.component";

import { ToastrModule } from "ngx-toastr";
import { AddSiteDialogComponent } from "./add-site-dialog/add-site-dialog.component";
import { SiteDetailDialogComponent } from "./site-detail-dialog/site-detail-dialog.component";

import { MatDialogModule } from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatIconModule } from "@angular/material/icon";
import { MatSelectModule } from "@angular/material/select";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { AddSiteManuelComponent } from "./add-site-manuel/add-site-manuel.component";
import { MatRadioModule } from "@angular/material/radio";

const MaterialModules = [
  MatDialogModule,
  MatButtonModule,
  MatFormFieldModule,
  MatInputModule,
  MatIconModule,
  MatSelectModule,
  MatCheckboxModule,
  MatRadioModule,
];
@NgModule({
  imports: [
    MaterialModules,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    ComponentsModule,
    RouterModule,
    AppRoutingModule,
    ToastrModule.forRoot({
      timeOut: 1500,
      progressBar: true,
      progressAnimation: "increasing",
      preventDuplicates: true,
      resetTimeoutOnDuplicate: true,
      maxOpened: 1,
    }),

    AgmCoreModule.forRoot({
      apiKey: "YOUR_GOOGLE_MAPS_API_KEY",
    }),
  ],
  declarations: [
    AppComponent,
    AdminLayoutComponent,
    DeleteDialogComponent,
    JobsComponent,
    SiteDeReferenceComponent,
    ToastComponent,
    AddSiteDialogComponent,
    SiteDetailDialogComponent,
    AddSiteManuelComponent,
  ],
  //PathLocationStrategy : to get rid of the # in the link : /#/path  -> /path
  providers: [{ provide: LocationStrategy, useClass: PathLocationStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule {}

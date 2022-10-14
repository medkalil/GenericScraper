import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import {
  CommonModule,
  LocationStrategy,
  PathLocationStrategy,
} from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AdminLayoutRoutes } from "./admin-layout.routing";
import { DashboardComponent } from "../../dashboard/dashboard.component";
import { UserProfileComponent } from "../../user-profile/user-profile.component";
import { TableListComponent } from "../../table-list/table-list.component";
import { TypographyComponent } from "../../typography/typography.component";
import { IconsComponent } from "../../icons/icons.component";
import { NotificationsComponent } from "../../notifications/notifications.component";
import { UpgradeComponent } from "../../upgrade/upgrade.component";
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from "@angular/material/input";
import { MatRippleModule } from "@angular/material/core";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatSelectModule } from "@angular/material/select";
import { CreateAlertComponent } from "app/create-alert/create-alert.component";
import { FeedComponent } from "app/feed/feed.component";
import { HttpClientModule } from "@angular/common/http";
import { DataTableComponent } from "app/data-table/data-table.component";
import { MatChipsModule } from "@angular/material/chips";
import { MatIconModule } from "@angular/material/icon";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatDialogModule } from "@angular/material/dialog";
import { OpportuniteComponent } from "../../opportunite/opportunite.component";
import { RechercheDataDisplayComponent } from "app/recherche-data-display/recherche-data-display.component";
import { Dashboardv2Component } from "app/dashboardv2/dashboardv2.component";

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AdminLayoutRoutes),
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatRippleModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    HttpClientModule,
    MatChipsModule,
    MatIconModule,
    MatAutocompleteModule,
    MatDialogModule,
  ],
  declarations: [
    CreateAlertComponent,
    FeedComponent,
    DashboardComponent,
    UserProfileComponent,
    TableListComponent,
    TypographyComponent,
    IconsComponent,
    NotificationsComponent,
    UpgradeComponent,
    DataTableComponent,
    OpportuniteComponent,
    RechercheDataDisplayComponent,
    Dashboardv2Component,
  ],
  providers: [],
  exports: [FeedComponent, MatFormFieldModule, OpportuniteComponent],
})
export class AdminLayoutModule {}

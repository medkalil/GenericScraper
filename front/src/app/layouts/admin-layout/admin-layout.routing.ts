import { Routes } from "@angular/router";

import { DashboardComponent } from "../../dashboard/dashboard.component";
import { UserProfileComponent } from "../../user-profile/user-profile.component";
import { TableListComponent } from "../../table-list/table-list.component";
import { TypographyComponent } from "../../typography/typography.component";
import { IconsComponent } from "../../icons/icons.component";
import { NotificationsComponent } from "../../notifications/notifications.component";
import { UpgradeComponent } from "../../upgrade/upgrade.component";
import { CreateAlertComponent } from "app/create-alert/create-alert.component";
import { FeedComponent } from "app/feed/feed.component";
import { JobsComponent } from "app/jobs/jobs.component";
import { OpportuniteComponent } from "app/opportunite/opportunite.component";
import { SiteDeReferenceComponent } from "app/site-de-reference/site-de-reference.component";
import { Dashboardv2Component } from "app/dashboardv2/dashboardv2.component";
import { SignInComponent } from "app/sign-in/sign-in.component";
import { AuthGuard } from "app/services/auth.guard";
import { SignUpComponent } from "app/sign-up/sign-up.component";

export const AdminLayoutRoutes: Routes = [
  {
    path: "create-alert",
    component: CreateAlertComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "Sites-de-References",
    component: SiteDeReferenceComponent,
    canActivate: [AuthGuard],
  },
  { path: "feed", component: FeedComponent, canActivate: [AuthGuard] },
  { path: "dashboard", component: DashboardComponent },
  {
    path: "dashboardv2",
    component: Dashboardv2Component,
    canActivate: [AuthGuard],
  },
  {
    path: "user-profile",
    component: UserProfileComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "table-list",
    component: TableListComponent,
    canActivate: [AuthGuard],
  },

  { path: "jobs", component: JobsComponent, canActivate: [AuthGuard] },
  /* { path: "typography", component: TypographyComponent }, */

  { path: "icons", component: IconsComponent, canActivate: [AuthGuard] },

  {
    path: "notifications",
    component: NotificationsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "opportunites",
    component: OpportuniteComponent,
    canActivate: [AuthGuard],
  },
  { path: "upgrade", component: UpgradeComponent, canActivate: [AuthGuard] },
  { path: "sign-in", component: SignInComponent },
  { path: "sign-up", component: SignUpComponent },
];

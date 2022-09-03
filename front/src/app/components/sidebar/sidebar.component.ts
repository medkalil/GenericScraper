import { Component, OnInit } from "@angular/core";

declare const $: any;
declare interface RouteInfo {
  path: string;
  title: string;
  icon: string;
  class: string;
}
export const ROUTES: RouteInfo[] = [
  { path: "/create-alert", title: "Create-alert", icon: "add_box", class: "" },
  { path: "/feed", title: "Feed", icon: "assistant", class: "" },
  {
    path: "/table-list",
    title: "Les opportunités",
    icon: "content_paste",
    class: "",
  },
  { path: "/jobs", title: "Jobs", icon: "library_books", class: "" },
  { path: "/dashboard", title: "Dashboard", icon: "dashboard", class: "" },
  { path: "/user-profile", title: "User Profile", icon: "person", class: "" },

  /* {
    path: "/typography",
    title: "typography",
    icon: "library_books",
    class: "",
  } */ /* { path: "/icons", title: "Icons", icon: "bubble_chart", class: "" },
  { path: "/maps", title: "Maps", icon: "location_on", class: "" }, */
  {
    path: "/notifications",
    title: "Notifications",
    icon: "notifications",
    class: "",
  },
  {
    path: "/upgrade",
    title: "Upgrade to PRO",
    icon: "unarchive",
    class: "active-pro",
  },
];

@Component({
  selector: "app-sidebar",
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.css"],
})
export class SidebarComponent implements OnInit {
  menuItems: any[];

  constructor() {}

  ngOnInit() {
    this.menuItems = ROUTES.filter((menuItem) => menuItem);
  }
  isMobileMenu() {
    if ($(window).width() > 991) {
      return false;
    }
    return true;
  }
}

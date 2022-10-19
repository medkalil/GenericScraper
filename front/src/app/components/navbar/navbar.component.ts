import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  AfterViewInit,
} from "@angular/core";
import { ROUTES } from "../sidebar/sidebar.component";
import {
  Location,
  LocationStrategy,
  PathLocationStrategy,
} from "@angular/common";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { FormControl, FormGroup } from "@angular/forms";
import { QueryDbService } from "app/services/query-db.service";
import { HttpParams } from "@angular/common/http";
import { User } from "app/user-profile/user-profile.component";
import { SignStatusService } from "app/services/sign-status.service";

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.css"],
})
export class NavbarComponent implements OnInit, AfterViewInit {
  private listTitles: any[];
  location: Location;
  mobile_menu_visible: any = 0;
  private toggleButton: any;
  private sidebarVisible: boolean;
  isSearch = true;
  nomberOfNotification: any = 0;
  user: User;
  signStatus: string;

  searchForm = new FormGroup({
    searchValue: new FormControl(""),
  });

  constructor(
    location: Location,
    private element: ElementRef,
    private router: Router,
    private route: ActivatedRoute,
    private queryDbService: QueryDbService,
    private signStatusService: SignStatusService
  ) {
    this.location = location;
    this.sidebarVisible = false;
    router.events.subscribe((event: NavigationEnd) => {
      console.log("current route: ", this.router.url.toString());
      var currRoot = this.router.url.toString();
      if (currRoot.includes("opportunites")) {
        this.isSearch = false;
      } else {
        this.isSearch = true;
      }
    });
  }

  //1 - no user in localstorage : sign in click -> navigate to Sing In
  //2 - if user existe : sign out click -> remove user fromlocal storage + update status service : this.signStatusService.updateSingStatus("Sign In");
  signInOutHandler() {
    let user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      this.router.navigate(["sign-in"]);
    } else {
      localStorage.removeItem("user");
      this.signStatusService.updateSingStatus("Sign In");
      this.router.navigate(["dashboard"]);
    }
  }

  ngAfterViewInit() {}
  ngOnInit() {
    this.listTitles = ROUTES.filter((listTitle) => listTitle);
    const navbar: HTMLElement = this.element.nativeElement;
    this.toggleButton = navbar.getElementsByClassName("navbar-toggler")[0];
    this.router.events.subscribe((event) => {
      this.sidebarClose();
      var $layer: any = document.getElementsByClassName("close-layer")[0];
      if ($layer) {
        $layer.remove();
        this.mobile_menu_visible = 0;
      }
    });

    this.queryDbService.currentData.subscribe((res) => {
      this.nomberOfNotification = res.length;
    });

    //this.user = JSON.parse(localStorage.getItem("user"));
    this.signStatusService.currentSignSattus.subscribe((res) => {
      this.signStatus = res;
    });
  }

  onDashboard() {
    this.router.navigateByUrl("/dashboard");
  }

  sidebarOpen() {
    const toggleButton = this.toggleButton;
    const body = document.getElementsByTagName("body")[0];
    setTimeout(function () {
      toggleButton.classList.add("toggled");
    }, 500);

    body.classList.add("nav-open");

    this.sidebarVisible = true;
  }
  sidebarClose() {
    const body = document.getElementsByTagName("body")[0];
    this.toggleButton.classList.remove("toggled");
    this.sidebarVisible = false;
    body.classList.remove("nav-open");
  }
  sidebarToggle() {
    // const toggleButton = this.toggleButton;
    // const body = document.getElementsByTagName('body')[0];
    var $toggle = document.getElementsByClassName("navbar-toggler")[0];

    if (this.sidebarVisible === false) {
      this.sidebarOpen();
    } else {
      this.sidebarClose();
    }
    const body = document.getElementsByTagName("body")[0];

    if (this.mobile_menu_visible == 1) {
      // $('html').removeClass('nav-open');
      body.classList.remove("nav-open");
      if ($layer) {
        $layer.remove();
      }
      setTimeout(function () {
        $toggle.classList.remove("toggled");
      }, 400);

      this.mobile_menu_visible = 0;
    } else {
      setTimeout(function () {
        $toggle.classList.add("toggled");
      }, 430);

      var $layer = document.createElement("div");
      $layer.setAttribute("class", "close-layer");

      if (body.querySelectorAll(".main-panel")) {
        document.getElementsByClassName("main-panel")[0].appendChild($layer);
      } else if (body.classList.contains("off-canvas-sidebar")) {
        document
          .getElementsByClassName("wrapper-full-page")[0]
          .appendChild($layer);
      }

      setTimeout(function () {
        $layer.classList.add("visible");
      }, 100);

      $layer.onclick = function () {
        //asign a function
        body.classList.remove("nav-open");
        this.mobile_menu_visible = 0;
        $layer.classList.remove("visible");
        setTimeout(function () {
          $layer.remove();
          $toggle.classList.remove("toggled");
        }, 400);
      }.bind(this);

      body.classList.add("nav-open");
      this.mobile_menu_visible = 1;
    }
  }

  getTitle() {
    var titlee = this.location.prepareExternalUrl(this.location.path());
    if (titlee.charAt(0) === "#") {
      titlee = titlee.slice(1);
    }

    var currRoot = this.router.url.toString();
    if (currRoot.includes("opportunites")) {
      return "opportunites";
    }

    for (var item = 0; item < this.listTitles.length; item++) {
      if (this.listTitles[item].path === titlee) {
        return this.listTitles[item].title;
      }
    }
    return "Dashboard";
  }

  search() {
    if (this.searchForm.value["searchValue"]) {
      //this.queryDbService.setSearchMot(this.searchForm.value["searchValue"]);
      this.router.navigate(["/opportunites"], {
        queryParams: {
          q: this.searchForm.value["searchValue"],
        },
        queryParamsHandling: "merge",
      });
      this.searchForm.reset();
    }
  }
}

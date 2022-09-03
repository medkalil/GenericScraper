import { Component, Input, OnInit } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { DeleteDialogComponent } from "app/delete-dialog/delete-dialog.component";
import { NotificationsComponent } from "app/notifications/notifications.component";
import { QueryDbService } from "app/services/query-db.service";
import { interval } from "rxjs";
import { startWith, switchMap } from "rxjs/operators";

@Component({
  selector: "app-data-table",
  templateUrl: "./data-table.component.html",
  styleUrls: ["./data-table.component.scss"],
})
export class DataTableComponent implements OnInit {
  @Input() rootProperty: any;

  data: any;
  keys: any[];
  noUrlBtn = true;
  pollingData: any;
  search_mot_param: any;
  isWaiting = true;

  constructor(
    private queryDbService: QueryDbService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router
  ) {
    router.events.subscribe((event: NavigationEnd) => {
      var currRoot = decodeURIComponent(this.router.url.toString());
      if (currRoot.includes("/opportunites?q=")) {
        this.search_mot_param = currRoot
          .replace("/opportunites?q=", "")
          .trim()
          .toLowerCase();
        this.search_mot_param = decodeURIComponent(this.search_mot_param);
        console.log(" From rootProperty", this.rootProperty);
        console.log("res From Data Table", this.search_mot_param);
        this.formSearch.controls.search_mot.setValue(this.search_mot_param);
      }
    });
  }

  formSearch = new FormGroup({
    search_mot: new FormControl(""),
  });

  ngOnInit(): void {
    this.queryDbService.get_root_data(this.rootProperty).subscribe((res) => {
      this.data = res;
      this.keys = Object.keys(res[0]);
      this.isWaiting = false;
      this.itemHaveUrl(this.data);
    });
    console.log("rootProperty :", this.rootProperty);
    console.log("data :", this.data);

    this.formSearch.get("search_mot").valueChanges.subscribe((res) => {
      console.log("the VV", res.toLowerCase());
      console.log("the VM", this.search_mot_param);
      //this.search_mot_param = res;
      this.queryDbService
        .get_search_data(this.rootProperty, res.toLowerCase())
        .subscribe((res) => {
          this.data = res;
        });
    });

    /* this.search_mot_param = this.route.snapshot.queryParams.q;
    console.log("the search_mot_param is INIT", this.search_mot_param); */

    /* this.pollingData = interval(10000)
      .pipe(
        startWith(0),
        switchMap(() => this.queryDbService.get_search_data(this.rootProperty))
      )
      .subscribe((res) => {
        console.log(`ths res of ${this.rootProperty} is`, res);
        this.data = res;
      }); */
  }

  onClick() {
    console.log("here is data is", this.data);
    console.log("the root prop", this.rootProperty);
    console.log("1st obj", this.data[1]);
    //console.log("keys:", this.keys);
    console.log("keys:0000", Object.keys(this.data[1]));
  }

  deleteProject() {
    //this.queryDbService.delete_collection(this.rootProperty).subscribe();
    console.log("the root property", this.rootProperty);
    console.log("deleting project");
  }

  openDeleteDialog(): void {
    this.dialog.open(DeleteDialogComponent, {
      data: { root: this.rootProperty },
    });
  }

  navigateTo(item) {
    console.log("navigateTo ", item);
    if (item["url"]) {
      //console.log("url existe ");
      window.open(item["url"]);
    }
  }

  itemHaveUrl(data) {
    for (var val of data) {
      if (val["url"]) {
        this.noUrlBtn = false;
      } else {
        this.noUrlBtn = true;
      }
    }
  }

  deleteItem(item) {
    console.log("item:", item);
    this.queryDbService
      .delete_item(this.rootProperty, JSON.stringify(item))
      .subscribe((res) => {
        console.log("its OK");
      });
  }

  AddItem(item) {
    console.log("the added item", item);
    this.queryDbService.setData(item);
  }

  /* ngOnDestroy() {
    this.pollingData.unsubscribe();
  } */
}

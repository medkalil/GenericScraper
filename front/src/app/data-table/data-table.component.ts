import { Component, Input, OnInit } from "@angular/core";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { DeleteDialogComponent } from "app/delete-dialog/delete-dialog.component";
import { NotificationsComponent } from "app/notifications/notifications.component";
import { QueryDbService } from "app/services/query-db.service";

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

  constructor(
    private queryDbService: QueryDbService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.queryDbService.get_root_data(this.rootProperty).subscribe((res) => {
      this.data = res;
      this.keys = Object.keys(res[0]);
      this.itemHaveUrl(this.data);
    });

    console.log("rootProperty :", this.rootProperty);
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
}

import { Component, OnDestroy, OnInit } from "@angular/core";
import { QueryDbService } from "app/services/query-db.service";
import { Observable, Subscription } from "rxjs";
declare var $: any;
@Component({
  selector: "app-notifications",
  templateUrl: "./notifications.component.html",
  styleUrls: ["./notifications.component.css"],
})
export class NotificationsComponent implements OnInit, OnDestroy {
  opportuniteList: any[];
  //keys: any[];
  listOfListOfKeys: any[];
  noUrlBtn = true;
  sub: Subscription;

  constructor(private queryDbService: QueryDbService) {}
  showNotification(from, align) {
    const type = ["", "info", "success", "warning", "danger"];

    const color = Math.floor(Math.random() * 4 + 1);

    $.notify(
      {
        icon: "notifications",
        message:
          "Welcome to <b>Material Dashboard</b> - a beautiful freebie for every web developer.",
      },
      {
        type: type[color],
        timer: 4000,
        placement: {
          from: from,
          align: align,
        },
        template:
          '<div data-notify="container" class="col-xl-4 col-lg-4 col-11 col-sm-4 col-md-4 alert alert-{0} alert-with-icon" role="alert">' +
          '<button mat-button  type="button" aria-hidden="true" class="close mat-button" data-notify="dismiss">  <i class="material-icons">close</i></button>' +
          '<i class="material-icons" data-notify="icon">notifications</i> ' +
          '<span data-notify="title">{1}</span> ' +
          '<span data-notify="message">{2}</span>' +
          '<div class="progress" data-notify="progressbar">' +
          '<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
          "</div>" +
          '<a href="{3}" target="{4}" data-notify="url"></a>' +
          "</div>",
      }
    );
  }
  ngOnInit() {
    this.sub = this.queryDbService.currentData.subscribe((data) => {
      console.log("the data is", data);
      this.opportuniteList = data;
      //this.keys = Object.keys(data[0]);
      //console.log("the keys is", this.keys);
      this.listOfListOfKeys = this.getKeys(data);
      console.log("the listOfListOfKeys is", this.listOfListOfKeys);
      this.itemHaveUrl(this.opportuniteList);
    });
  }

  getKeys(listItems) {
    var res = [];
    for (let i = 0; i < listItems.length; i++) {
      res.push(Object.keys(listItems[i]));
    }
    return res;
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

  removeItem(item, idx) {
    console.log("item To Delete:", item);
    this.queryDbService.remove(item);
    this.opportuniteList = this.opportuniteList.filter((it) => it != item);
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}

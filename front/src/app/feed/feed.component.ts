import { Component, OnInit } from "@angular/core";
import { QueryDbService } from "app/services/query-db.service";
import "rxjs/Rx";
import { Observable } from "rxjs/Rx";

@Component({
  selector: "app-feed",
  templateUrl: "./feed.component.html",
  styleUrls: ["./feed.component.scss"],
})
export class FeedComponent implements OnInit {
  rootList: any[];
  currentRoot: any;
  data: any;
  keys: any[];
  mot_cles: any[];
  selected_mot_cle: string;
  isWaiting = false;
  noUrlBtn = true;
  dataSelectedLeght = 0;
  selectedIndex: number;

  constructor(private queryDbService: QueryDbService) {}

  ngOnInit(): void {
    this.queryDbService.get_root_list().subscribe((res) => {
      this.rootList = res;
    });
  }

  select(index: number) {
    this.selectedIndex = index;
  }

  getCurrentRoot(c) {
    this.currentRoot = c;
    console.log("currentRoot is here", this.currentRoot);
    this.isWaiting = true;
    this.noUrlBtn = true;

    this.queryDbService.get_root_data(this.currentRoot).subscribe((res) => {
      this.data = res;
      this.keys = Object.keys(res[0]);
      console.log("curre", this.data);
      console.log("keys", this.keys);
      this.isWaiting = false;
      this.itemHaveUrl(this.data);
      this.dataSelectedLeght = 5;
    });
    this.queryDbService.get_mot_cles(this.currentRoot).subscribe((res) => {
      this.mot_cles = res;
      console.log("mot_cles", this.mot_cles);
      this.mot_cles = Array.from(new Set(this.mot_cles));
    });
  }

  selecting_mot_cle() {
    let value = (<HTMLSelectElement>document.getElementById("select_mot_cle"))
      .value;
    console.log("value is:", value);
    this.isWaiting = true;
    this.noUrlBtn = true;
    console.log("is wiautinh", this.isWaiting);
    this.queryDbService
      .filter_resulat_by_mot_cle(this.currentRoot, value)
      .subscribe((res) => {
        this.data = res;
        this.keys = Object.keys(res[0]);
        this.isWaiting = false;
        console.log("data CHANGES", this.data);
        this.itemHaveUrl(this.data);
        this.dataSelectedLeght = res.length;
        console.log("dataSelectedLeght:", this.dataSelectedLeght);
      });

    console.log("data CHANGES");
  }

  clickMe(item) {
    console.log("clickMe ", item);
    if (item["url"]) {
      console.log("url existe ");
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
}

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

  constructor(private queryDbService: QueryDbService) {}

  ngOnInit(): void {
    this.queryDbService.get_root_list().subscribe((res) => {
      this.rootList = res;
    });
  }

  getFilter() {
    console.log("1st row", this.data[0]);
    this.queryDbService
      .filter_resulat_by_mot_cle(this.currentRoot, this.mot_cles, this.data[0])
      .subscribe((res) => {
        this.data = res;
      });
  }

  getCurrentRoot(c) {
    this.currentRoot = c;
    console.log("currentRoot is here", this.currentRoot);
    //data
    this.queryDbService.get_root_data(this.currentRoot).subscribe((res) => {
      this.data = res;
      this.keys = Object.keys(res[0]);
      console.log("curre", this.data);
      console.log("keys", this.keys);
    });
    this.queryDbService.get_mot_cles(this.currentRoot).subscribe((res) => {
      this.mot_cles = res;
      console.log("mot_cles", this.mot_cles);
    });
  }
}

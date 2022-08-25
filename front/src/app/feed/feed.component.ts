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

  constructor(private queryDbService: QueryDbService) {}

  ngOnInit(): void {
    this.queryDbService.get_root_list().subscribe((res) => {
      this.rootList = res;
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

  getFilter() {
    console.log("1st row", this.data[0]);
    console.log("1st type", typeof this.data[0]);
    console.log("this.mot_cles[0],", this.mot_cles[0]["mot_cle"]);

    this.queryDbService
      .filter_resulat_by_mot_cle(
        this.currentRoot,
        "fourniture"
        // JSON.stringify(this.data[0])
      )
      .subscribe((res) => {
        this.data = res;
      });
  }

  selecting_mot_cle() {
    let value = (<HTMLSelectElement>document.getElementById("select_mot_cle"))
      .value;
    console.log("value is:", value);

    this.queryDbService
      .filter_resulat_by_mot_cle(this.currentRoot, value)
      .subscribe((res) => {
        this.data = res;
      });
    console.log("data CHANGES");
  }
}

import { Component, Input, OnInit } from "@angular/core";
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

  constructor(private queryDbService: QueryDbService) {}

  ngOnInit(): void {
    this.queryDbService.get_root_data(this.rootProperty).subscribe((res) => {
      this.data = res;
      this.keys = Object.keys(res[0]);
    });
  }

  onClick() {
    console.log("here is data is", this.data);
    console.log("1st obj", this.data[1]);
    //console.log("keys:", this.keys);
    console.log("keys:0000", Object.keys(this.data[1]));
  }
}

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
}

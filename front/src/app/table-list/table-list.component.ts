import { Component, OnInit } from "@angular/core";
import { QueryDbService } from "app/services/query-db.service";
import { interval } from "rxjs";
import { startWith, switchMap } from "rxjs/operators";

@Component({
  selector: "app-table-list",
  templateUrl: "./table-list.component.html",
  styleUrls: ["./table-list.component.css"],
})
export class TableListComponent implements OnInit {
  rootList: any[];
  pollingData: any;

  constructor(private queryDbService: QueryDbService) {}

  ngOnInit() {
    this.pollingData = interval(5000)
      .pipe(
        startWith(0),
        switchMap(() => this.queryDbService.get_root_list())
      )
      .subscribe((res) => (this.rootList = res));
    /* this.queryDbService.get_root_list().subscribe((res) => {
      this.rootList = res;
    });
    console.log("hehe", this.rootList); */
  }

  ngOnDestroy() {
    this.pollingData.unsubscribe();
  }
}

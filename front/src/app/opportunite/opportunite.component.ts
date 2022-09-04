import { Component, OnInit } from "@angular/core";
import { QueryDbService } from "app/services/query-db.service";
import { interval } from "rxjs";
import { startWith, switchMap } from "rxjs/operators";

@Component({
  selector: "app-opportunite",
  templateUrl: "./opportunite.component.html",
  styleUrls: ["./opportunite.component.scss"],
})
export class OpportuniteComponent implements OnInit {
  rootList: any[];
  pollingData: any;

  constructor(private queryDbService: QueryDbService) {}

  ngOnInit() {
    this.pollingData = interval(10000)
      .pipe(
        startWith(0),
        switchMap(() => this.queryDbService.get_root_list())
      )
      .subscribe((res) => (this.rootList = res));
  }

  ngOnDestroy() {
    this.pollingData.unsubscribe();
  }
}

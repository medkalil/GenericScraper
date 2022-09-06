import { Component, OnInit } from "@angular/core";
import { QueryDbService } from "app/services/query-db.service";

interface spider {}

@Component({
  selector: "app-jobs",
  templateUrl: "./jobs.component.html",
  styleUrls: ["./jobs.component.scss"],
})
export class JobsComponent implements OnInit {
  constructor(private queryDbService: QueryDbService) {}
  scraperStatus?: any;
  pending: any;
  running: any;
  finished: any;
  errMsg: string;

  ngOnInit(): void {
    this.initListJobs();
  }

  initListJobs() {
    this.queryDbService.get_list_jobs().subscribe(
      (res) => {
        this.scraperStatus = res;
        this.pending = this.scraperStatus["pending"];
        this.running = this.scraperStatus["running"];
        this.finished = this.scraperStatus["finished"];
        console.log("res is ", this.scraperStatus);
        console.log("pending is ", this.pending);
        console.log("running is ", this.running);
        console.log("finished is ", this.finished);
      },
      (errMsg) => {
        this.errMsg = <any>errMsg;
      }
    );
  }
}

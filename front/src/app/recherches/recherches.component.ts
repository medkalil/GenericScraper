import { Component, OnInit } from "@angular/core";
import { QueryDbService } from "app/services/query-db.service";
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from "@angular/animations";

export interface PeriodicElement {
  tables: string[];
  _id: string;
  date_execution: string;
  type: string;
  data: any[];
}

@Component({
  selector: "app-recherches",
  templateUrl: "./recherches.component.html",
  styleUrls: ["./recherches.component.scss"],
  animations: [
    trigger("detailExpand", [
      state("collapsed", style({ height: "0px", minHeight: "0" })),
      state("expanded", style({ height: "*" })),
      transition(
        "expanded <=> collapsed",
        animate("225ms cubic-bezier(0.4, 0.0, 0.2, 1)")
      ),
    ]),
  ],
})
export class RecherchesComponent implements OnInit {
  recherches: any[] = [];
  dataSource: any[];

  columnsToDisplay = ["_id", "tables", "date_execution", "type"];
  expandedElement: PeriodicElement | null;

  constructor(private queryDbService: QueryDbService) {}

  ngOnInit(): void {
    this.getRecherches();
  }

  getRecherches() {
    this.queryDbService.getRecherches().subscribe((res) => {
      this.formatId(res);
      this.formatType(res);
      this.recherches = res;
      this.dataSource = this.recherches;

      console.log("recherches :", this.recherches);
    });
  }
  formatId(res) {
    return res.map((v: PeriodicElement) => (v._id = v._id["$oid"]));
  }

  formatType(res) {
    //  0: recherche rapide
    //  1: recherche par cron
    return res.map((v: PeriodicElement) =>
      Number(v.type) == 0
        ? (v.type = "Recherche Rapide")
        : (v.type = "Recherche par Cron")
    );
  }
}

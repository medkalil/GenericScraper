import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-recherche-data-tables",
  templateUrl: "./recherche-data-tables.component.html",
  styleUrls: ["./recherche-data-tables.component.scss"],
})
export class RechercheDataTablesComponent implements OnInit {
  @Input() tables: string[];
  @Input() _id: string;
  @Input() date_execution: string;
  @Input() type: string;
  @Input() data: any[];

  listOfKeys: any[] = [];

  constructor() {}

  ngOnInit(): void {
    this.getKeys(this.data);
  }

  getKeys(data) {
    for (let i = 0; i < data.length; i++) {
      const tempItem = data[i][0] ? data[i][0] : 0;
      this.listOfKeys[i] = Object.keys(tempItem);
    }
  }

  clickMe(item) {
    if (item["url"]) {
      window.open(item["url"]);
    }
  }
}

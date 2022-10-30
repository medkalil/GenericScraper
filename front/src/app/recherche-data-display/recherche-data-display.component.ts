import {
  Component,
  Input,
  OnInit,
  ChangeDetectionStrategy,
  OnChanges,
  SimpleChanges,
} from "@angular/core";

@Component({
  selector: "app-recherche-data-display",
  templateUrl: "./recherche-data-display.component.html",
  styleUrls: ["./recherche-data-display.component.scss"],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class RechercheDataDisplayComponent implements OnInit, OnChanges {
  @Input() root: string;
  @Input() dataList: any[];
  @Input() idx: number;

  keys: any[];
  localDataList: any[];
  localKeys: any[];
  tempList: any[] = [];
  data: any[] = [];
  temp: any = {};
  roots: any[];
  listOfKeys: any[];

  constructor() {}
  ngOnChanges(changes: SimpleChanges): void {
    console.log("changes here");
    this.localDataList = [];
    this.localKeys = [];

    this.keys = Object.keys(this.dataList[0]);
    this.localKeys = this.keys;
    this.localDataList = this.dataList;
  }

  ngOnInit(): void {
    console.log("inside OnInit display");
    this.roots = JSON.parse(localStorage.getItem("roots"));
    this.data = JSON.parse(localStorage.getItem("data"));
    this.listOfKeys = this.getKeys(this.data);

    console.log("from display roots", this.roots);
    console.log("from display data", this.data);
    console.log("from display keys", this.listOfKeys);
  }

  scrolling_right() {
    var right = document.querySelector(".scol-container");
    right.scrollBy(350, 0);
    console.log("is right");
  }
  scrolling_left() {
    var right = document.querySelector(".scol-container");
    right.scrollBy(-350, 0);
    console.log("is left");
  }
  clickMe(item) {
    console.log("clickMe ", item);
    if (item["url"]) {
      console.log("url existe ");
      window.open(item["url"]);
    }
  }
  getKeys(listItems) {
    var res = [];
    for (let i = 0; i < listItems.length; i++) {
      if (listItems[i] != 0) {
        res.push(Object.keys(listItems[i][0]));
      } else {
        res.push(0);
      }
    }
    return res;
  }
}

/*   rootExiste() {
    var data = JSON.parse(localStorage.getItem("data"));
    if (data.length == 0 || !this.isRootHere(this.root, data)) {
      return false;
    }
    return true;
  }

  isRootHere(root, newdata) {
    for (let v of newdata) {
      if (v.key == root) {
        return true;
      }
    }
    return false;
  }

  getRootFromData(root, newdata) {
    for (let v of newdata) {
      if (v.key == root) {
        return v;
      }
    }
    //return false;
  } */

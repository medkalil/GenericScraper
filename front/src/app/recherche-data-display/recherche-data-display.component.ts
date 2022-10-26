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

  keys: any[];
  localDataList: any[];
  localKeys: any[];

  constructor() {}
  ngOnChanges(changes: SimpleChanges): void {
    this.localDataList = [];
    this.localKeys = [];
    //if roots in localStorage changes => empty all localStorage

    console.log("log the changes", changes);

    console.log("INSIDE ngOnChanges");
    this.keys = Object.keys(this.dataList[0]);
    console.log("the keys is:", this.keys);
    localStorage.setItem("keys", JSON.stringify(this.keys));
    this.localKeys = this.keys;
    localStorage.setItem("dataList", JSON.stringify(this.dataList));
    this.localDataList = this.dataList;
  }

  ngOnInit(): void {
    console.log("inside OnInit");

    this.localDataList = JSON.parse(localStorage.getItem("dataList"));
    this.localKeys = JSON.parse(localStorage.getItem("keys"));
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
}

// bug to fix : after session end : on displaing data :
//    - for every site passed with @Input we save the data in localstorage with the same key "dataList"
//    - de que on lance la recherche : in ngOnChanges: for every site :   this.localDataList = this.dataList   --> No Bug
//    - sow after session end: we get the data with onInit: we get the data of 1 root and displayet for all the roots --> Bug

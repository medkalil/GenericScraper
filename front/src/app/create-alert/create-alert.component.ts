import { Component, OnInit, OnDestroy } from "@angular/core";
import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { MatChipInputEvent } from "@angular/material/chips";
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { QueryDbService } from "app/services/query-db.service";
import { ToastrService } from "ngx-toastr";
import { interval, Observable } from "rxjs";
import { startWith, switchMap, takeUntil, tap } from "rxjs/operators";

export interface Fruit {
  name: string;
}
@Component({
  selector: "app-create-alert",
  templateUrl: "./create-alert.component.html",
  styleUrls: ["./create-alert.component.scss"],
})
export class CreateAlertComponent implements OnInit, OnDestroy {
  myForm!: FormGroup;
  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  motCleList: string[] = [];
  //isDisabledAdd: boolean = false;
  isDisabledRemove: boolean = true;
  options = ["Sam", "Varun", "Jasmine"];
  filteredOptions: any[];
  existingRoots: any[];
  isMaxRecherhe: boolean = false;
  urlExtractorCount: number = 0;
  isScraping: boolean = false;
  emptyForm = false;

  localRoots: any;
  localMotCles: any;
  oldData: any[] = [];
  newdata: any[] = [];
  subscription: any;

  tempList: any[] = [];
  data: any[] = [];
  tempObj: any = {};

  cronTimer: FormGroup;

  constructor(
    private fb: FormBuilder,
    private queryDbService: QueryDbService,
    private toastr: ToastrService
  ) {}

  motCleSelect = new FormControl("");

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    console.log("out roots list:", JSON.parse(localStorage.getItem("roots")));
    console.log("out data", this.newdata);
  }

  ngOnInit(): void {
    this.initcromTimerForm();
    this.initForm();
    this.getNames();
    this.queryDbService.get_root_list().subscribe((res) => {
      this.existingRoots = res;
    });
    console.log("localsorage roots", JSON.parse(localStorage.getItem("roots")));
    console.log(
      "localsorage mot_cles",
      JSON.parse(localStorage.getItem("mot_cles"))
    );
    this.localRoots = JSON.parse(localStorage.getItem("roots"));
    this.localMotCles = JSON.parse(localStorage.getItem("mot_cles"));
  }

  initcromTimerForm() {
    this.cronTimer = this.fb.group({
      hour: ["", Validators.required],
      minute: ["", Validators.required],
    });
  }

  initForm() {
    this.myForm = this.fb.group({
      urls: this.fb.array([this.fb.group({ url: "" })]),
    });
    this.myForm.get("url")?.valueChanges.subscribe((response) => {
      console.log("data is ", response);
      this.filterData(response);
    });
  }

  getNames() {
    this.queryDbService.get_root_list().subscribe((response) => {
      this.options = response;
      this.filteredOptions = response;
    });
  }

  filterData(response) {
    this.filteredOptions = this.options.filter((item) => {
      return item.toLowerCase().indexOf(response.toLowerCase()) > -1;
    });
  }

  get urls(): FormArray {
    return this.myForm.get("urls") as FormArray;
  }

  removeUrl(index: number) {
    this.urls.removeAt(index);
    if (this.myForm.value.urls.length < 2) {
      this.isDisabledRemove = true;
    }
  }

  addUrl() {
    this.urls.push(this.fb.group({ url: "" }));
    this.isDisabledRemove = false;
    console.log("the url list", this.myForm.value.urls);
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || "").trim();
    if (value) {
      this.motCleList.push(value);
    }
    // Clear the input value
    event.chipInput!.clear();
  }

  remove(str: string): void {
    const index = this.motCleList.indexOf(str);

    if (index >= 0) {
      this.motCleList.splice(index, 1);
    }
  }

  onRecherhe() {
    //clear old localstorage data but user
    localStorage.removeItem("roots");
    localStorage.removeItem("data");
    localStorage.removeItem("mot_cles");

    this.newdata = [];

    console.log("motCleList", this.motCleList);
    console.log(
      "roots",
      this.myForm.value["urls"].map((ele) => ele["url"])
    );
    var roots = this.myForm.value["urls"].map((ele) => ele["url"]);
    var mot_cle = this.motCleList;

    console.log("the roots typed:", roots);
    localStorage.setItem("roots", JSON.stringify(roots));
    this.localRoots = roots;
    localStorage.setItem("mot_cles", JSON.stringify(mot_cle));
    this.localMotCles = mot_cle;

    if (!this.checker(this.existingRoots, roots)) {
      this.toastr.error(
        "ajouter les sites avant de faire les recherches",
        "Error!"
      );
    } else {
      console.log("you can run a recherche");
      this.getOld_Data(roots);
      this.pollUntillCompleted(roots);

      //this.scrape(roots, mot_cle);
      this.isScraping = true;
      this.queryDbService.updateCurrentshowSearchingIcon(false);
    }
  }

  pollUntillCompleted(roots) {
    this.subscription = interval(10000)
      .pipe(
        tap((x) => console.log(x)),
        switchMap(() => this.getNewData(roots))
      )
      .subscribe();
  }

  //checkfinishedStatus : responsable for checking if the jobs are finished to hide the search icon in navBar
  getNewData(roots) {
    //2- get the new data
    for (let i = 0; i < roots.length; i++) {
      this.queryDbService.get_old_data(roots[i]).subscribe((res) => {
        console.log("new Data ", res);
        console.log("old DATA", this.getOldDataValues(this.oldData, roots[i]));

        let temp = this.getNewItems(
          res,
          this.getOldDataValues(this.oldData, roots[i])
        );

        console.log("the Root", roots[i]);
        console.log("is HERE  ENW DATA : new - old", temp);

        if (temp.length > 0) {
          this.newdata[i] = temp;
          this.isScraping = false;
        } else {
          this.newdata[i] = 0;
        }
        console.log("the New Data:", this.newdata);
        localStorage.setItem("data", JSON.stringify(this.newdata));
      });
    }
    this.checkfinishedStatus();
    return this.newdata;
  }

  checkfinishedStatus = () => {
    this.queryDbService.get_list_jobs().subscribe(
      (res) => {
        var temp = res;
        var pending = temp["pending"];
        var running = temp["running"];
        if (
          typeof pending !== "undefined" &&
          pending.length == 0 &&
          typeof running !== "undefined" &&
          running.length == 0
        ) {
          console.log("HAYAHAYAYAYAYAYAY");
          this.queryDbService.updateCurrentshowSearchingIcon(true);
          this.isScraping = false;
        }
      } /* ,
      (err) => {
        this.queryDbService.updateCurrentshowSearchingIcon(true);
      } */
    );
  };

  getNewItems = (newData, olddata) =>
    newData.filter(
      (item) =>
        !olddata.find((other) =>
          Object.keys(other).every((prop) => item[prop] == other[prop])
        )
    );

  getOldDataValues(li, root) {
    for (let v of li) {
      if (v.key == root) {
        return v.value;
      }
    }
  }

  rootExiste(root, newdata) {
    for (let v of newdata) {
      if (v.key == root) {
        return true;
      }
    }
    return false;
  }

  getOld_Data(roots) {
    for (let i = 0; i < roots.length; i++) {
      this.queryDbService.get_old_data(roots[i]).subscribe((res) => {
        this.oldData.push({
          key: roots[i],
          value: res,
        });
        console.log("old data", res);
      });
    }
    console.log("old data dict", this.oldData);
  }

  checker = (arr, target) => target.every((v) => arr.includes(v));

  scrape(roots, mot_cle_list) {
    for (let i = 0; i < roots.length; i++) {
      this.queryDbService
        .run_scraper(roots[i], mot_cle_list)
        .subscribe((res) => {
          console.log("SCRAper ARE RUNNING");
        });
    }
  }

  //return a list with objt of unique keys
  //if 2 objet have the same key return only 1
  tempListWithUniqueKeys(tempList) {
    return Array.from(new Set(tempList.map((v) => JSON.stringify(v)))).map(
      (v: any) => JSON.parse(v)
    );
  }

  onCreateCron() {
    console.log("ahzeazeazaz: onCreateCron");
    //clear old localstorage data but user
    localStorage.removeItem("roots");
    localStorage.removeItem("data");
    localStorage.removeItem("mot_cles");

    this.newdata = [];

    console.log("motCleList", this.motCleList);
    console.log(
      "roots",
      this.myForm.value["urls"].map((ele) => ele["url"])
    );
    var roots = this.myForm.value["urls"].map((ele) => ele["url"]);
    var mot_cle = this.motCleList;

    console.log("the roots typed:", roots);
    localStorage.setItem("roots", JSON.stringify(roots));
    this.localRoots = roots;
    localStorage.setItem("mot_cles", JSON.stringify(mot_cle));
    this.localMotCles = mot_cle;

    if (!this.checker(this.existingRoots, roots)) {
      this.toastr.error(
        "ajouter les sites avant de faire les recherches",
        "Error!"
      );
    } else {
      console.log("you can run a recherche");
      this.getOld_Data(roots);
      this.pollUntillCompleted(roots);

      console.log("timert", this.cronTimer.value);

      this.scrape_cron(roots, mot_cle);
      this.toastr.info(
        `Cron a été creer et va être lancer à ${this.cronTimer.value.hour} et ${this.cronTimer.value.minute} minute`,
        "Sucess!"
      );
    }
  }

  scrape_cron(roots: any, mot_cle: string[]) {
    for (let i = 0; i < roots.length; i++) {
      this.queryDbService
        .run_cron_scrape(
          roots[i],
          mot_cle,
          JSON.stringify(this.cronTimer.value)
        )
        .subscribe((res) => {
          console.log("res", res);
        });
    }
  }
}

/*   ismaxScraperRunning() {
    this.queryDbService.get_list_jobs().subscribe((res) => {
      console.log("inside ismaxScraperRunning", res);
      for (var val of res["pending"]) {
        if (val["spider"] == "url-extractor") {
          console.log("inside pending");
          this.urlExtractorCount++;
        }
      }
      for (var val of res["running"]) {
        if (val["spider"] == "url-extractor") {
          this.urlExtractorCount++;
          console.log("inside running");
        }
      }
    });
    console.log("THE this.urlExtractorCount", this.urlExtractorCount);
    if (this.urlExtractorCount > 1) {
      this.isMaxRecherhe = true;
      console.log("returning true");
      return true;
    }
    return false;
  } */

/* LocalStorage to list:
var names = [];
names[0] = prompt("New member name?");
localStorage.setItem("names", JSON.stringify(names));
//...
var storedNames = JSON.parse(localStorage.getItem("names")); 
----------------------------------------------------------------------------
 to dict:
localStorage.setItem("meta", JSON.stringify(meta));
var meta1 = JSON.parse(localStorage.getItem("meta"));
alert(meta1['foo']);
*/

/* 
var input = [{key:"key1", value:"value1"},{key:"key2", value:"value2"}];

var result = {};

for(var i = 0; i < input.length; i++)
{
    result[input[i].key] = input[i].value;
}

console.log(result); // Just for testing */

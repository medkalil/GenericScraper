import { Component, OnInit } from "@angular/core";
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

export interface Fruit {
  name: string;
}
@Component({
  selector: "app-create-alert",
  templateUrl: "./create-alert.component.html",
  styleUrls: ["./create-alert.component.scss"],
})
export class CreateAlertComponent implements OnInit {
  myForm!: FormGroup;
  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  motCleList: string[] = [];
  isDisabledAdd: boolean = false;
  isDisabledRemove: boolean = true;
  options = ["Sam", "Varun", "Jasmine"];
  filteredOptions: any[];
  existingRoots: any[];

  constructor(
    private fb: FormBuilder,
    private queryDbService: QueryDbService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.getNames();
    this.queryDbService.get_root_list().subscribe((res) => {
      this.existingRoots = res;
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
    if (this.myForm.value.urls.length == 2) {
      this.isDisabledRemove = true;
    }
    this.urls.removeAt(index);
    if (this.myForm.value.urls.length < 2) {
      this.isDisabledAdd = false;
    }
  }

  addUrl() {
    if (this.myForm.value.urls.length == 1) {
      this.isDisabledAdd = true;
    }
    this.urls.push(this.fb.group({ url: "" }));
    console.log("the url list", this.myForm.value.urls);
    if (this.myForm.value.urls.length >= 1) {
      this.isDisabledRemove = false;
    }
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
    console.log("motCleList", this.motCleList);
    console.log(
      "roots",
      this.myForm.value["urls"].map((ele) => ele["url"])
    );
    var roots = this.myForm.value["urls"].map((ele) => ele["url"]);
    var mot_cle = this.motCleList;

    this.scrape(roots, mot_cle);
  }

  scrape(roots, mot_cle_list) {
    //partition = i
    for (let i = 0; i < roots.length; i++) {
      if (this.existingRoots.some((x) => x === roots[i])) {
        this.queryDbService
          .run_existing_root(roots[i], mot_cle_list, i)
          .subscribe((res) => console.log("scrapers are running ..."));
      } else {
        //run scraper for new roots
        this.queryDbService
          .run_no_existing_root(roots[i], mot_cle_list, i)
          .subscribe((res) => console.log("scrapers are running ..."));
      }
    }
  }
}

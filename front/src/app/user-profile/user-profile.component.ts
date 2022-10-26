import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { QueryDbService } from "app/services/query-db.service";

export interface User {
  AboutMe: string;
  adress: string;
  city: string;
  codePoste: number;
  country: string;
  email: string;
  firstName: string;
  lastName: string;
  pass: string;
  role: string;
  username: string;
}

@Component({
  selector: "app-user-profile",
  templateUrl: "./user-profile.component.html",
  styleUrls: ["./user-profile.component.css"],
})
export class UserProfileComponent implements OnInit {
  profileForm: FormGroup;
  currUser: User = null;

  constructor(
    private fb: FormBuilder,
    private queryDbService: QueryDbService
  ) {}

  ngOnInit() {
    /* this.queryDbService.get_user("clubisty8").subscribe((res: User[]) => {
      console.log("hayhay", res[0]);
      this.currUser = res[0];
      this.createForm(res[0]);
    }); */

    this.currUser = JSON.parse(localStorage.getItem("user"));
    this.createForm(this.currUser);
  }

  createForm(user: User) {
    console.log("from createForm", user.role);

    //const urlPatttern = "(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?";
    this.profileForm = this.fb.group({
      role: [user.role, Validators.required],
      username: [user.username, Validators.required],
      email: [user.email, Validators.required],
      pass: [user.pass, Validators.required],
      firstName: [user.firstName, Validators.required],
      lastName: [user.lastName, Validators.required],
      adress: [user.adress, Validators.required],
      city: [user.city, Validators.required],
      country: [user.country, Validators.required],
      codePoste: [user.codePoste, Validators.required],
      AboutMe: [user.AboutMe, Validators.required],
    });
  }

  onSubmit(data: User) {
    console.log("data:", data);
    localStorage.setItem("user", JSON.stringify(data));
    this.queryDbService
      .update_profile(data.username, data)
      .subscribe((res: User) => {
        console.log("rs :", res);
        this.currUser = res[0];
      });
  }
}

/* 
var testObject = { 'one': 1, 'two': 2, 'three': 3 };

// Put the object into storage
localStorage.setItem('testObject', JSON.stringify(testObject));

// Retrieve the object from storage
var retrievedObject = JSON.parse(localStorage.getItem('testObject'));

 */

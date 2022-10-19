import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { QueryDbService } from "app/services/query-db.service";
import { SignStatusService } from "app/services/sign-status.service";
import { User } from "app/user-profile/user-profile.component";

@Component({
  selector: "app-sign-in",
  templateUrl: "./sign-in.component.html",
  styleUrls: ["./sign-in.component.scss"],
})
export class SignInComponent implements OnInit {
  error: any;
  form: FormGroup = new FormGroup({
    username: new FormControl("", Validators.required),
    password: new FormControl("", Validators.required),
  });

  constructor(
    private queryDbService: QueryDbService,
    private router: Router,
    private signStatusService: SignStatusService
  ) {}

  ngOnInit(): void {}

  submit() {
    if (this.form.valid) {
      this.error = null;
      this.queryDbService
        .authentification(JSON.stringify(this.form.value))
        .subscribe((res: User[]) => {
          console.log("res : ", res);
          if (res.length == 0) {
            this.error = "User n'exsite pas";
          } else {
            localStorage.setItem("user", JSON.stringify(res[0]));
            this.signStatusService.updateSingStatus("Sign Out");
            this.router.navigate(["user-profile"]);
          }
        });
    } else {
      this.error = "username ou mot de passe est vide";
    }
  }
}

/* 
var testObject = { 'one': 1, 'two': 2, 'three': 3 };

// Put the object into storage
localStorage.setItem('testObject', JSON.stringify(testObject));

// Retrieve the object from storage
var retrievedObject = JSON.parse(localStorage.getItem('testObject'));

 */

import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { QueryDbService } from "app/services/query-db.service";
import { SignStatusService } from "app/services/sign-status.service";
import { User } from "app/user-profile/user-profile.component";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-sign-up",
  templateUrl: "./sign-up.component.html",
  styleUrls: ["./sign-up.component.scss"],
})
export class SignUpComponent implements OnInit {
  error: any;
  user: User;

  form: FormGroup = new FormGroup({
    username: new FormControl("", Validators.required),
    pass: new FormControl("", Validators.required),
    role: new FormControl("", Validators.required),
  });

  constructor(
    private queryDbService: QueryDbService,
    private router: Router,
    private signStatusService: SignStatusService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {}

  submit() {
    if (this.form.valid) {
      this.error = null;
      console.log(this.form.value);
      this.user = this.setUser(this.form.value);
      this.signupUser(this.user);
    } else {
      this.error = "username ou mot de passe ou role est vide";
    }
  }

  signupUser(newuser) {
    this.queryDbService
      .signUp(JSON.stringify(newuser))
      .subscribe((res: User[]) => {
        if (res.length == 0) {
          this.error = "username existe ";
        } else {
          this.saveUser(res);
        }
      });
  }

  private saveUser(res: User[]) {
    localStorage.setItem("user", JSON.stringify(res[0]));
    this.signStatusService.updateSingStatus("Sign Out");
    this.router.navigate(["user-profile"]);
    this.toastr.success("Sign Up successfully!", `Welocme ${res[0].username}!`);
  }

  setUser(formValue) {
    let user: any = {};
    user["username"] = formValue["username"];
    user["role"] = formValue["role"];
    user["pass"] = formValue["pass"];
    user["email"] = "";
    user["firstName"] = "";
    user["lastName"] = "";
    user["adress"] = "";
    user["city"] = "";
    user["country"] = "";
    user["codePoste"] = "";
    user["AboutMe"] = "";
    return user as User;
  }
}

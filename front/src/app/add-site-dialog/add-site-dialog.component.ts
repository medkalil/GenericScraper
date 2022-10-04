import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";
import { QueryDbService } from "app/services/query-db.service";
import { SiteDeReferenceComponent } from "app/site-de-reference/site-de-reference.component";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-add-site-dialog",
  templateUrl: "./add-site-dialog.component.html",
  styleUrls: ["./add-site-dialog.component.scss"],
})
export class AddSiteDialogComponent implements OnInit {
  rootForm: FormGroup;
  shemaDetectResult: any;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    public dialogRef: MatDialogRef<SiteDeReferenceComponent>,
    private queryDbService: QueryDbService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    const urlPatttern = "(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?";
    this.rootForm = this.fb.group({
      root: ["", [Validators.required, Validators.pattern(urlPatttern)]],
    });
  }

  //service,materiel,ambassade,test,tunisie, fourniture,acquisitio,activite
  AddSiteAuto() {
    console.log("value :", this.rootForm.value.root);
    this.toastr.info("L'ajout du site est en cour", "Analyse du site!");
    this.queryDbService
      .shema_detect(
        this.rootForm.value.root,
        "service,materiel,ambassade,test,tunisie, fourniture,acquisitio,activite"
      )
      .subscribe((res) => {
        this.shemaDetectResult = res;
        console.log("th res is:", this.shemaDetectResult);
        this.displayToast();
      });

    this.toastr.info("L'ajout du site est en cour", "Analyse du site!");
    this.dialogRef.close();
  }

  private displayToast() {
    if (this.shemaDetectResult == "table") {
      this.toastr.success(
        `${this.rootForm.value.root} ajouté avec succès`,
        "Succes!"
      );
    } else if (typeof this.shemaDetectResult === "object") {
      this.toastr.success(
        `${this.rootForm.value.root} ajouté avec succès`,
        "Succes!"
      );
    } else {
      this.toastr.error(`${this.rootForm.value.root} existe déja`, "Error!");
    }
  }
}

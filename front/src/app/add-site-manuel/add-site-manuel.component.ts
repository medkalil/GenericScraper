import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";
import { MatRadioChange } from "@angular/material/radio";
import { QueryDbService } from "app/services/query-db.service";
import { SiteDeReferenceComponent } from "app/site-de-reference/site-de-reference.component";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-add-site-manuel",
  templateUrl: "./add-site-manuel.component.html",
  styleUrls: ["./add-site-manuel.component.scss"],
})
export class AddSiteManuelComponent implements OnInit {
  isCard = false;
  myForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<SiteDeReferenceComponent>,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private queryDbService: QueryDbService
  ) {}

  ngOnInit(): void {
    this.createForm();
  }

  createForm() {
    const urlPatttern = "(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?";
    this.myForm = this.fb.group({
      root: ["", [Validators.required, Validators.pattern(urlPatttern)]],
      type: ["", Validators.required],
      card_css_selector: [""],
      config: [""],
    });
  }
  radioChange($event: MatRadioChange) {
    console.log($event.source.name, $event.value);

    if ($event.source.value === "table_scraper") {
      this.isCard = false;
    } else if ($event.source.value === "card_scraper") {
      this.isCard = true;
    }
  }

  onSubmit(data) {
    console.log("data:", data);
    this.toastr.info("L'ajout du site Manuel est en cour", "Analyse du site!");
    this.queryDbService.add_manuel_site(data).subscribe((res) => {
      console.log("POST REQUEST SENT", res);
      this.displayToast(res, data);
    });
    this.dialogRef.close();
  }

  private displayToast(res, data) {
    if (res == "site added manuely") {
      this.toastr.success(`${data["root"]} ajouté avec succès`, "Succes!");
    } else if (res == "root existe") {
      this.toastr.error(`${data["root"]} existe déja`, "Error!");
    } else {
      this.toastr.error(`Error detected`, "Error!");
    }
  }
}

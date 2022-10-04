import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { QueryDbService } from "app/services/query-db.service";
import { SiteDeReferenceComponent } from "app/site-de-reference/site-de-reference.component";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-site-detail-dialog",
  templateUrl: "./site-detail-dialog.component.html",
  styleUrls: ["./site-detail-dialog.component.scss"],
})
export class SiteDetailDialogComponent implements OnInit {
  currRoot: any;
  configuration: any;
  isCard: any;
  isLoading = true;

  constructor(
    private toastr: ToastrService,
    public dialogRef: MatDialogRef<SiteDeReferenceComponent>,
    private queryDbService: QueryDbService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.currRoot = data["root"];
  }

  ngOnInit(): void {
    console.log("the root property", this.currRoot);
    this.initCOnfiguration();
  }

  initCOnfiguration() {
    this.queryDbService.get_configuration(this.currRoot).subscribe((res) => {
      console.log("config in ts ", res);
      this.configuration = res;
      this.isLoading = false;
      if (this.configuration["type"] == "card_scraper") {
        this.isCard = true;
      }
    });
  }
}

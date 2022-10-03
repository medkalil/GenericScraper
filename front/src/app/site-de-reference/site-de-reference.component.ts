import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { AddSiteDialogComponent } from "app/add-site-dialog/add-site-dialog.component";
import { DeleteDialogComponent } from "app/delete-dialog/delete-dialog.component";
import { QueryDbService } from "app/services/query-db.service";
import { ToastService } from "app/services/toast.service";
import { ToastrService } from "ngx-toastr";
import { Subject } from "rxjs";

@Component({
  selector: "app-site-de-reference",
  templateUrl: "./site-de-reference.component.html",
  styleUrls: ["./site-de-reference.component.scss"],
})
export class SiteDeReferenceComponent implements OnInit {
  urlList: any[];

  /* urlList = [
    {
      url: "https://www.google.com",
    },
    {
      url: "https://www.google+moazeazkje+azeaz,leklaz+azeak,s.com",
    },
    {
      url: "https://www.e-marchespublics.com/appel-offre/activite/fourniture/amenagement-urbain/banc",
    },
  ]; */
  constructor(
    private queryDbService: QueryDbService,
    private toastr: ToastrService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.getRootList();
  }

  getRootList() {
    this.queryDbService.get_root_list().subscribe((res) => {
      this.urlList = res;
      console.log("the res is", res);
    });
  }

  showSuccess() {
    this.toastr.success("deleted successfully!", "Deleting Site!");
  }

  openAddDialog() {
    this.dialog.open(AddSiteDialogComponent, {
      width: "30%",
      data: { root: "test" },
    });
  }

  openDeleteDialog(url) {
    console.log("url:", url);
    this.dialog.open(DeleteDialogComponent, {
      width: "30%",
      data: { root: url },
    });
  }
}

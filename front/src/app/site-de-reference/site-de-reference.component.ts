import { Component, OnDestroy, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { AddSiteDialogComponent } from "app/add-site-dialog/add-site-dialog.component";
import { AddSiteManuelComponent } from "app/add-site-manuel/add-site-manuel.component";
import { DeleteDialogComponent } from "app/delete-dialog/delete-dialog.component";
import { QueryDbService } from "app/services/query-db.service";
import { ToastService } from "app/services/toast.service";
import { WebsocketService } from "app/services/websocket.service";
import { SiteDetailDialogComponent } from "app/site-detail-dialog/site-detail-dialog.component";
import { ToastrService } from "ngx-toastr";
import { Subject } from "rxjs";

@Component({
  selector: "app-site-de-reference",
  templateUrl: "./site-de-reference.component.html",
  styleUrls: ["./site-de-reference.component.scss"],
})
export class SiteDeReferenceComponent implements OnInit {
  urlList: any[];
  testRootList: any;
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
  ) // private webSocketService: WebsocketService
  {}

  ngOnInit(): void {
    this.getRootList();
    /*this.queryDbService.get_testRootList().subscribe((message) => {
      this.queryDbService.testRootList.push(message);
    }); */
    /* this.webSocketService.listen("end").subscribe((data) => {
      console.log("data from socket io", data);
    }); */
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
      width: "50%",
      data: { root: "test" },
    });
  }

  openDeleteDialog(url) {
    console.log("url:", url);
    this.dialog.open(DeleteDialogComponent, {
      width: "50%",
      data: { root: url },
    });
  }

  openSiteDetailDialog(url) {
    this.dialog.open(SiteDetailDialogComponent, {
      width: "50%",
      data: { root: url },
    });
  }
  openAddManuelDialogDialog() {
    console.log("Ajout Manuel");
    this.dialog.open(AddSiteManuelComponent, {
      width: "50%",
      data: { root: "test" },
    });
  }
}

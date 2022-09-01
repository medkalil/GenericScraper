import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { DataTableComponent } from "app/data-table/data-table.component";
import { QueryDbService } from "app/services/query-db.service";

@Component({
  selector: "app-delete-dialog",
  templateUrl: "./delete-dialog.component.html",
  styleUrls: ["./delete-dialog.component.scss"],
})
export class DeleteDialogComponent implements OnInit {
  currRoot: any;
  constructor(
    private queryDbService: QueryDbService,
    private dialogRef: MatDialogRef<DataTableComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.currRoot = data;
  }

  ngOnInit(): void {}

  deleteProject() {
    console.log("the root property", this.currRoot["root"]);
    console.log("deleting project");
    this.dialogRef.close();
    this.queryDbService.delete_collection(this.currRoot["root"]).subscribe();
  }
}

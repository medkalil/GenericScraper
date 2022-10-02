import { Component, OnInit } from "@angular/core";
import { QueryDbService } from "app/services/query-db.service";
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
  constructor(private queryDbService: QueryDbService) {}

  ngOnInit(): void {
    this.getRootList();
  }

  getRootList() {
    this.queryDbService.get_root_list().subscribe((res) => {
      this.urlList = res;
      console.log("the res is", res);
    });
  }
}

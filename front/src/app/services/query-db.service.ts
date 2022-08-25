import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class QueryDbService {
  //http://127.0.0.1:5000/get_root_list
  constructor(private http: HttpClient) {}

  get_root_list(): Observable<any[]> {
    return this.http.get<any>("http://127.0.0.1:5000/get_root_list");
  }

  get_root_data(root): Observable<any[]> {
    return this.http.get<any>(
      `http://127.0.0.1:5000/get_root_data?root=${root} `
    );
  }

  get_mot_cles(root): Observable<any[]> {
    return this.http.get<any>(
      `http://127.0.0.1:5000/get_mot_cles?root=${root} `
    );
  }

  filter_resulat_by_mot_cle(root, mot_cle, item): Observable<any[]> {
    //http://127.0.0.1:5000/filter_resulat_by_mot_cle?root=https://www.appeloffres.com&mot_cle=câbles&item={"sudo" : "ca" , "url" : "https://www.google.com"}
    return this.http.get<any>(
      `http://127.0.0.1:5000/filter_resulat_by_mot_cle?root=${root}&mot_cle=${mot_cle}&item=${item} `
    );
  }
}

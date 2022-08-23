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
}

import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { catchError } from "rxjs/operators";
import { ProcessHttpmsgService } from "./process-httpmsg.service";

@Injectable({
  providedIn: "root",
})
export class QueryDbService {
  private data = new BehaviorSubject<any[]>([]);
  currentData = this.data.asObservable();
  private items: any[] = [];

  constructor(
    private http: HttpClient,
    private processHttpmsgService: ProcessHttpmsgService
  ) {}

  setData(data: any) {
    this.items.push(data);
    this.data.next(this.data.value.concat(data));
  }

  remove(it) {
    let roomArr: any[] = [...this.data.getValue()];

    roomArr.forEach((item, index) => {
      if (item === it) {
        roomArr.splice(index, 1);
      }
    });

    this.data.next(roomArr);
  }

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

  filter_resulat_by_mot_cle(root, mot_cle): Observable<any[]> {
    //http://127.0.0.1:5000/filter_resulat_by_mot_cle?root=https://www.appeloffres.com&mot_cle=câbles&item={"sudo" : "ca" , "url" : "https://www.google.com"}
    return this.http.get<any>(
      `http://127.0.0.1:5000/filter_resulat_by_mot_cle?root=${root}&mot_cle=${mot_cle} `
    );
  }

  delete_collection(root): Observable<any> {
    return this.http.get<any>(
      `http://127.0.0.1:5000/delete_collection?root=${root}`
    );
  }

  //http://127.0.0.1:5000/run_scraper_for_root_exist?root=https://www.appeloffres.com&depth=4&list_mot_cle=materiel,téléphonique&partition=1
  run_existing_root(root, list_mot_cle, partition): Observable<any> {
    return this.http.get<any>(
      `http://127.0.0.1:5000/run_scraper_for_root_exist?root=${root}&depth=4&list_mot_cle=${list_mot_cle}&partition=${partition} `
    );
  }

  //http://127.0.0.1:5000/run_linkextractor?root=https://www.e-marchespublics.com&depth=4&list_mot_cle=amenagement,materiel&partition=1
  run_no_existing_root(root, list_mot_cle, partition): Observable<any> {
    return this.http.get<any>(
      `http://127.0.0.1:5000/run_linkextractor?root=${root}&depth=4&list_mot_cle=${list_mot_cle}&partition=${partition} `
    );
  }

  delete_item(root, item) {
    return this.http.get<any>(
      `http://127.0.0.1:5000/delete_item?root=${root}&item=${item}`
    );
  }

  get_search_data(root, mot) {
    return this.http.get<any>(
      `http://127.0.0.1:5000/get_search_data?root=${root}&search_mot=${mot}`
    );
  }

  get_list_jobs() {
    return this.http
      .get<any>("http://127.0.0.1:5000/get_list_jobs")
      .pipe(catchError(this.processHttpmsgService.handleError));
  }
}

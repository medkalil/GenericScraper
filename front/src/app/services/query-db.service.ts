import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
//import { Socket } from "ngx-socket-io";
import { BehaviorSubject, Observable } from "rxjs";
import { catchError } from "rxjs/operators";
import { ProcessHttpmsgService } from "./process-httpmsg.service";
import { map } from "rxjs/operators";
import { User } from "app/user-profile/user-profile.component";

@Injectable({
  providedIn: "root",
})
export class QueryDbService {
  BASE_URL = "http://127.0.0.1:5000/";
  private data = new BehaviorSubject<any[]>([]);
  currentData = this.data.asObservable();
  private items: any[] = [];
  testRootList: any[];

  private showSearchingIcon = new BehaviorSubject<boolean>(true);
  currentshowSearchingIcon = this.showSearchingIcon.asObservable();

  constructor(
    private http: HttpClient,
    private processHttpmsgService: ProcessHttpmsgService //private socket: Socket
  ) {}

  updateCurrentshowSearchingIcon(valuer: boolean) {
    this.showSearchingIcon.next(valuer);
  }

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

  get_old_data(root): Observable<any[]> {
    return this.http.get<any>(
      `http://127.0.0.1:5000/get_old_data?root=${root} `
    );
  }

  get_all_data(root): Observable<any[]> {
    return this.http.get<any>(
      `http://127.0.0.1:5000/get_all_data?root=${root} `
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

  //http://127.0.0.1:5000/shema_detect?root=https://tunisie-appels-doffres.com&mots_cles=service,materiel,ambassade,test,tunisie, fourniture,acquisitio,activite
  shema_detect(root, list_mot_cle): Observable<any> {
    return this.http.get<any>(
      `http://127.0.0.1:5000/shema_detect?root=${root}&mots_cles=${list_mot_cle}`
    );
  }

  //http://127.0.0.1:5000/get_configuration?root=https://www.e-marchespublics.com
  get_configuration(root): Observable<any> {
    return this.http.get<any>(
      `http://127.0.0.1:5000/get_configuration?root=${root}`
    );
  }

  add_manuel_site(data) {
    //console.log("data in service:", data);
    return this.http.post<any>(
      `http://127.0.0.1:5000/shema_detect_manuel`,
      data
    );
  }

  /* get_testRootList() {
    console.log("inside service sockets");
    return this.socket.fromEvent("message").pipe(map((data: any) => data));
  } */

  run_scraper(root, mots_cles): Observable<any> {
    return this.http.get<any>(
      `http://127.0.0.1:5000/run_scraper?root=${root}&depth=3&mots_cles=${mots_cles} `
    );
  }

  get_data_grouped_by_classified_as(root): Observable<any> {
    return this.http.get<any>(
      `http://127.0.0.1:5000/get_data_grouped_by_classified_as?root=${root}`
    );
  }

  get_user(username: string): Observable<any> {
    return this.http.get<any>(
      `http://127.0.0.1:5000/get_user?username=${username}`
    );
  }
  update_profile(username: string, newProfile: User): Observable<any> {
    return this.http.put<User>(
      //`http://127.0.0.1:5000/update_profile/${username}?item=${newProfile}`
      `http://127.0.0.1:5000/update_profile/${username}`,
      newProfile
    );
  }

  authentification(authUser): Observable<any> {
    return this.http.get<any>(
      `http://127.0.0.1:5000/authentification?authUser=${authUser}`
    );
  }

  signUp(newUser): Observable<any> {
    return this.http.get<any>(
      `http://127.0.0.1:5000/signup?newUser=${newUser}`
    );
  }

  run_cron_scrape(root, mots_cles, timerForm): Observable<any> {
    return this.http.get<any>(
      `http://127.0.0.1:5000/run_cron_scrape?root=${root}&mots_cles=${mots_cles}&depth=3&timerForm=${timerForm}`
    );
  }
}

/* 
add_manuel_site(data) {
    //console.log("data in service:", data);
    return this.http.post<any>(
      `http://127.0.0.1:5000/shema_detect_manuel`,
      data
    );
  } */

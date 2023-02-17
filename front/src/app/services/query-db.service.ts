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
  BASE_URL = "http://127.0.0.1:5000";
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
    return this.http.get<any>(`${this.BASE_URL}/get_root_list`);
  }

  get_root_data(root): Observable<any[]> {
    return this.http.get<any>(
      `${this.BASE_URL}/get_root_data?root=${root} `
    );
  }

  get_old_data(root): Observable<any[]> {
    return this.http.get<any>(
      `${this.BASE_URL}/get_old_data?root=${root} `
    );
  }

  get_all_data(root): Observable<any[]> {
    return this.http.get<any>(
      `${this.BASE_URL}/get_all_data?root=${root} `
    );
  }

  get_mot_cles(root): Observable<any[]> {
    return this.http.get<any>(
      `${this.BASE_URL}/get_mot_cles?root=${root} `
    );
  }

  filter_resulat_by_mot_cle(root, mot_cle): Observable<any[]> {
    //${this.BASE_URL}/filter_resulat_by_mot_cle?root=https://www.appeloffres.com&mot_cle=câbles&item={"sudo" : "ca" , "url" : "https://www.google.com"}
    return this.http.get<any>(
      `${this.BASE_URL}/filter_resulat_by_mot_cle?root=${root}&mot_cle=${mot_cle} `
    );
  }

  delete_collection(root): Observable<any> {
    return this.http.get<any>(
      `${this.BASE_URL}/delete_collection?root=${root}`
    );
  }

  //${this.BASE_URL}/run_scraper_for_root_exist?root=https://www.appeloffres.com&depth=4&list_mot_cle=materiel,téléphonique&partition=1
  run_existing_root(root, list_mot_cle, partition): Observable<any> {
    return this.http.get<any>(
      `${this.BASE_URL}/run_scraper_for_root_exist?root=${root}&depth=4&list_mot_cle=${list_mot_cle}&partition=${partition} `
    );
  }

  //${this.BASE_URL}/run_linkextractor?root=https://www.e-marchespublics.com&depth=4&list_mot_cle=amenagement,materiel&partition=1
  run_no_existing_root(root, list_mot_cle, partition): Observable<any> {
    return this.http.get<any>(
      `${this.BASE_URL}/run_linkextractor?root=${root}&depth=4&list_mot_cle=${list_mot_cle}&partition=${partition} `
    );
  }

  delete_item(root, item) {
    return this.http.get<any>(
      `${this.BASE_URL}/delete_item?root=${root}&item=${item}`
    );
  }

  get_search_data(root, mot) {
    return this.http.get<any>(
      `${this.BASE_URL}/get_search_data?root=${root}&search_mot=${mot}`
    );
  }

  get_list_jobs() {
    return this.http
      .get<any>(`${this.BASE_URL}/get_list_jobs`)
      .pipe(catchError(this.processHttpmsgService.handleError));
  }

  //${this.BASE_URL}/shema_detect?root=https://tunisie-appels-doffres.com&mots_cles=service,materiel,ambassade,test,tunisie, fourniture,acquisitio,activite
  shema_detect(root, list_mot_cle): Observable<any> {
    return this.http.get<any>(
      `${this.BASE_URL}/shema_detect?root=${root}&mots_cles=${list_mot_cle}`
    );
  }

  //${this.BASE_URL}/get_configuration?root=https://www.e-marchespublics.com
  get_configuration(root): Observable<any> {
    return this.http.get<any>(
      `${this.BASE_URL}/get_configuration?root=${root}`
    );
  }

  add_manuel_site(data) {
    //console.log("data in service:", data);
    return this.http.post<any>(
      `${this.BASE_URL}/shema_detect_manuel`,
      data
    );
  }

  /* get_testRootList() {
    console.log("inside service sockets");
    return this.socket.fromEvent("message").pipe(map((data: any) => data));
  } */

  run_scraper(root, mots_cles): Observable<any> {
    return this.http.get<any>(
      `${this.BASE_URL}/run_scraper?root=${root}&depth=3&mots_cles=${mots_cles} `
    );
  }

  get_data_grouped_by_classified_as(root): Observable<any> {
    return this.http.get<any>(
      `${this.BASE_URL}/get_data_grouped_by_classified_as?root=${root}`
    );
  }

  get_user(username: string): Observable<any> {
    return this.http.get<any>(
      `${this.BASE_URL}/get_user?username=${username}`
    );
  }
  update_profile(username: string, newProfile: User): Observable<any> {
    return this.http.put<User>(
      //`${this.BASE_URL}/update_profile/${username}?item=${newProfile}`
      `${this.BASE_URL}/update_profile/${username}`,
      newProfile
    );
  }

  authentification(authUser): Observable<any> {
    return this.http.get<any>(
      `${this.BASE_URL}/authentification?authUser=${authUser}`
    );
  }

  signUp(newUser): Observable<any> {
    return this.http.get<any>(
      `${this.BASE_URL}/signup?newUser=${newUser}`
    );
  }

  run_cron_scrape(root, mots_cles, timerForm): Observable<any> {
    return this.http.get<any>(
      `${this.BASE_URL}/run_cron_scrape?root=${root}&mots_cles=${mots_cles}&depth=3&timerForm=${timerForm}`
    );
  }

  getDateDataOfRootIfExiste(root): Observable<any> {
    return this.http.get<any>(
      `${this.BASE_URL}/getDateDataOfRootIfExiste?root=${root}`
    );
  }

  getRecherches(): Observable<any> {
    return this.http.get<any>(`${this.BASE_URL}/get_recherches`);
  }

  createRecherche(roots, data, type, date): Observable<any> {
    return this.http.get<any>(
      `${this.BASE_URL}/createRecherche?roots=${roots}&data=${data}&type=${type}&date=${date}`
    );
  }
  updateRecherche(rechercheId, data): Observable<any> {
    return this.http.get<any>(
      `${this.BASE_URL}/updateRecherche?rechercheId=${rechercheId}&data=${data}`
    );
  }
}

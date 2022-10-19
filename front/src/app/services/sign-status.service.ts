import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class SignStatusService {
  private signSattus = new BehaviorSubject("Sign In");
  currentSignSattus = this.signSattus.asObservable();

  constructor() {}
  updateSingStatus(message: string) {
    this.signSattus.next(message);
  }
}

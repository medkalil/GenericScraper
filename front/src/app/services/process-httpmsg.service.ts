import { HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { throwError } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class ProcessHttpmsgService {
  constructor() {}

  public handleError(error: HttpErrorResponse | any) {
    let errorMsg: string;
    if (error.error instanceof ErrorEvent) {
      errorMsg = error.error.message;
    } else {
      errorMsg = `Json Serveur Error : ${error.status} - ${
        error.statusText || ""
      }  ${error.error} `;
    }
    return throwError(errorMsg);
  }
}

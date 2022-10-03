import { Injectable, TemplateRef } from "@angular/core";
import { Observable, Subject } from "rxjs";

export interface ToastEvent {
  type: EventTypes;
  title: string;
  message: string;
}

export enum EventTypes {
  Success = "success",
  Info = "info",
  Warning = "warning",
  Error = "error",
}

@Injectable({
  providedIn: "root",
})
export class ToastService {
  toasts: any[] = [];

  // Push new Toasts to array with content and options
  show(textOrTpl: string | TemplateRef<any>, options: any = {}) {
    this.toasts.push({ textOrTpl, ...options });
  }

  // Callback method to remove Toast DOM element from view
  remove(toast) {
    this.toasts = this.toasts.filter((t) => t !== toast);
  }
}

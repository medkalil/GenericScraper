import { Injectable } from "@angular/core";
import { Observable, Subscriber } from "rxjs";
import io from "socket.io-client";

@Injectable({
  providedIn: "root",
})
export class WebsocketService {
  socket: any;
  readonly uri: string = "ws://localhost:5000";

  constructor() {
    this.socket = io(this.uri);
  }

  listen(eventName: string) {
    return new Observable((subsiber) => {
      this.socket.on(eventName, (data) => {
        subsiber.next(data);
      });
    });
  }

  end(eventName: string) {
    return new Observable((subsiber) => {
      this.socket.on(eventName, (data) => {
        this.socket.disconnect(0);
      });
    });
  }

  emit(eventName: string, data: any) {
    this.socket.emit(eventName, data);
  }
}

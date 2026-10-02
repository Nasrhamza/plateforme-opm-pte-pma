import { Injectable } from "@angular/core";
import { Socket } from "ngx-socket-io";
import { EMPTY, map, take } from "rxjs";
import { AuthService } from "./auth.service";


@Injectable({
    providedIn : 'root'
})
export class SocketService {
    constructor(
        private socket: Socket,
        private _authService:  AuthService
    ) {}
    //the socket connects automatically whenever a user sign in 

    connectUserToSocket(){
        this._authService.authenticatedUser$.pipe(
            take(1),
            map(user=>{
                if(!user){
                    return EMPTY;
                }
                return user.id
            })
        ).subscribe(
            id => {
                this.socket.emit("PMA_ACTIVE_USER", id);
            }
        )
    }

    receiveEvent() {
        return this.socket.fromEvent('PMA_EVENT');
    }
}
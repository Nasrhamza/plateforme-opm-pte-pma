import { Injectable } from "@angular/core";
import { AuthService } from "./auth.service";
import { BehaviorSubject, EMPTY, map, switchMap, take } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment.development";
import { ApiResponse } from "../models/api-response.model";
import { Notification } from "../models/notification.model";
import { MessageService } from "./message.service";


export interface NotificationsData {
    notifications : Notification[],
    total : number,
    unread : number,
    read : number,
    archived : number
}


@Injectable({
    providedIn : 'root'
})
export class NotificationService {
    constructor(
        private _auth : AuthService,
        private _http : HttpClient,
        private _messageService : MessageService
    ){}

    baseUrl = `${environment.apiUrl}/api/v1/notifications`;


    private notificationSubjects = new BehaviorSubject<NotificationsData | null >(null);
    notifications$ = this.notificationSubjects.asObservable();

    private loadingSubject = new BehaviorSubject<boolean>(false);
    loading$ = this.loadingSubject.asObservable();

    setNotifications(data : any){
        let updatedNotifications = [data, ...this.notificationSubjects.value!.notifications];
        this.notificationSubjects.next(this.procesNotificationsData(updatedNotifications));
    }
    deleteNotifications(notificationId : string){
        this._http.delete<ApiResponse<{ _id : string }>>(`${this.baseUrl}/${notificationId}`).subscribe(
            res => {
                const updated = this.notificationSubjects.value!.notifications.filter(notif => notif._id !== notificationId);
                this.notificationSubjects.next(this.procesNotificationsData(updated));
            }
        )
    }
    updateNotifications(notificationId : string, status : string){
        const existNotifs = this.notificationSubjects.value!.notifications;
        const index = existNotifs.findIndex(notif => notif._id === notificationId);
        existNotifs[index].status = status;
        this.notificationSubjects.next(this.procesNotificationsData(existNotifs));
    }
    readAllNotification(userId : string){
        return this._http.get<ApiResponse<null>>(`${this.baseUrl}/user/${userId}/readAll`).subscribe(
            res=>{
                const existNotifs = this.notificationSubjects.value!.notifications;
                const read =  existNotifs.map(notif => ({ ...notif, status : 'read' }));
                this.notificationSubjects.next(this.procesNotificationsData(read));
                this._messageService.showSuccessMessage(res.message);
            }
        )
    }

    procesNotificationsData(notifications : Notification[]){
        return {
            notifications : notifications,
            read : notifications.filter(x => x.status === 'red').length,
            unread : notifications.filter(x => x.status === 'unread').length,
            archived : notifications.filter(x => x.status === 'archived').length,
            total : notifications.length
        }
    }

    getNotifications(){
        this.loadingSubject.next(true);
        return this._auth.authenticatedUser$.pipe(
            take(1),
            switchMap(user=>{
                if(!user || !user.id) return EMPTY;
                return this._http.get<ApiResponse<{ notifications : Notification[], total : number }>>(`${this.baseUrl}/users/${user.id}`).pipe(
                    map(res => this.procesNotificationsData(res.data!.notifications))
                );
            })
        ).subscribe(
            res=>{
                this.notificationSubjects.next(res);
                this.loadingSubject.next(false);
            }
        );
    };

    markAsRead(notificationId : string, status : string){
        return this._http.patch<ApiResponse<{ _id : string, status : string }>>(`${this.baseUrl}/${notificationId}`, { status }).subscribe(
            res=> {
                if(res.data && res.data._id){
                    this.updateNotifications(res.data._id, res.data.status);
                }
            }
        );
    }
}
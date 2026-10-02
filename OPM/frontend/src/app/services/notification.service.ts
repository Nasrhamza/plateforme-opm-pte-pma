import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { BehaviorSubject } from 'rxjs';
import { BackendService } from './backend.service'; // Import your backend service
import { AuthService } from './auth.service'; // Import AuthService to get the current user
import { environment } from '../../environments/environment';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private notificationsSubject = new BehaviorSubject<any[]>([]);
  public notifications$ = this.notificationsSubject.asObservable().pipe(
    map(notifs => {
      return {
        new: notifs.filter(n => n.read == false).length,
        old: notifs.filter(n => n.read == true).length,
        all: notifs
      }
    }),
  );

  constructor(
    private socket: Socket,
    private backendService: BackendService,
    private authService: AuthService // Inject AuthService to get the current user
  ) { }

  disconnectSocket() {
    this.socket.on('disconnect', () => {
    });
  }

  recieveTicket() {
    this.socket.fromEvent('new-ticket').subscribe((notification: any) => {
      const currentNotifications = this.notificationsSubject.value;
      if (!currentNotifications.find((n: any) => n._id === notification._id)) {
        this.notificationsSubject.next([notification, ...currentNotifications]);
      }
    });
  }
  assignTicket() {
    this.socket
      .fromEvent('assign-ticket')
      .subscribe((notification: any) => {
        const currentNotifications = this.notificationsSubject.value;
        if (!currentNotifications.find((n: any) => n._id === notification._id)) {
          this.notificationsSubject.next([notification, ...currentNotifications]);
        }
      });
  }
  takenTicket() {
    this.socket.fromEvent('taken-ticket').subscribe((notification: any) => {
      const currentNotifications = this.notificationsSubject.value;
      if (!currentNotifications.find((n: any) => n._id === notification._id)) {
        this.notificationsSubject.next([notification, ...currentNotifications]);
      }
    });
  }
  resolvedTicket() {
    this.socket.fromEvent('resolved-ticket').subscribe((notification: any) => {
      const currentNotifications = this.notificationsSubject.value;
      if (!currentNotifications.find((n: any) => n._id === notification._id)) {
        this.notificationsSubject.next([notification, ...currentNotifications]);
      }
    });
  }
  chatTicket() {
    this.socket.fromEvent('chat-message').subscribe((notification: any) => {
      const currentNotifications = this.notificationsSubject.value;
      if (!currentNotifications.find((n: any) => n._id === notification._id)) {
        this.notificationsSubject.next([notification, ...currentNotifications]);
      }
    });
  }
  closedTicket() {
    this.socket.fromEvent('closed-ticket').subscribe((notification: any) => {
      const currentNotifications = this.notificationsSubject.value;
      if (!currentNotifications.find((n: any) => n._id === notification._id)) {
        this.notificationsSubject.next([notification, ...currentNotifications]);
      }
    });
  }

  connectSockett() {
    this.socket.on('connect', () => {
      const userId = this.authService.getAuthUser()?.user?._id;
      if (userId) {
        this.socket.emit('register-user', userId);
      }
    });
  }

  fetchNotifications() {
    const userId = this.authService.getAuthUser().user._id; // Get the authenticated user
    this.backendService.get(`${environment.apiUrl}/notification/getUserNotifications/${userId}`).subscribe(
      (response: any) => {
        this.notificationsSubject.next(response.rows);
      }
    );
  }
  clearNotifications() {
    const userId = this.authService.getAuthUser().user._id;
    return this.backendService.delete(`${environment.apiUrl}/notification/clearAll/${userId}`).subscribe(
      res => {
        this.notificationsSubject.next([]);
      }
    );
  }

  markOneAsRead(notificationId: string) {
    return this.backendService.post(`${environment.apiUrl}/notification/markOneAsRead/`, { notificationId }).subscribe(
      (res) => {
        let notifs = this.notificationsSubject.value;
        let notif = notifs.find(n => n._id === notificationId);
        if (notif) {
          notif.read = true;
        }
        this.notificationsSubject.next(notifs);
      }
    );
  }

  markAllAsRead() {
    const userId = this.authService.getAuthUser().user._id;
    return this.backendService.post(`${environment.apiUrl}/notification/markAllAsRead/`, { userId }).subscribe(
      res => {
        let notifs = this.notificationsSubject.value;
        notifs.forEach(n => n.read = true)
        this.notificationsSubject.next(notifs);
      }
    );
  }

}

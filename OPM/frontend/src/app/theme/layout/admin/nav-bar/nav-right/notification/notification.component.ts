import { Component, OnInit } from '@angular/core';
import { SocketService } from '../../../../../../services/notification.service';
import { Router } from '@angular/router';
import { environment } from '../../../../../../../environments/environment';
import { BackendService } from '../../../../../../services/backend.service';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/services/auth.service';



@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
})
export class NotificationComponent implements OnInit {
  fileurl: string = environment.fileUrl;
  notifications: any[] = []; // Array to store the notifications
  notifications$: Observable<any> = this.socketService.notifications$.pipe(
    tap(value => {
      this.newNotifs = value.new
      this.notifications = value.all
    }
    )
  );
  newNotifs: number = 0;
  imageUser;
  user;
  userAuthority;

  constructor(
    private router: Router,
    private socketService: SocketService,
    private authService: AuthService,
  ) {
    socketService.connectSockett();
    socketService.disconnectSocket();
    socketService.recieveTicket();
    socketService.assignTicket();
    socketService.takenTicket();
    socketService.resolvedTicket();
    socketService.closedTicket();
    socketService.chatTicket();
  }

  ngOnInit(): void {
    this.socketService.fetchNotifications();
    this.userAuthority = this.authService.getAuthUser().user.authority;
    this.user = this.authService.getAuthUser().user

  }
  handleGoToTicket(ticket) {
    if (this.userAuthority === 'admin' || this.userAuthority === 'pmo') {
      if (ticket.isHelpdesk) {
        this.router.navigate(['main/test/helpDesk']);
      } else
        this.router.navigate(['main/test/listTickets/detailes', ticket.contractId]);
    } else if (this.userAuthority === 'technician') {
      this.router.navigate(['main/test/ticketsTech/list-tickets']);
    } else if (this.userAuthority === 'assistant') {
      this.router.navigate(['main/test/helpDesk']);
    } else if (this.userAuthority === 'client') {
      this.router.navigate(['main/clientMang/customer-tickets/tiketes-List']);
    }
  }
  
  handleGoToChat(ticketId: string) {
    // this.router.navigateByUrl('/main/test', { skipLocationChange: true }).then(() => {
    this.router.navigate(['main/test/chat', ticketId])
    // })
  }

  markOneAsRead(id) {
    this.socketService.markOneAsRead(id);
  }
  markAllAsRead() {
    this.socketService.markAllAsRead();
  }

  clearNotifications() {
    this.socketService.clearNotifications();
  }
}

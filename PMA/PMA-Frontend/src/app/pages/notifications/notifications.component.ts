import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Notification } from 'src/app/core/models/notification.model';
import { NotificationsData, NotificationService } from 'src/app/core/services/notification.service';
import { ConfirmDeleteDialogComponent } from 'src/app/shared/dialogs/confirm-delete-dialog/confirm-delete-dialog.component';
import { SharedModule } from 'src/app/shared/shared/shared.module';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss'
})
export class NotificationsComponent implements OnInit{

  constructor(
    private _notificationService : NotificationService,
    public dialog: MatDialog,
    public _router: Router,
  ){}

  notifications: NotificationsData;
  notifications$ = this._notificationService.notifications$;
  loading$ = this._notificationService.loading$;

  ngOnInit(): void {
    this.notifications$.subscribe(
      res=>{
        if(res){
          this.notifications = res;
        }else{
          this.notifications = { 
            notifications : [], 
            archived : 0, 
            read : 0, 
            total : 0, 
            unread : 0
          };
        }
      }
    )
  }

  fetchNotifications(){
    this._notificationService.getNotifications();
  }

  openNotification(notification : Notification){
    this._notificationService.markAsRead(notification._id, 'read');
    if(notification.entityType === 'Project'){
      this._router.navigate(['projects', notification.entityId, 'main', 'details'])
    }
    if(notification.entityType === 'File'){
      this._router.navigate(['projects', notification.entityId, 'main', 'files'])
    }
    if(notification.entityType === 'Task'){
      this._router.navigate(['tasks', notification.entityId])
    }
  };


  markAsRead(notification : Notification){
    this._notificationService.markAsRead(notification._id, notification.status === 'read' ? 'unread' : 'read' );
  }

  delete(id : string){
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, { data : id });
      dialogRef.afterClosed().subscribe((result) => {
        if(!result || !result.event) return;
        if(result.event.answer == false) return;
        this._notificationService.deleteNotifications(id);
      })
    }

  getNotificationIcon(notification : Notification){
      return notification.entityType === 'Project' ? 'flag' : notification.entityType === 'Task' ? 'checkbox' : 'bell'
  }

}

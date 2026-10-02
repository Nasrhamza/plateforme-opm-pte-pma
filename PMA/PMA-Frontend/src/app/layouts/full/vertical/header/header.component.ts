import {
  Component,
  Output,
  EventEmitter,
  Input,
  ViewEncapsulation,
  OnInit,
} from '@angular/core';
import { CoreService } from 'src/app/core/services/core.service';
import { MatDialog } from '@angular/material/dialog';
import { navItems } from '../sidebar/sidebar-data';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MaterialModule } from 'src/app/material.module';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, NgForOf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { AuthService } from 'src/app/core/services/auth.service';
import { environment } from 'src/environments/environment.development';
import { AuthResponse } from 'src/app/core/models/auth-response.model';
import { EMPTY, Observable, switchMap, take, tap } from 'rxjs';
import { UserService } from 'src/app/core/services/users.service';
import { SocketService } from 'src/app/core/services/socket.service';
import { NotificationsData, NotificationService } from 'src/app/core/services/notification.service';
import { Notification } from 'src/app/core/models/notification.model';
import { SharedModule } from 'src/app/shared/shared/shared.module';
import { MessageService } from 'src/app/core/services/message.service';

interface notifications {
  id: number;
  img: string;
  title: string;
  subtitle: string;
}

interface profiledd {
  id: number;
  img: string;
  title: string;
  subtitle: string;
  link: string;
}

interface apps {
  id: number;
  img: string;
  title: string;
  subtitle: string;
  link: string;
}

interface quicklinks {
  id: number;
  title: string;
  link: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterModule, 
    CommonModule, 
    NgScrollbarModule, 
    TablerIconsModule, 
    MaterialModule,
    TranslateModule,
    SharedModule
  ],
  templateUrl: './header.component.html',
  encapsulation: ViewEncapsulation.None,
  styles : `
  .notif-box{
    min-width : 450px !important;
  };
  .notification-wrapper{
    max-height : 400px !important;
    overflow-y : scroll;
  };
  .mat-badge-content {
    background-color: red !important;
    color: #fff;
  };
  .readAllNotifs{
    cursor : pointer;
  }
  .readAllNotifs:hover{
    text-decoration : underline;
  }
  `
})
export class HeaderComponent implements OnInit{

  constructor(
    private vsidenav: CoreService,
    public dialog: MatDialog,
    private translate: TranslateService,
    private _auth: AuthService,
    private _user: UserService,
    private _router: Router,
    private _socketService : SocketService,
    private _notificationService : NotificationService,
    private _messageService : MessageService,
  ) {
    translate.setDefaultLang('fr');
    _socketService.connectUserToSocket();
  }

  @Input() showToggle = true;
  @Input() toggleChecked = false;
  @Output() toggleMobileNav = new EventEmitter<void>();
  @Output() toggleMobileFilterNav = new EventEmitter<void>();
  @Output() toggleCollapsed = new EventEmitter<void>();

  showFiller = false;

  imagesUrl = environment.userImagesUrl;
  serverNotifications : NotificationsData;
  notifications$ = this._notificationService.notifications$;
  loading$ = this._notificationService.loading$;

  authenticatedUser$ = this._auth.authenticatedUser$;
  currentUser : AuthResponse | null = null;
  loading = false;

  public selectedLanguage: any = {
    language: 'English',
    code: 'en',
    type: 'US',
    icon: '/assets/images/flag/icon-flag-en.svg',
  };

  ngOnInit(): void {
    const userLanguage = localStorage.getItem('PMA_USER_LANGUAGE');
    if(userLanguage){
      const language = JSON.parse(userLanguage);
      this.selectedLanguage = language;
    };
    this.authenticatedUser$.subscribe(
      user => {
        if(user){
          this.currentUser = user
        }
      }
    );
    this.fetchNotifications();
    this.notifications$.subscribe(
      res=> {
        this.serverNotifications = res!;
      }
    );
    this._socketService.receiveEvent().subscribe(
      (event  : any) => {
        this._notificationService.setNotifications(event);
        this._messageService.showSuccessMessage(event.title)
      }
    );
  }

  fetchNotifications(){
    this._notificationService.getNotifications();
  }

  readAllNotifications(){
    this._auth.authenticatedUser$.pipe(
      take(1),
      switchMap(user =>{
        if(!user) return EMPTY;
        this._notificationService.readAllNotification(user.id);
        return EMPTY;
      })
    ).subscribe()
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
  }

  getNotificationIcon(notification : Notification){
    switch (notification.entityType) {
      case "Project":
        return 'flag'
      case "Task":
        return 'checkbox'
      case "File":
        return 'files'
      default:
        return 'bell'
    }
  }

  swicthRole(){
    this._auth.authenticatedUser$.pipe(
      take(1),
      switchMap(user=>{
        if(!user) return EMPTY;
        const role = user.roles[0] === 'Engineer' ? 'Team Leader' : 'Engineer'
        return this._user.changeRole(user.id, role)
      })
    ).subscribe(
      res => {
        let old_auth = this._auth.getAuthUser();
        if(old_auth){
          old_auth.roles = res.data.roles!;
          this._auth.setAuthUser(old_auth);
          this._auth.saveAuthToLS(old_auth!);
          if(res.data!.roles![0] === 'Engineer'){
            this._router.navigate(['engineer', 'dashboard'])
          }
          if(res.data!.roles![0] === 'Team Leader'){
            this._router.navigate(['leader', 'dashboard'])
          }
        }
      }
    )
  };

  goToNotifications(){
    this._router.navigate(['notifications']);
  }

  public languages: any[] = [
    {
      language: 'English',
      code: 'en',
      type: 'US',
      icon: '/assets/images/flag/icon-flag-en.svg',
    },
    {
      language: 'Arabic',
      code: 'ar',
      icon: '/assets/images/flag/icon-flag-es.svg',
    },
    {
      language: 'Français',
      code: 'fr',
      icon: '/assets/images/flag/icon-flag-fr.svg',
    },
    {
      language: 'German',
      code: 'de',
      icon: '/assets/images/flag/icon-flag-de.svg',
    },
  ];

  logout(){
    this._auth.logout();
  }

  openDialog() {
    const dialogRef = this.dialog.open(AppSearchDialogComponent);

    dialogRef.afterClosed().subscribe((result) => {
    });
  }

  changeLanguage(lang: any): void {
    this.translate.use(lang.code);
    this.selectedLanguage = lang;
    localStorage.setItem('PMA_USER_LANGUAGE', JSON.stringify(lang));
  }

  notifications: notifications[] = [
    {
      id: 1,
      img: '/assets/images/profile/user-1.jpg',
      title: 'Roman Joined the Team!',
      subtitle: 'Congratulate him sf',
    },
    {
      id: 2,
      img: '/assets/images/profile/user-2.jpg',
      title: 'New message received',
      subtitle: 'Salma sent you new message',
    },
    {
      id: 3,
      img: '/assets/images/profile/user-3.jpg',
      title: 'New Payment received',
      subtitle: 'Check your earnings',
    },
    {
      id: 4,
      img: '/assets/images/profile/user-4.jpg',
      title: 'Jolly completed tasks',
      subtitle: 'Assign her new tasks',
    },
    {
      id: 5,
      img: '/assets/images/profile/user-5.jpg',
      title: 'Roman Joined thed Team!',
      subtitle: 'Congratulate him',
    },
  ];

  profiledd: profiledd[] = [
    {
      id: 1,
      img: '/assets/images/svgs/icon-account.svg',
      title: 'My Profile',
      subtitle: 'Account Settings',
      link: '/account/main',
    },
    {
      id: 2,
      img: '/assets/images/svgs/icon-inbox.svg',
      title: 'My Inbox',
      subtitle: 'Messages & Email',
      link: '/',
    },
    // {
    //   id: 3,
    //   img: '/assets/images/svgs/icon-tasks.svg',
    //   title: 'My Tasks',
    //   subtitle: 'To-do and Daily Tasks',
    //   link: '/',
    // },
  ];

  apps: apps[] = [
    {
      id: 1,
      img: '/assets/images/svgs/icon-dd-chat.svg',
      title: 'Chat Application',
      subtitle: 'Messages & Emails',
      link: '/',
    },
    {
      id: 2,
      img: '/assets/images/svgs/icon-dd-cart.svg',
      title: 'eCommerce App',
      subtitle: 'Buy a Product',
      link: '/',
    },
    {
      id: 3,
      img: '/assets/images/svgs/icon-dd-invoice.svg',
      title: 'Invoice App',
      subtitle: 'Get latest invoice',
      link: '/',
    },
    {
      id: 4,
      img: '/assets/images/svgs/icon-dd-date.svg',
      title: 'Calendar App',
      subtitle: 'Get Dates',
      link: '/',
    },
    {
      id: 5,
      img: '/assets/images/svgs/icon-dd-mobile.svg',
      title: 'Contact Application',
      subtitle: '2 Unsaved Contacts',
      link: '/',
    },
    {
      id: 6,
      img: '/assets/images/svgs/icon-dd-lifebuoy.svg',
      title: 'Tickets App',
      subtitle: 'Create new ticket',
      link: '/',
    },
    {
      id: 7,
      img: '/assets/images/svgs/icon-dd-message-box.svg',
      title: 'Email App',
      subtitle: 'Get new emails',
      link: '/',
    },
    {
      id: 8,
      img: '/assets/images/svgs/icon-dd-application.svg',
      title: 'Courses',
      subtitle: 'Create new course',
      link: '/',
    },
  ];

  quicklinks: quicklinks[] = [
    {
      id: 1,
      title: 'Administrative documents',
      link: '/my-administrative-documents',
    },
    {
      id: 2,
      title: 'Leave requests',
      link: '/my-leave-requests',
    },
    {
      id: 3,
      title: 'Register Now',
      link: '/',
    },
    {
      id: 4,
      title: '404 Error Page',
      link: '/',
    },
    {
      id: 5,
      title: 'Notes App',
      link: '/',
    },
    {
      id: 6,
      title: 'Employee App',
      link: '/',
    },
    {
      id: 7,
      title: 'Todo Application',
      link: '/',
    },
    {
      id: 8,
      title: 'Treeview',
      link: '/',
    },
  ];
}

@Component({
  selector: 'search-dialog',
  standalone: true,
  imports: [
    RouterModule,
    MaterialModule,
    TablerIconsModule,
    FormsModule,
    NgForOf,
  ],
  templateUrl: 'search-dialog.component.html',
})
export class AppSearchDialogComponent {
  searchText: string = '';
  navItems = navItems;
  //hide nav items for specific users by role, else all user can see other role s routes
  navItemsListForUser = navItems;
  constructor(private _auth : AuthService){
    _auth.authenticatedUser$.pipe(
      tap(user=>{
        this.navItemsListForUser = navItems.filter((item) => item.roles?.some(role => user?.roles.includes(role)))
      })
    ).subscribe()
  }
}

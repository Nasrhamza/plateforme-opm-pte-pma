import {
  Component,
  Inject,
  TemplateRef,
  OnInit,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import {
  MatDialog,
  MatDialogRef,
  MatDialogConfig,
} from '@angular/material/dialog';
import {
  addDays,
  isSameDay,
  isSameMonth,
} from 'date-fns';
import { EMPTY, map, Subject, switchMap, take, tap } from 'rxjs';
import {
  CalendarDateFormatter,
  CalendarEvent,
  CalendarEventAction,
  CalendarEventTimesChangedEvent,
  CalendarView,
} from 'angular-calendar';
import {
  provideNativeDateAdapter,
} from '@angular/material/core';
import { SharedModule } from 'src/app/shared/shared/shared.module';
import { AddCalendarEventDialogComponent } from 'src/app/shared/dialogs/add-calendar-event-dialog/add-calendar-event-dialog.component';
import { ConfirmDeleteDialogComponent } from 'src/app/shared/dialogs/confirm-delete-dialog/confirm-delete-dialog.component';
import { MessageService } from 'src/app/core/services/message.service';
import { EventService } from 'src/app/core/services/event.service';
import { EventModel } from 'src/app/core/models/event.model';
import { AuthService } from 'src/app/core/services/auth.service';

const colors: any = {
  red: {
    primary: '#fa896b',
    secondary: '#fdede8',
  },
  blue: {
    primary: '#5d87ff',
    secondary: '#ecf2ff',
  },
  yellow: {
    primary: '#ffae1f',
    secondary: '#fef5e5',
  },
};

@Component({
  selector: 'app-my-calendar',
  templateUrl: './my-calendar.component.html',
  styleUrls: ['./my-calendar.component.scss'],
  standalone: true,
  imports: [
   SharedModule
  ],
  providers: [provideNativeDateAdapter(), CalendarDateFormatter],
})
export class MyCalendarComponent implements OnInit{

  dialogRef: MatDialogRef<AddCalendarEventDialogComponent> = Object.create(TemplateRef);
  dialogRef2: MatDialogRef<AddCalendarEventDialogComponent> =
    Object.create(TemplateRef);

    
  constructor(
    public dialog: MatDialog, 
    @Inject(DOCUMENT) doc: any,
    private _EventService :  EventService,
    private _message : MessageService,
    private _auth : AuthService
  ) {}

  events : CalendarEvent[] = [];

  lastCloseResult = '';
  actionsAlignment = '';

  config: MatDialogConfig = {
    disableClose: false,
    width: '',
    height: '',
    position: {
      top: '',
      bottom: '',
      left: '',
      right: '',
    },
    data: {
      action: '',
      event: [],
    },
  };
  numTemplateOpens = 0;

  view: any = 'month';
  viewDate: Date = new Date();
  totalEvents = 0;

  actions: CalendarEventAction[] = [
    {
      label: '<span class="text-white m-l-5">Edit</span>',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.addEvent('update', event);
      },
    },
    {
      label: '<span class="text-danger m-l-5">Delete</span>',
      onClick: ({ event }: { event: CalendarEvent }) => {
        this.deleteEvent(event.id)
      },
    },
  ];

  refresh: Subject<any> = new Subject();

  ngOnInit(): void {
    this.fetchEvents();
  }


  fetchEvents(){
    this._auth.authenticatedUser$.pipe(
      take(1),
      switchMap(user => {
        if(!user) return EMPTY;
        return this._EventService.findAll({ user : user.id })
      })
    ).pipe(
      tap(res=> this.totalEvents = res.data?.total!),
      map(res => res.data!.events.map(e => this.transformToCalendarEvent(e)))
    ).subscribe(
      res => {
        this.events = res;
      }
    )    
  }

  transformToCalendarEvent(event : EventModel) : CalendarEvent{
    return {
      start: new Date(event.startDate),
      end: addDays(new Date(event.endDate), 0),
      color : event.color ? { primary : event.color, secondary : '#5d87ff' } : { primary : '#5d87ff', secondary : '#5d87ff' },
      draggable : true,
      title : event.title,
      actions : this.actions,
      id : event._id,
    }
  }

  activeDayIsOpen = true;

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
        this.viewDate = date;
      }
    }
  }

  eventTimesChanged({
    event,
    newStart,
    newEnd,
  }: CalendarEventTimesChangedEvent): void {
    this._EventService.update(event.id, { startDate : newStart, endDate: newEnd }).subscribe(
      (res : any) => {
        this.events = this.events.map((iEvent) => {
          if (iEvent === event) {
            return {
              ...event,
              start: newStart,
              end: newEnd,
            };
          }
          return iEvent;
        });
      }
    )
  }

  handleEvent(action: string, event: CalendarEvent): void {
    this.config.data = { event, action };
    this.dialogRef = this.dialog.open(AddCalendarEventDialogComponent, this.config);

    this.dialogRef.afterClosed().subscribe((result: string) => {
      this.lastCloseResult = result;
      this.dialogRef = Object.create(null);
      this.refresh.next(result);
    });
  }

  addEvent(action : string, obj : any) {
    obj.action = action;
    this.dialogRef2 = this.dialog.open(AddCalendarEventDialogComponent, {
      panelClass: 'calendar-form-dialog',
      data: { action: action, data : obj },
    });
    this.dialogRef2.afterClosed().subscribe((result) => {      
      
      if(result.action == 'add'){
        this.events = [...this.events, this.transformToCalendarEvent(result.data)]
      }
      if(result.action == 'update'){
        const index = this.events.findIndex(e => e.id === result.data._id);
        this.events[index] = this.transformToCalendarEvent(result.data);
      }
      this.dialogRef2 = Object.create(null);
      this.refresh.next(result);
    });
  }

  deleteEvent(id: any): void {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, { data : id });
    dialogRef.afterClosed().subscribe((result) => {
      if(!result && !result.event) return;
      if(result.event.answer == false) return;
      this._EventService.delete(result.event.data).subscribe(
        (res : any) => {
          this._message.showSuccessMessage(res.message);
          this.events = this.events.filter(c => c.id !== res.data!._id);
          this.refresh.next(result);
        }
      )
    })
  }

  setView(view: CalendarView): void {
    this.view = view;
  }
}

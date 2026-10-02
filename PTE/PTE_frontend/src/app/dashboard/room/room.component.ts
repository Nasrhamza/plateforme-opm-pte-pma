import { Component, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { CalendarOptions, DateSelectArg, EventApi, EventClickArg, EventInput } from '@fullcalendar/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Room } from 'src/app/core/models/room';
import { RoomEvent } from 'src/app/core/models/roomEvent';
import { RoomServiceService } from 'src/app/core/service/room-service.service';
import Swal from 'sweetalert2';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { AddRoomModalComponent } from './add-room-modal/add-room-modal.component';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import { AddRoomEventModalComponent } from './add-room-event-modal/add-room-event-modal.component';
import { EventInfoRoomModalComponent } from './event-info-room-modal/event-info-room-modal.component';
import { EventInfoModalComponent } from '../vehicle/event-info-modal/event-info-modal.component';
import { EditRoomModalComponent } from './edit-room-modal/edit-room-modal.component';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss'],
  providers: [ToastrService],

})
export class RoomComponent {
  @ViewChild('calendar', { static: false })
  dialogTitle!: string
  isEditClick?: boolean;
  roomEventForm!: UntypedFormGroup;
  roomEvent!: RoomEvent | null;
  eventWindow?: TemplateRef<any>;
  calendarData!: RoomEvent;
  calendarEvents!: EventInput[];
  rooms!:Room[]
  showCalendar!: boolean;
  selectedRoom!:Room | null
  Events: any[]=[];
  tempEvents: any[]=[];
  currentEvents: EventApi[] = [];
  role=""
  constructor(
    private fb: UntypedFormBuilder,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private roomService:RoomServiceService
  ) {
    this.dialogTitle = 'Add New Event';    
  }
  public ngOnInit(): void {
    this.showCalendar==false
    this.getRooms()
    //this.Events
    this.role=localStorage.getItem('roles')!.toString()

  }
  ToggleCalendar(room: Room) {
    if (!this.showCalendar) {
      this.showCalendar = true
      this.selectedRoom=room
      this.getEvent(this.selectedRoom._id);
      // setInterval(() => {
        // this.getEvent(this.selectedRoom!._id); // Periodic data refresh
      // }, 5000); // Refresh every 60 seconds
    }
    else {
      this.showCalendar = false
      this.showCalendar =true
      this.selectedRoom=room
      this.getEvent(this.selectedRoom._id);
      // setInterval(() => {
        // this.getEvent(this.selectedRoom!._id); // Periodic data refresh
      // }, 5000); // Refresh every 60 seconds
    }
  }
  deleteRoom(roomID:string){
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: false
    })

    swalWithBootstrapButtons.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: false,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({title:'Deleted!',text: 'Room has been deleted.',icon:'success',confirmButtonColor: '#47A992',});
      this.roomService.deleteRoom(roomID).subscribe(resultat => {
        this.rooms = this.rooms.filter(r => r._id !== roomID);
      })
  }else if (
    /* Read more about handling dismissals below */
    result.dismiss === Swal.DismissReason.cancel
  ) {
    Swal.fire({
      title:'Cancelled',
      text:'Room is safe :)',
      icon:'warning',
      confirmButtonColor: '#47A992',
    }
    )
  }
})}

    editRoomWindowCall(room:Room) {
      const modalRef: NgbModalRef = this.modalService.open(EditRoomModalComponent, {
        ariaLabelledBy: 'modal-basic-title',
        size: 'lg',
        keyboard: false ,
        backdropClass:'light-blue-backdrop'
      });
      modalRef.componentInstance.payload=room
      modalRef.result.then((res)=>{
        this.getRooms()
      })
    }

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
    },
    initialView: "dayGridMonth",
    weekends: true,
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    select: this.handleDateSelect.bind(this),
    eventClick: this.handleEventClick.bind(this),
    eventsSet: this.handleEvents.bind(this),
    events:[]
  };

  getEvent(Rid:any){ 
    this.roomService.getRoomEvents(Rid).subscribe(resultat => {
            this.Events = resultat as any
            this.Events.forEach(event => {
              let roomEvents = {
                id: event._id,
                title: event.title,
                start: event.start,
                end: event.end,
                room: this.selectedRoom!._id,
                applicant: event.applicant,
                classNames: ['fc-event-primary']
              }
              this.tempEvents.push(roomEvents);
            })
            this.calendarOptions.events=this.tempEvents
            this.Events=this.tempEvents
            this.tempEvents=[]
           
          })
  }


  handleEventClick(clickInfo: EventClickArg) {
    this.eventClick(clickInfo);
  }

  eventClick(row:any) {
   
    const modalRef: NgbModalRef = this.modalService.open(EventInfoRoomModalComponent, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg',
      keyboard: false ,
      backdropClass:'light-blue-backdrop'
    });
    modalRef.componentInstance.payload=row.event.id;
    modalRef.result.then((res)=>{
      this.getEvent(this.selectedRoom?._id)
    })       
  }

  handleEvents(events: EventApi[]) {
    this.currentEvents = events;
  }
    
  handleDateSelect(info: DateSelectArg) {
    const modalRef = this.modalService.open(AddRoomEventModalComponent, {
            ariaLabelledBy: 'modal-basic-title',
            size: 'lg',
            keyboard: false,
            backdropClass: 'light-blue-backdrop'
          });
          modalRef.componentInstance.data = info.startStr
          modalRef.componentInstance.room = this.selectedRoom
          modalRef.result.then((res)=>{
            this.getEvent(this.selectedRoom?._id)
          })
        }
  
 
  eventWindowCall(data:string) {
    // const modalRef: NgbModalRef = this.modalService.open(AddEventModalComponent, {
    //   ariaLabelledBy: 'modal-basic-title',
    //   size: 'lg',
    //   keyboard: false ,
    //   backdropClass:'light-blue-backdrop'
    // });
    // modalRef.componentInstance.title="Add event"
    // modalRef.componentInstance.data=data
  }

  @ViewChild('calendar') calendarComponent!:FullCalendarComponent ;
  addRoomWindowCall() {
    const modalRef: NgbModalRef = this.modalService.open(AddRoomModalComponent, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg',
      keyboard: false ,
      backdropClass:'light-blue-backdrop'
    });
    modalRef.componentInstance.title="Add Room"
    modalRef.result.then((res)=>{
      this.getRooms()
    })
  }

  createCalendarForm(roomEvent: RoomEvent): UntypedFormGroup {
    return this.fb.group({
      title: [roomEvent.title, [Validators.required]],
      start: [roomEvent.start, [Validators.required]],
      end: [roomEvent.end, [Validators.required]],
      room:[roomEvent.room,[Validators.required]],
      isAccepted:true
    });
  }

  getRooms(){
    return this.roomService.getRooms().subscribe(resultat => {
      this.rooms=resultat as Room[]
    })
  }

  
  showNotification(
    eventType: string,
    message: string,
    ypos: string,
    xpos: string
  ) {
    if (eventType === 'success') {
      this.toastr.success(message, '', {
        positionClass: 'toast-' + ypos + '-' + xpos,
      });
    }
  }
}

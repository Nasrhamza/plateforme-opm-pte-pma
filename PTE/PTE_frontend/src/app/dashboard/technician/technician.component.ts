import { Component, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { CalendarOptions, DateSelectArg, EventApi, EventClickArg, EventInput } from '@fullcalendar/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { User } from 'src/app/core/models/user';
import Swal from 'sweetalert2';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { TechEvent } from 'src/app/core/models/techEvent';
import { UserServiceService } from 'src/app/core/service/user-service.service';
import { EventInfoTechModalComponent } from './event-info-tech-modal/event-info-tech-modal.component';
import { TechPersonalDetailsModalComponent } from './tech-personal-details-modal/tech-personal-details-modal.component';
import { AddTechnicianEventModalComponent } from './add-technician-event-modal/add-technician-event-modal.component';
import { environment } from 'src/environments/environment';
import { LogModalComponent } from './log-modal/log-modal.component';
@Component({
  selector: 'app-technician',
  templateUrl: './technician.component.html',
  styleUrls: ['./technician.component.scss'],
  providers: [ToastrService],
})
export class TechnicianComponent {
  @ViewChild('calendar', { static: false })
   picsUrl = "https://pte-backend.prologic.com.tn:3001/images/";

  dialogTitle!: string
  isEditClick?: boolean;
  techEventForm!: UntypedFormGroup;
  techEvent!: TechEvent | null;
  eventWindow?: TemplateRef<any>;
  calendarData!: TechEvent;
  calendarEvents!: EventInput[];
  technicians!:User[]
  showCalendar!: boolean;
  selectedTech!:User | null
  Events: any[]=[];
  tempEvents: any[]=[];
  currentEvents: EventApi[] = [];
  userRole!:string
  constructor(
    private fb: UntypedFormBuilder,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private techService:UserServiceService
  ) {
    this.dialogTitle = 'Add New Event';    
  }
  public ngOnInit(): void {
    this.showCalendar==false
    this.getTechnicians()
    this.userRole= localStorage.getItem('roles')!

  }
  ToggleCalendar(tech: User) {
    if (!this.showCalendar) {
      this.showCalendar = true
      this.selectedTech=tech
      this.getEvent(this.selectedTech._id);
      // setInterval(() => {
      //   this.getEvent(this.selectedTech!._id); // Periodic data refresh
      // }, 5000); // Refresh every 60 seconds
    }
    else {
      this.showCalendar = false
      this.showCalendar =true
      this.selectedTech=tech
      this.getEvent(this.selectedTech._id);
      // setInterval(() => {
      //   this.getEvent(this.selectedTech!._id); // Periodic data refresh
      // }, 5000); // Refresh every 5 seconds
    }
  }
//   deleteRoom(roomID:string){
//     const swalWithBootstrapButtons = Swal.mixin({
//       customClass: {
//         confirmButton: 'btn btn-success',
//         cancelButton: 'btn btn-danger'
//       },
//       buttonsStyling: false
//     })

//     swalWithBootstrapButtons.fire({
//       title: 'Are you sure?',
//       text: "You won't be able to revert this!",
//       icon: 'warning',
//       showCancelButton: false,
//       confirmButtonText: 'Yes, delete it!',
//       cancelButtonText: 'No, cancel!',
//       reverseButtons: true
//     }).then((result) => {
//       if (result.isConfirmed) {
//         Swal.fire({title:'Deleted!',text: 'Technician has been deleted.',icon:'success',confirmButtonColor: '#47A992',});
//       this.techService.deleteTech(techID).subscribe(resultat => {
//         this.technicians = this.technicians.filter(r => r._id !== techID);
//       })
//   }else if (
//     /* Read more about handling dismissals below */
//     result.dismiss === Swal.DismissReason.cancel
//   ) {
//     Swal.fire({
//       title:'Cancelled',
//       text:'Technician is safe :)',
//       icon:'warning',
//       confirmButtonColor: '#47A992',
//     }
//     )
//   }
// })}

    // editRoomWindowCall(tech:User) {
    //   const modalRef: NgbModalRef = this.modalService.open(EditRoomModalComponent, {
    //     ariaLabelledBy: 'modal-basic-title',
    //     size: 'lg',
    //     keyboard: false ,
    //     backdropClass:'light-blue-backdrop'
    //   });
    //   modalRef.componentInstance.payload=tech
      
    // }

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

  getEvent(Tid:any){ 
    this.techService.getTechEvents(Tid).subscribe(resultat => {
            this.Events = resultat as any
            this.Events.forEach(event => {
              let techEvents = {
                id: event._id,
                title: event.title,
                start: event.start,
                end: event.end,
                engineer: this.selectedTech!._id,
                applicant: event.applicant,
                classNames: ['fc-event-primary']
              }
              this.tempEvents.push(techEvents);
            })
            this.calendarOptions.events=this.tempEvents
            this.Events=this.tempEvents
            this.tempEvents=[]
           
          })
  }


  handleEventClick(clickInfo: EventClickArg) {
    this.eventClick(clickInfo);
  }
  seeTechPersonalDetails(tech:User){
    const modalRef: NgbModalRef = this.modalService.open(TechPersonalDetailsModalComponent, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg',
      keyboard: false ,
      backdropClass:'light-blue-backdrop'
    });
    modalRef.componentInstance.payload=tech;        
  }
  eventClick(row:any) {
   
    const modalRef: NgbModalRef = this.modalService.open(EventInfoTechModalComponent, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg',
      keyboard: false ,
      backdropClass:'light-blue-backdrop'
    });
    modalRef.componentInstance.payload=row.event.id;
    modalRef.result.then((res)=>{
      this.getEvent(this.selectedTech?._id)
    })               
  }

  handleEvents(events: EventApi[]) {
    this.currentEvents = events;
  }
    
  handleDateSelect(info: DateSelectArg) {
    const modalRef = this.modalService.open(AddTechnicianEventModalComponent, {
            ariaLabelledBy: 'modal-basic-title',
            size: 'xl',
            keyboard: false,
            backdropClass: 'light-blue-backdrop'
          });
          modalRef.componentInstance.data = info.start
          // console.log(info,info.start) 
          modalRef.componentInstance.tech = this.selectedTech
          modalRef.result.then((res)=>{
            this.getEvent(this.selectedTech?._id)
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
  // addRoomWindowCall() {
  //   const modalRef: NgbModalRef = this.modalService.open(AddRoomModalComponent, {
  //     ariaLabelledBy: 'modal-basic-title',
  //     size: 'lg',
  //     keyboard: false ,
  //     backdropClass:'light-blue-backdrop'
  //   });
  //   modalRef.componentInstance.title="Add Technician"
    
  // }

  createCalendarForm(techEvent: TechEvent): UntypedFormGroup {
    return this.fb.group({
      title: [techEvent.title, [Validators.required]],
      start: [techEvent.start, [Validators.required]],
      end: [techEvent.end, [Validators.required]],
      engineer:[techEvent.engineer,[Validators.required]],
      job:[techEvent.job,[Validators.required]],
      address:[techEvent.address,[Validators.required]],
      applicant:[techEvent.applicant,[Validators.required]],
      isAccepted:true
    });
  }

  getTechnicians(){
    return this.techService.getEmployees().subscribe(resultat => {
      this.technicians=resultat as User[]
      // console.log(this.technicians)
      if (this.userRole!=="ASSISTANT"){
        this.technicians = this.technicians.filter(row => row._id === localStorage.getItem('userId'));
      }else{
        this.technicians = this.technicians.filter(row => row._id !== localStorage.getItem('userId'));
      }
    })
  }
  openLogModal(){
    const modalRef = this.modalService.open(LogModalComponent, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg',
      keyboard: false,
      backdropClass: 'light-blue-backdrop'
    });
    modalRef.componentInstance.payload=this.technicians
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

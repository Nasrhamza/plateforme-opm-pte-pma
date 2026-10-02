import { Component, HostListener, TemplateRef, ViewChild } from '@angular/core';
import { EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import { VehicleEvent } from 'src/app/core/models/vehicleEvent';
import {
  CalendarOptions,
  DateSelectArg,
  EventClickArg,
  EventApi,
} from '@fullcalendar/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { UntypedFormBuilder,
  UntypedFormGroup,
  Validators,} from '@angular/forms';
import { AddEventModalComponent } from './add-event-modal/add-event-modal.component';
import { VehicleServiceService } from 'src/app/core/service/vehicle-service.service';
import { Vehicle } from 'src/app/core/models/vehicle';
import Swal from 'sweetalert2';
import { EditVehicleModalComponent } from './edit-vehicle-modal/edit-vehicle-modal.component';
import { AddVehicleModalComponent } from './add-vehicle-modal/add-vehicle-modal.component';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { EventInfoModalComponent } from './event-info-modal/event-info-modal.component';
import { GasCardComponent } from './gas-card/gas-card.component';
import { VehicleStatComponent } from './vehicle-stat/vehicle-stat.component';
import { SortType } from '@swimlane/ngx-datatable';

@Component({
  selector: 'app-vehicle',
  templateUrl: './vehicle.component.html',
  styleUrls: ['./vehicle.component.scss'],
  providers: [ToastrService],

})
export class VehicleComponent {
  @ViewChild('calendar', { static: false })

    temp: any[] = [];
    loadingIndicator! :boolean
    reorderable = true;
    SortType = SortType;
    scrollBarHorizontal = window.innerWidth < 1200;
  dialogTitle!: string
  isEditClick?: boolean;
  vehicleEventForm!: UntypedFormGroup;
  vehicleEvent!: VehicleEvent | null;
  eventWindow?: TemplateRef<any>;
  calendarData!: VehicleEvent;
  calendarEvents!: EventInput[];
  vehicles!:Vehicle[]
  showCalendar!: boolean;
  showStat!: boolean;
  selectedVehicle!:any 
  vehicle!:any 
  Events: any[]=[];
  tempEvents: any[]=[];
  currentEvents: EventApi[] = [];
  role=""
  table: any;
  //userRole=""
  constructor(
    private fb: UntypedFormBuilder,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private vehicleService:VehicleServiceService
  ) {
    this.dialogTitle = 'Add New Event';    
  }
  public ngOnInit(): void {
    this.showCalendar==false
    this.getVehicles()
    this.role=localStorage.getItem('roles')!.toString()
  }
  ToggleCalendar(vehicle: Vehicle) {
    if (!this.showCalendar) {
      this.showCalendar = true
      this.selectedVehicle=vehicle
      this.getEvent(this.selectedVehicle._id);
      // setInterval(() => {
        this.getEvent(this.selectedVehicle!._id); 
      // }, 500); 
    }
    else {
      this.showCalendar = false
      this.showCalendar =true
      this.selectedVehicle=vehicle
      this.getEvent(this.selectedVehicle._id);
      // setInterval(() => {
        this.getEvent(this.selectedVehicle!._id); 
      // }, 500);
    }
  }

  deleteVehicle(vehicleID:string){
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
        Swal.fire({title:'Deleted!',text: 'Vehicle has been deleted.',icon:'success',confirmButtonColor: '#47A992',});
      this.vehicleService.deleteVehicle(vehicleID).subscribe(resultat => {
        this.vehicles = this.vehicles.filter(r => r._id !== vehicleID);
      })
  }else if (
    /* Read more about handling dismissals below */
    result.dismiss === Swal.DismissReason.cancel
  ) {
    Swal.fire({
      title:'Cancelled',
      text:'Vehicle is safe :)',
      icon:'warning',
      confirmButtonColor: '#47A992',
    }
    )
  }
})}

  editVehicleWindowCall(vehicle:Vehicle) {
      const modalRef: NgbModalRef = this.modalService.open(EditVehicleModalComponent, {
        ariaLabelledBy: 'modal-basic-title',
        size: 'lg',
        keyboard: false ,
        backdropClass:'light-blue-backdrop'
      });
      modalRef.componentInstance.payload=vehicle
      modalRef.result.then((res)=>{
        this.getVehicles()
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

  getEvent(Vid:any){
    this.vehicleService.getVehicleEvents(Vid).subscribe(resultat => {
            this.Events = resultat as any
            this.Events.forEach(event => {
              let vehicleEvents = {
                id: event._id,
                title: event.title,
                start: event.start,
                end: event.end,
                vehicle: this.selectedVehicle!._id,
                driver: event.driver,
                applicant: event.applicant,
                destination: event.destination,
                classNames: ['fc-event-primary']
              }
              this.tempEvents.push(vehicleEvents);
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
    const modalRef: NgbModalRef = this.modalService.open(EventInfoModalComponent, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg',
      keyboard: false ,
      backdropClass:'light-blue-backdrop'
    });
    modalRef.componentInstance.payload=row.event.id;        
    modalRef.componentInstance.payloadObject=row.event;
    modalRef.result.then((res)=>{
      this.getEvent(this.selectedVehicle?._id)
    })        
  }

  handleEvents(events: EventApi[]) {
    this.currentEvents = events;
  }
    
  handleDateSelect(info: DateSelectArg) {
    const modalRef = this.modalService.open(AddEventModalComponent, {
            ariaLabelledBy: 'modal-basic-title',
            size: 'lg',
            keyboard: false,
            backdropClass: 'light-blue-backdrop'
          });
          modalRef.componentInstance.data = info.startStr
          modalRef.componentInstance.vehicle = this.selectedVehicle
          modalRef.result.then((res)=>{
            this.getEvent(this.selectedVehicle?._id)
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
  addVehicleWindowCall() {
    const modalRef: NgbModalRef = this.modalService.open(AddVehicleModalComponent, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg',
      keyboard: false ,
      backdropClass:'light-blue-backdrop'
    });
    modalRef.componentInstance.title="Add Vehicle"
    modalRef.result.then((res)=>{
      this.getVehicles()
    })
  }

  createCalendarForm(vehicleEvent: VehicleEvent): UntypedFormGroup {
    return this.fb.group({
      title: [vehicleEvent.title, [Validators.required]],
      start: [vehicleEvent.start, [Validators.required]],
      end: [vehicleEvent.end, [Validators.required]],
      destination: [vehicleEvent.destination,[Validators.required]],
      driver:[vehicleEvent.driver,[Validators.required]],
      vehicle:[vehicleEvent.vehicle,[Validators.required]],
      isAccepted:true
    });
  }

  getVehicles(){
    return this.vehicleService.getVehicles().subscribe(resultat => {
      this.vehicles=resultat as Vehicle[]
      // this.vehicles = this.vehicles.filter(car => car.available)
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
  

  showCard(vehicle:any){
    const modalRef: NgbModalRef = this.modalService.open(GasCardComponent, {
      size: 'md',
      keyboard: false ,
      windowClass: 'dark-modal',
      centered: true,
    });
    modalRef.componentInstance.payload=vehicle
    modalRef.result.then((res)=>{
      this.getVehicles()
    })
  }
  showVehicleStat(vehicleID:any){
    this.selectedVehicle = vehicleID
    this.showStat = true
    this.showCalendar = false
    this.vehicleService.getVehicleById(vehicleID).subscribe(res=>{
      this.vehicle=res
      this.temp = res;
    })
  }
    @HostListener('window:resize', ['$event'])
    onResize(event: any) {
      this.scrollBarHorizontal = window.innerWidth < 1200;
      this.table.recalculate();
      this.table.recalculateColumns();
    }
  
    getRowHeight(row: any) {
      return row.height;
    }
  showAssociatedEvent(event : any){
const modalRef: NgbModalRef = this.modalService.open(EventInfoModalComponent, {
      size: 'xl',
      keyboard: false ,
      windowClass: 'dark-modal',
      centered: true,
    });
    modalRef.componentInstance.payload=event._id
    modalRef.result.then((res)=>{
      this.getVehicles()
    })
  }

  toggleAvailability(vehicle: any) {
    this.vehicleService.toggleAvailability(vehicle._id).subscribe(
      (updatedVehicle) => {
        // Update the local vehicle object
        vehicle.available = updatedVehicle.available;
      },
      (error) => {
        console.error('Error toggling availability:', error);
      }
    );
  }
}

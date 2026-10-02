import { Component, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { User } from 'src/app/core/models/user';
import { Vehicle } from 'src/app/core/models/vehicle';
import { UserServiceService } from 'src/app/core/service/user-service.service';
import { VehicleServiceService } from 'src/app/core/service/vehicle-service.service';
import { format } from 'date-fns';
import { latLng, tileLayer, Map, Marker } from 'leaflet';
@Component({
  selector: 'app-add-event-modal',
  templateUrl: './add-event-modal.component.html',
  styleUrls: ['./add-event-modal.component.scss'],
  providers:[ToastrService]

})
export class AddEventModalComponent {
  active!: number;
  marker!: Marker;
  map: Map | undefined;
  mapOptions = {
    layers: [
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {})
    ],
    zoom: 13,
    center: latLng(36.805691792048506, 10.182715946838245) // Default center (London)
  };




  forProject:boolean = false;
  forTicket:boolean = false;

  existCase:boolean = false;
  forOther:boolean = false;
  isEmpty:boolean = false;
  isTicketInProgress:boolean = false;
  outputRES:string = "";
  validTicket:boolean = false;

  @Input("data") data!:any
  @Input("vehicle") vehicle!:Vehicle
  vehicleEventForm!: FormGroup;
  vehicleEventFailed!:boolean
  submitted = false;
  error = '';
  drivers!:User[]
  vehicles!: Vehicle[]
  users!:User[]
  selectedDate!:any
  currentUserEmail!:any
  user!:any
  constructor(public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private vehicleService:VehicleServiceService,
    private userService:UserServiceService,
    private toastr: ToastrService) {}
  ngOnInit(){
        // console.log(this.outputRES)

    this.selectedDate=format(new Date(this.data),"MM/dd/yyy HH:mm")
    
    this.getDrivers()
    this.getVehicles()
    this.getCurrentUserEmail()
    //console.log(this.selectedDate)
    this.vehicleEventForm = new FormGroup({
     title :new FormControl('',[Validators.required]),
     start:new FormControl(this.selectedDate,[Validators.required]),
     end:new FormControl('',[Validators.required]),
     driver:new FormControl('',[Validators.required]),
     //vehicle:new FormControl('',[Validators.required]),
     destination:new FormControl('',[Validators.required]),
  });
  }

  onMapReady(map: Map) {
    this.map = map;
    // Add a marker to the map
    this.marker = new Marker(latLng(36.805691792048506, 10.182715946838245), {
      draggable: true
    }).addTo(this.map);
    this.getUserLocation();
    // Update the form control when the marker is moved
    this.marker.on('dragend', () => {
      const latLng = this.marker.getLatLng();
      this.vehicleEventForm.get('destination')!.setValue(`${latLng.lat}, ${latLng.lng}`);
    });
     // Remove the attribution control
    map.attributionControl.remove();
  }

  getUserLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;

          // Center the map on the user's location
          this.map!.setView([userLat, userLng], 13);

          // Add a marker at the user's location
          this.marker = new Marker([userLat, userLng], {
            draggable: true // Make the marker draggable
          }).addTo(this.map!);

          // Set the initial value of the destination form control
          this.vehicleEventForm.get('destination')!.setValue(`${userLat}, ${userLng}`);

          // Update the form control when the marker is dragged
          this.marker.on('dragend', () => {
            const latLng = this.marker.getLatLng();
            this.vehicleEventForm.get('destination')!.setValue(`${latLng.lat}, ${latLng.lng}`);
          });
        },
        (error) => {
          console.error('Error getting user location:', error);
          alert('Unable to retrieve your location. Using default location.');
          this.setDefaultLocation();
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
      alert('Geolocation is not supported by your browser. Using default location.');
      this.setDefaultLocation();
    }
  }
  setDefaultLocation() {
    const defaultLat = 51.505;
    const defaultLng = -0.09;

    // Center the map on the default location
    this.map!.setView([defaultLat, defaultLng], 13);

    // Add a marker at the default location
    this.marker = new Marker([defaultLat, defaultLng], {
      draggable: true // Make the marker draggable
    }).addTo(this.map!);

    // Set the initial value of the destination form control
    this.vehicleEventForm.get('destination')!.setValue(`${defaultLat}, ${defaultLng}`);

    // Update the form control when the marker is dragged
    this.marker.on('dragend', () => {
      const latLng = this.marker.getLatLng();
      this.vehicleEventForm.get('destination')!.setValue(`${latLng.lat}, ${latLng.lng}`);
    });
  }

  getCurrentUserEmail(){
    this.userService.getUserById(localStorage.getItem('userId')!).subscribe(res=>{
      this.user = res
      this.currentUserEmail = this.user.email;
    })
  }
  injectValues(){
    this.vehicleEventForm.get('vehicle')?.setValue([this.vehicle.model, "||", this.vehicle.registration_number])
  }
  getDrivers(){
    return this.userService.getAllDrivers().subscribe(resultat => {
        this.drivers=resultat as User[]
        //console.log(this.drivers)
      })
  }
  getVehicles(){
    return this.vehicleService.getVehicles().subscribe(resultat => {
        this.vehicles=resultat as Vehicle[]
         //console.log(this.vehicles)
      })
  }
  handleCaseNumber(event: any) {
    const CN: string = event.target.value;
  
    if (CN.length === 0) {
      this.isEmpty = true;
      this.outputRES = '';
    } else {
      this.isEmpty = false;
      this.vehicleService.checkCaseNumberRelatedToCurrentUser(this.currentUserEmail, CN)
        .subscribe((res: any) => {
          if (res.err) {
            this.outputRES = res.message;
          } else {
            this.outputRES = '';
          }
          if(!res.technicianExist){
            this.forOther = true;
            this.outputRES = 'This case is not assigned to you. please check your case number!';
          }
          if(!res.ticketExist){
            this.existCase = true;
            this.outputRES = 'This case is not found. please check your case number!';
          }
          if(res.ticketExist && res.technicianExist && !res.err){
            this.validTicket = true
          }else {
            this.validTicket = false
          }
        });
    }
  }
  
  onSubmit(vehicleEventForm:FormGroup){
    this.submitted = true;
    this.error = '';
    if (vehicleEventForm.invalid) {
      this.error = 'Invalid data !';
      this.submitted= false;
      return;
    } else if(this.vehicleEventForm.value.start>this.vehicleEventForm.value.end){
          this.toastr.error('Invalid date rang', "Error")
        }else {
        const vehicleEvent = {
          title: this.vehicleEventForm.value.title,
          start: this.vehicleEventForm.value.start,
          end: this.vehicleEventForm.value.end,
          vehicle: this.vehicle._id,
          driver: this.vehicleEventForm.value.driver,
          destination: this.vehicleEventForm.value.destination,
          applicant: localStorage.getItem("userId"),
        };
        
      this.vehicleService.addEvent(vehicleEvent).subscribe(resultat=>{
        this.toastr.success('Event added successfully', "Success")
        this.activeModal.close("Event added successfully");
      })
      //console.log(vehicleEventForm.value)
    }
    
  }
  
}

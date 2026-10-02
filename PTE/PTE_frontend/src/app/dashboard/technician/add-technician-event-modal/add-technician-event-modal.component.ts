import { Component, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { User } from 'src/app/core/models/user';
import { UserServiceService } from 'src/app/core/service/user-service.service';
import { VehicleServiceService } from 'src/app/core/service/vehicle-service.service';
import { latLng, tileLayer, Map, Marker, LatLng, polyline, Polyline, Icon } from 'leaflet';
import axios from 'axios';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-add-technician-event-modal',
  templateUrl: './add-technician-event-modal.component.html',
  styleUrls: ['./add-technician-event-modal.component.scss'],
  providers: [ToastrService]

})
export class AddTechnicianEventModalComponent {
  readonly picsUrl = environment.PICSURL;

  forProject: boolean = false;
  forTicket: boolean = false;

  existCase: boolean = false;
  forOther: boolean = false;
  isEmpty: boolean = false;
  isTicketInProgress: boolean = true;
  outputRES: string = "";
  validTicket: boolean = false;
  validTask: boolean = false;
  validProjectDates: boolean = false;
  caseNumber!: string
  routeLayer!: Polyline | any; // Polyline layer for the route
  userMarker!: Marker;
  destinationMarker!: Marker | any;
  map: Map | undefined;
  mapOptions = {
    layers: [
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {})
    ],
    zoom: 13,
    center: latLng(36.805691792048506, 10.182715946838245) // Default center (London)
  };
  mapDestination!: string | any
  destinationCoords: { lat: number; lng: number } | null = null;
  distance: number | null = null; // Distance in meters
  needCar: boolean = false;
  destinationAddress!: string
  departureAddress!: string
  drivers!: User[]
  filteredDrivers!: User[]
  vehicles!: any[]
  user!: any
  currentUserEmail!: any
  @Input("data") data!: any
  @Input("tech") tech!: any
  EventForm!: FormGroup;
  techEventFailed!: boolean
  submitted = false;
  error = '';
  selectedDate!: any
  selectedcar!: any
  selectedDriver!: any
  endDateValue!: any
  carEventId!: any


  startDateForProject!: any
  endDateForProject!: any

  projects!: any[]
  tasks!: any[]
  selectedProjectId: string = '';
  selectedTaskId: string = '';

  pmaData!: any[]

  constructor(public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private techService: UserServiceService,
    private vehicleService: VehicleServiceService,
    private userService: UserServiceService,
    private toastr: ToastrService) { }
  ngOnInit() {
    this.getCurrentUserEmail()
    this.initForm()
    this.selectedDate = this.formatDateTimeForInput(this.data);
    this.startDateForProject = this.formatDateTimeForInput(this.data);
    this.endDateForProject = this.formatDateTimeForInput(this.data);
    this.endDateChanges()
    this.getDrivers()
  }
  endDateChanges() {
    this.EventForm.get('end')?.valueChanges.subscribe((value) => {
      if (value) {
        this.endDateValue = value
        this.getAvailableCars(); // Call the method when End Date is filled
      }
    });
  }
  onDriverSelect(selectedDriverId: any): void {
    if (this.needCar) {
      this.selectedDriver = this.drivers.find(driver => driver._id === selectedDriverId._id);
    }
  }
  getDrivers() {
    return this.userService.getAllDrivers().subscribe(resultat => {
      this.drivers = resultat as User[];
      this.filteredDrivers = this.drivers.filter(driver => driver.roles![0] !== 'ADMIN');
      // console.log("Before sorting:", this.drivers);

      // Sort drivers by full name (firstName + lastName)
      this.drivers.sort((a, b) => {
        const nameA = `${a.firstName} ${a.lastName}`.toLowerCase(); // Combine and convert to lowercase
        const nameB = `${b.firstName} ${b.lastName}`.toLowerCase(); // Combine and convert to lowercase
        return nameA.localeCompare(nameB); // Compare names
      });

      // console.log("After sorting:", this.drivers);
    });
  }
  selectCar(carId: any) {
    this.selectedcar = carId
  }
  onProjectSelected() {
    const selectedProject = this.pmaData.find(item => item.project._id === this.selectedProjectId);
    this.tasks = selectedProject ? selectedProject.tasks : [];
  }
  // needCardYes(){
  //   this.needCar = true;
  //   // this.getVehicles()
  // }
  // needCardNo(){
  //   this.needCar = false;
  // }
  // getVehicles(){
  //   this.vehicleService.getVehicles().subscribe(res => {
  //     this.vehicles = res
  //     console.log(this.vehicles)
  //   })
  // }
  initForm() {
    this.EventForm = new FormGroup({
      title: new FormControl('', [Validators.required]),
      start: new FormControl('', [Validators.required]),
      end: new FormControl('', [Validators.required]),
      job: new FormControl('', [Validators.required]),
    });
  }
  injectValues() {
    //this.EventForm.get('room')?.setValue([this.room.label, "||", this.room.location])
  }
  formatDateTimeForInput(dateString: any) {
    // Parse the date
    let date = new Date(dateString);

    // Get the local datetime parts
    let year = date.getFullYear();
    let month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    let day = String(date.getDate()).padStart(2, '0');
    let hours = String(date.getHours()).padStart(2, '0');
    let minutes = String(date.getMinutes()).padStart(2, '0');

    // Format to datetime-local required format
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
  formatDateForInput(dateString: any) {
    // Parse the date
    let date = new Date(dateString);

    // Get the local datetime parts
    let year = date.getFullYear();
    let month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    let day = String(date.getDate()).padStart(2, '0');
    let hours = String(date.getHours()).padStart(2, '0');
    let minutes = String(date.getMinutes()).padStart(2, '0');

    // Format to datetime-local required format
    return `${year}-${month}-${day}`;
  }

  getCurrentUserEmail() {
    this.userService.getUserById(localStorage.getItem('userId')!).subscribe(res => {
      this.user = res
      this.currentUserEmail = this.user.email;
    })
  }
  handleCaseNumber(event: any) {
    const CN: string = event.target.value;
    this.caseNumber = CN
    if (CN.length === 0) {
      this.isEmpty = true;
      this.outputRES = '';
    } else if (CN.length > 3) {
      this.isEmpty = false;
      this.vehicleService.checkCaseNumberRelatedToCurrentUser(this.currentUserEmail, CN)
        .subscribe((res: any) => {
          this.destinationAddress = res.siteAddress
          if (res.err) {
            this.outputRES = res.message;
            this.validTicket = false;
          } else {
            this.outputRES = res.message;
            this.validTicket = true;
          }
          if (res.ticketExist && res.technicianExist && !res.err && this.isTicketInProgress) {
            this.validTicket = true;
            this.outputRES = '';
          } else {
            this.validTicket = false;
          }
          if (!res.err) {
            this.mapDestination = res.siteAddress
            this.EventForm.patchValue({
              title : res.clientName,
              job: res.ticketTitle,
              start: this.selectedDate
            })
          }
        });
    }
  }
  handleTaskRef(event: any) {
    const ref: string = event.target.value;
    this.caseNumber = ref;
    if (ref.length === 0) {
      this.isEmpty = true;
      this.outputRES = '';
      this.clearDestination(); // Clear existing destination
    } else if (ref.length > 3) {
      this.isEmpty = false;
      this.vehicleService.checkProjectsRelatedToCurrentUser(this.currentUserEmail, ref)
        .subscribe((res: any) => {
          this.outputRES = res.message;
          if (res.err) {
            this.outputRES = res.message;
            this.validTask = false;
            this.clearDestination(); // Clear invalid destination
          } else {
            this.outputRES = '';
            this.validTask = true;
            this.mapDestination = res.data.Project.client.address;

            // Update form values
            this.EventForm.patchValue({
              title: res.data.Project.client.fullName,
              job: res.data.Title,
              start: this.formatDateTimeForInput(res.data.StartDate),
            });

            // Update map destination
            this.updateMapDestination(res.data.Project.client.address);
          }
        });
    }
  }
  altTicket() {
    this.validTask = false
    this.forTicket = true
    this.needCar = false
    this.selectedcar  = null
    if (this.forTicket) {
      this.forProject = false
    } else {
      this.forProject = true
    }
  }
  altProject() {
    this.forProject = true
    this.validTicket = false
    this.needCar = false
    this.selectedcar  = null
    if (this.forProject) {
      this.forTicket = false
    } else {
      this.forTicket = true
    }
  }
  // onDateChange(value: any,field: 'start' | 'end') {
  //   if (field === 'start') {
  //     this.startDateForProject = value;
  //     console.log(field,value)
  //   } else {
  //     this.endDateForProject = value;
  //     console.log(field,value, new Date(Date.now()), this.currentUserEmail)
  //   }
  //   if(this.endDateForProject && this.startDateForProject){
  //     console.log(typeof this.endDateForProject)
  //   this.handleProjectTasks()

  //   }
  // }

  onSubmit(techEventForm: FormGroup) {
    this.submitted = true;
    this.error = '';
    // Get the final destination (either from mapDestination or marker position)
    const finalDestination = this.mapDestination ||
      (this.destinationMarker ?
        `${this.destinationMarker.getLatLng().lat}, ${this.destinationMarker.getLatLng().lng}` :
        null);

    if (!finalDestination) {
      this.toastr.error('Please set a destination', "Error");
      return;
    }
    // Validate distance exists
  if (this.distance === null || this.distance === undefined) {
    this.toastr.error('Please set a valid destination to calculate distance', "Error");
    return;
  }
    const techEvent = {
      title: this.EventForm.value.title,
      start: this.EventForm.value.start,
      end: this.EventForm.value.end,
      engineer: this.tech._id,
      job: this.EventForm.value.job,
      address: this.mapDestination,
      applicant: localStorage.getItem("userId"),
      caseNumber: this.caseNumber,
      departure: this.departureAddress,
      vehicleEvent: null
    };
    let vehicleEvent: any
    vehicleEvent = {
      title: this.EventForm.value.title,
      start: this.EventForm.value.start,
      end: this.EventForm.value.end,
      vehicle: this.selectedcar,
      driver: localStorage.getItem("userId"),
      destination: this.mapDestination,
      applicant: localStorage.getItem("userId"),
      caseNumber: this.caseNumber,
      km: this.distance!.toFixed(2),
      departure: this.departureAddress
    };
    if (techEventForm.invalid) {
      this.error = 'Invalid data !';
      this.submitted = false;
      return;
    }
    if (this.EventForm.value.start > this.EventForm.value.end) {
      this.toastr.error('Invalid date rang', "Error")
    }
    if (this.needCar) {
      if (!this.selectedcar) {
        this.toastr.error('Please select a car', "Error")
      }
      this.vehicleService.addEvent(vehicleEvent).subscribe(res => {
        techEvent.vehicleEvent = res._id
        this.techService.addTechEvent(techEvent).subscribe(resultat => {
          this.toastr.success('Event added successfully', "Success")
        })
        this.activeModal.close("Event added successfully");
      })
    } else {
      this.techService.addTechEvent(techEvent).subscribe(resultat => {
        this.toastr.success('Event added successfully', "Success")
        this.activeModal.close("Event added successfully");
      })
    }
  }

  getAvailableCars() {
    const data = {
      "start": this.EventForm.value.start,
      "end": this.endDateValue
    }
    this.vehicleService.checkVehicleAvailability(data).subscribe((res: any) => {
      this.vehicles = res.data
    })
  }

  onMapReady(map: Map) {
    this.map = map;
    map.attributionControl.remove();
    
    // Set default location first
    this.setDefaultLocation();
    
    // Then handle destination
    if (this.mapDestination) {
      this.geocodeAndMarkAddress(this.mapDestination);
    } else {
      // Only create if one doesn't exist
      if (!this.destinationMarker) {
        this.createDraggableDestinationMarker();
      }
    }
  }
  createDraggableDestinationMarker() {
    // Remove existing marker if any
    if (this.destinationMarker) {
      this.map?.removeLayer(this.destinationMarker);
    }
  
    const initialPos = this.userMarker?.getLatLng() || this.map!.getCenter();
  
    this.destinationMarker = new Marker(initialPos, {
      draggable: true,
      icon: new Icon({
        iconUrl: 'assets/images/destination-marker.png',
        iconSize: [36, 36],
        iconAnchor: [18, 36]
      })
    }).addTo(this.map!);
  
    this.destinationMarker.on('dragend', async () => {
      const latLng = this.destinationMarker.getLatLng();
      this.mapDestination = `${latLng.lat}, ${latLng.lng}`;
      
      if (this.userMarker) {
        this.traceRoute(this.userMarker.getLatLng(), latLng);
      }
    });
  
    // Initial trace
    if (this.userMarker) {
      this.traceRoute(this.userMarker.getLatLng(), initialPos);
    }
  }

  // New helper method to update map destination
  private updateMapDestination(address: string) {
    // Clear existing destination
    if (this.destinationMarker) {
      this.map?.removeLayer(this.destinationMarker);
      this.destinationMarker = undefined;
    }
    if (this.routeLayer) {
      this.map?.removeLayer(this.routeLayer);
      this.routeLayer = undefined;
    }

    if (address) {
      // If we have a new address, geocode it
      this.geocodeAndMarkAddress(address);
    } else {
      // If no address, create draggable marker
      this.createDraggableDestinationMarker();
    }

    // Always trace route from user's location to destination
    if (this.userMarker) {
      const destination = this.destinationMarker?.getLatLng() || this.map?.getCenter();
      if (destination) {
        this.traceRoute(this.userMarker.getLatLng(), destination);
      }
    }
  }

  // New helper method to clear destination
  private clearDestination() {
    if (this.destinationMarker) {
      this.map?.removeLayer(this.destinationMarker);
      this.destinationMarker = undefined;
    }
    if (this.routeLayer) {
      this.map?.removeLayer(this.routeLayer);
      this.routeLayer = undefined;
    }
    this.mapDestination = undefined;
  }

  // Modified geocodeAndMarkAddress to handle route tracing
  async geocodeAndMarkAddress(address: string) {
    try {
      const geocodeResponse = await axios.get(`https://nominatim.openstreetmap.org/search`, {
        params: {
          q: address,
          format: 'json',
          limit: 1
        }
      });
  
      if (geocodeResponse.data?.length > 0) {
        const lat = parseFloat(geocodeResponse.data[0].lat);
        const lng = parseFloat(geocodeResponse.data[0].lon);
        const destinationLatLng = latLng(lat, lng);
        // Clear any existing destination marker first
        if (this.destinationMarker) {
          this.map?.removeLayer(this.destinationMarker);
        }
  
        // Create new marker
        this.destinationMarker = new Marker(destinationLatLng, {
          draggable: false,
          icon: new Icon({
            iconUrl: 'assets/images/destination-marker.png',
            iconSize: [32, 32],
            iconAnchor: [16, 32]
          })
        }).addTo(this.map!);
  
        // Store coordinates
        this.mapDestination = address;
        this.destinationCoords = { lat, lng };
  
        // Trace route
        if (this.userMarker) {
          await this.traceRoute(this.userMarker.getLatLng(), destinationLatLng);
        }
        
        return true; // Success
      }
      
      // If no results found, throw error
      throw new Error('Address not found');
      
    } catch (error) {
      console.error('Error geocoding address:', error);
      this.toastr.error('Unable to find the address. Please mark destination on map.', "Error");
      
      // Only create draggable marker if one doesn't already exist
      if (!this.destinationMarker) {
        this.createDraggableDestinationMarker();
      }
      
      return false;
    }
  }

  async traceRoute(start: LatLng, end: LatLng) {
    try {
      const response = await axios.get(`https://api.openrouteservice.org/v2/directions/driving-car`, {
        params: {
          api_key: '5b3ce3597851110001cf6248987a0c87bd374ab794782a2db1baf0b0',
          start: `${start.lng},${start.lat}`,
          end: `${end.lng},${end.lat}`
        }
      });
  
      const routeCoordinates = response.data.features[0].geometry.coordinates
        .map((coord: [number, number]) => [coord[1], coord[0]]);
  
      if (this.routeLayer) {
        this.map?.removeLayer(this.routeLayer);
      }
  
      this.routeLayer = polyline(routeCoordinates, { color: 'blue' }).addTo(this.map!);
      this.map?.fitBounds(routeCoordinates);
      this.distance = this.calculateDistance(start.lat, start.lng, end.lat, end.lng);
    } catch (error) {
      console.error('Error tracing route:', error);
      this.toastr.error('Failed to trace the route. Please try again.');
    }
  }

  async setDefaultLocation() {
    const defaultLat = 36.828610;
    const defaultLng = 10.203045;
    this.map!.setView([defaultLat, defaultLng], 13);
    this.userMarker = new Marker([defaultLat, defaultLng], {
      draggable: true,
      icon: new Icon({
        iconUrl: 'assets/images/position-marker.png',
        iconSize: [36, 36],
        iconAnchor: [18, 36]
      })
    }).addTo(this.map!);
    try {
      this.departureAddress = await this.reverseGeocode(defaultLat, defaultLng);
    } catch (error) {
      // console.error('Error reverse geocoding default location:', error);
      this.toastr.error('Unable to retrieve the default address. Using coordinates instead.', "Error")

    }
    this.userMarker.on('dragend', () => {
      const latLng = this.userMarker.getLatLng();
      if (this.destinationMarker) {
        this.traceRoute(latLng, this.destinationMarker.getLatLng());
      }
    });
  }
  async reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/reverse`, {
        params: {
          lat: lat,
          lon: lng,
          format: 'json',
          zoom: 18
        }
      });
      if (response.data && response.data.display_name) {
        return response.data.display_name;
      } else {
        throw new Error('Address not found');
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      throw error;
    }
  }
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Radius of the Earth in meters
    const φ1 = (lat1 * Math.PI) / 180; // Convert latitude 1 to radians
    const φ2 = (lat2 * Math.PI) / 180; // Convert latitude 2 to radians
    const Δφ = ((lat2 - lat1) * Math.PI) / 180; // Difference in latitude
    const Δλ = ((lon2 - lon1) * Math.PI) / 180; // Difference in longitude
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c / 1000; // Distance in meters
    return distance;
  }


  // getUserLocation() {
  //   if (navigator.geolocation) {
  //     navigator.geolocation.getCurrentPosition(
  //       (position) => {
  //         const userLat = position.coords.latitude;
  //         const userLng = position.coords.longitude;

  //         // Add a marker at the user's location
  //         this.userMarker = new Marker([userLat, userLng], {
  //           draggable: false // User marker is draggable
  //         }).addTo(this.map!);

  //         // Set the initial value of the destination form control
  //         this.EventForm.get('address')!.setValue(`${userLat}, ${userLng}`);

  //         // Update the form control when the user marker is dragged
  //         this.userMarker.on('dragend', () => {
  //           const latLng = this.userMarker.getLatLng();
  //           this.EventForm.get('address')!.setValue(`${latLng.lat}, ${latLng.lng}`);

  //           // If the destination marker is available, trace the route
  //           if (this.destinationMarker) {
  //             this.traceRoute(latLng, this.destinationMarker.getLatLng());
  //           }
  //         });

  //         // If the destination marker is already available, trace the route
  //         if (this.destinationMarker) {
  //           this.traceRoute(this.userMarker.getLatLng(), this.destinationMarker.getLatLng());
  //         }
  //       },
  //       (error) => {
  //         console.error('Error getting user location:', error);
  //         alert('Unable to retrieve your location. Using default location.');
  //         this.setDefaultLocation();
  //       }
  //     );
  //   } else {
  //     console.error('Geolocation is not supported by this browser.');
  //     alert('Geolocation is not supported by your browser. Using default location.');
  //     this.setDefaultLocation();
  //   }
  // }
}

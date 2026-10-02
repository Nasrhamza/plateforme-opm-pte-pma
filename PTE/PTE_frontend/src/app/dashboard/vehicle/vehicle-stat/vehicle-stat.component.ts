import { Component, Input } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { VehicleServiceService } from 'src/app/core/service/vehicle-service.service';

@Component({
  selector: 'app-vehicle-stat',
  templateUrl: './vehicle-stat.component.html',
  styleUrls: ['./vehicle-stat.component.scss'],
  providers:[ToastrService]
})
export class VehicleStatComponent {
  @Input('payload') payload!:any
  currentUserId!:string
  vehicle!:any
  constructor(
    public activeModal: NgbActiveModal,
    public eventService:VehicleServiceService,    
    private toastr: ToastrService,
    private modalService: NgbModal,

    ) {}
  ngOnInit(): void {
    this.currentUserId=localStorage.getItem('userId')!
    this.getVehicle()
  }
  getVehicle(){
    this.eventService.getVehicleById(this.payload).subscribe(res=>{
      this.vehicle=res
      console.log(this.vehicle)
    })
  }
}

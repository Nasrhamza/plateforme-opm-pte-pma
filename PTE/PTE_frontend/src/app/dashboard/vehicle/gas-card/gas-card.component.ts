import { Component, Input } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Vehicle } from 'src/app/core/models/vehicle';
import { VehicleServiceService } from 'src/app/core/service/vehicle-service.service';

@Component({
  selector: 'app-gas-card',
  templateUrl: './gas-card.component.html',
  styleUrls: ['./gas-card.component.scss'],
    providers: [ToastrService],
  
})
export class GasCardComponent {
  @Input('payload') payload!: Vehicle; // Input payload with vehicle details
  card!: any; // Gas card details
  showTextField = false; // Controls visibility of the text field
  amount!: number; // Stores the amount entered by the user
  amountError: string | null = null; // Stores validation error messages

  constructor(
    private vehicleService: VehicleServiceService,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.getCard();
  }

  // Fetch gas card details
  getCard() {
    this.vehicleService.getVehicleCard(this.payload._id).subscribe((res: any) => {
      this.card = res.data;
    });
  }

  // Toggle the visibility of the text field
  toggleTextField() {
    this.showTextField = !this.showTextField;
    this.amount = 0; // Reset amount when toggling
    this.amountError = null; // Clear any previous errors
  }

  // Validate the amount entered by the user
  validateAmount() {
    if (this.amount === null || this.amount === undefined) {
      this.amountError = 'Please enter a valid amount.';
      return;
    }

    // Determine the maximum allowed amount based on the vehicle type
    const maxAmount = this.payload.type === 'commercial' ? 350 : 200;

    if (this.amount < 0) {
      this.amountError = 'Amount cannot be less than 0.';
    } else if (this.amount > maxAmount) {
      this.amountError = `Amount cannot exceed ${maxAmount}.`;
    } else {
      this.amountError = null; // Clear error if valid
    }
  }
  sendAmount() {
    if (this.amountError) {
      this.toastr.error('Please enter a valid amount before submitting.','Error')
      return;
    }

    if (this.amount === null || this.amount === undefined) {
      alert('Please enter a valid amount.');
      return;
    }
    const data = {
      amount: this.amount,
      card: this.card._id,
    }
    this.vehicleService.addConsumption(data).subscribe(res=>{
      this.toastr.success('Amount sent successfully','Success')
      this.amount = 0;
      this.showTextField=false
      this.getCard();
    })
  }
}
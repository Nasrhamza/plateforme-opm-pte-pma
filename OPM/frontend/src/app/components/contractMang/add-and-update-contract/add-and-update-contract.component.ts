import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SharedService } from 'src/app/services/shared.service';
import { StoreService } from 'src/app/services/store.service';
import { BackendService } from 'src/app/services/backend.service';
import Swal from 'sweetalert2';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-add-and-update-contract',
  templateUrl: './add-and-update-contract.component.html',
  styleUrls: ['./add-and-update-contract.component.scss']
})
export class AddAndUpdateContractComponent implements OnInit {
  @Input() title;
  @Input() id_folder;
  @Input() add;
  @Input() objectContract: any = {};
  showSecondSupport: boolean = false; // Initially hidden

  form: FormGroup;
  listTypeSupport;
  typeSupport: any[] = []

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    public sharedService: SharedService,
    private backendService: BackendService,
    private _store: StoreService,
    public router: Router
  ) { }

  ngOnInit() {
    this.getListSupport();

    this.form = this.fb.group({
      id: [this.objectContract?.id || '', Validators.required],
      type: [this.objectContract?.type || '', Validators.required],
      nature: [this.objectContract?.nature || '', Validators.required],
      startDate: [this.objectContract?.startDate || '', Validators.required],
      endDate: [this.objectContract?.endDate || '', Validators.required],
      sla: [this.objectContract?.sla || '', Validators.required],
      dueDate: [this.objectContract?.dueDate || '', Validators.required],
      jourInfogerance: [{ value: this.objectContract?.jourInfogerance || '', disabled: true }, Validators.required],
      listTypeSupport: this.fb.array([]),  // Initialize as an empty FormArray
    }, { validator: this.dateLessThan('startDate', 'endDate') });

    // Add support types from objectContract if available
    this.addSupportTypesFromContract();

    // Subscribe to changes in the type field
    this.form.get('type').valueChanges.subscribe((type) => {
      if (type === 'INFOGERANCE') {
        this.form.get('jourInfogerance').enable();
        this.form.get('jourInfogerance').setValidators([Validators.required]);
      } else {
        this.form.get('jourInfogerance').disable();
        this.form.get('jourInfogerance').clearValidators();
      }
      this.form.get('jourInfogerance').updateValueAndValidity();
    });
  }

  addSupportTypesFromContract() {
    if (this.objectContract?.typeSupport && this.objectContract.typeSupport.length > 0) {
      this.objectContract.typeSupport.forEach(support => {
        this.addSupportType(support.type, support.supportId);
      });
    }
  }

  // Create a form group for a support type
  createSupportGroup(type: string = '', supportId: string = ''): FormGroup {
    return this.fb.group({
      typeSupport: [type, Validators.required],
      idSupport: [supportId, Validators.required]
    });
  }

  // Get the FormArray of listTypeSupport
  get listTypeSupportArray(): FormArray {
    return this.form.get('listTypeSupport') as FormArray;
  }

  // Function to add a new support type
  addSupportType(type: string = '', supportId: string = ''): void {
    this.listTypeSupportArray.push(this.createSupportGroup(type, supportId));
  }

  // Function to remove a support type
  removeSupportType(index: number): void {
    this.listTypeSupportArray.removeAt(index);
  }

  dateLessThan(start: string, end: string) {
    return (formGroup: FormGroup) => {
      const startDateControl = formGroup.controls[start];
      const endDateControl = formGroup.controls[end];
      if (startDateControl.value && endDateControl.value && startDateControl.value >= endDateControl.value) {
        endDateControl.setErrors({ dateLessThan: true });
      } else {
        endDateControl.setErrors(null);
      }
    };
  }

  async getListSupport() {
    await this.backendService.get(`${environment.apiUrl}/typeSupport/getAllTypeSupport`).subscribe(
      (response: any) => {
        this.listTypeSupport = response.rows;
      });
  }

  Onsubmit(form: FormGroup) {
    let formData = { ...form.value };

    // Ensure empty values are converted to null
    formData.listTypeSupport.forEach((support: any) => {
      support.typeSupport = support.typeSupport || null;
      support.idSupport = support.idSupport || null;
    });

    if (this.add) {
      this._store.createContract(formData, this.id_folder).subscribe(
        (res: any) => {
          this.activeModal.close(res.rows);
          Swal.fire({
            title: 'Success!',
            text: 'The Contract has been successfully created.',
            icon: 'success',
            confirmButtonText: 'OK'
          });
        },
        (error) => {
          console.error('Error creating contract:', error);
        }
      );
    } else {
      this._store.updateContract(formData, this.objectContract._id);
      this.activeModal.close();
    }
  }
}
